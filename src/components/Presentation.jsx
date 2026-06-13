import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, animate, motion } from 'framer-motion'
import { X, ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/*
  Режим презентации. Запуск из консоли: `presentation` (или `presentation()`).
  Гид сам действует: входит в аккаунты, ищет, фильтрует, подписывается,
  ставит оценки, заполняет формы и листает страницы.
  placement 'corner' — страница показывается целиком, без затемнения.
*/

const PAD = 10
const CARD_W = 350
const MARGIN = 16
const GAP = 18
const EASE = [0.22, 1, 0.36, 1]

const clamp = (v, min, max) => Math.min(Math.max(v, min), max)

/* ── скролл с управлением (новый прерывает предыдущий) ── */

let scrollCtrl = null
const stopScroll = () => { scrollCtrl?.stop(); scrollCtrl = null }

function scrollWindowTo(targetY, duration) {
  stopScroll()
  const max = document.documentElement.scrollHeight - window.innerHeight
  const to = clamp(targetY, 0, max)
  if (Math.abs(to - window.scrollY) < 6) return Promise.resolve()
  return new Promise((resolve) => {
    scrollCtrl = animate(window.scrollY, to, {
      duration: duration ?? clamp(Math.abs(to - window.scrollY) / 1200, 0.5, 1.1),
      ease: EASE,
      onUpdate: (v) => window.scrollTo({ top: v, behavior: 'instant' }),
      onComplete: resolve,
      onStop: resolve,
    })
  })
}

const centerOf = (el) => {
  const r = el.getBoundingClientRect()
  return window.scrollY + r.top - (window.innerHeight - Math.min(r.height, window.innerHeight * 0.7)) / 2
}

function smoothScrollTo(el, align = 'center') {
  // пропускаем только элементы фиксированной шапки/модалок —
  // семантический <header> статьи скроллить нужно
  if (el.closest('.fixed')) return Promise.resolve()
  const y = align === 'top'
    ? window.scrollY + el.getBoundingClientRect().top - 110
    : centerOf(el)
  return scrollWindowTo(y)
}

/* ── виртуальный курсор гида: модульный синглтон (как scrollCtrl), позиция через transform ── */

const cursor = (() => {
  let el = null
  let anim = null
  let pos = { x: -60, y: -60 }
  const setXY = (x, y) => {
    pos = { x, y }
    if (el) el.style.transform = `translate(${x}px, ${y}px)`
  }
  return {
    attach(node) {
      el = node
      if (el) el.style.transform = `translate(${pos.x}px, ${pos.y}px)`
    },
    set: setXY,
    move(x, y) {
      if (!el) return Promise.resolve()
      el.style.opacity = '1'
      anim?.stop()
      const from = { ...pos }
      const dur = clamp(Math.hypot(x - from.x, y - from.y) / 900, 0.35, 0.7)
      return new Promise((resolve) => {
        anim = animate(0, 1, {
          duration: dur,
          ease: EASE,
          onUpdate: (t) => setXY(from.x + (x - from.x) * t, from.y + (y - from.y) * t),
          onComplete: resolve,
          onStop: resolve,
        })
      })
    },
    async press() {
      if (!el) return
      el.firstChild.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(0.6)' }, { transform: 'scale(1)' }],
        { duration: 280, easing: 'ease-out' },
      )
      el.lastChild.animate(
        [{ transform: 'scale(0.5)', opacity: 0.8 }, { transform: 'scale(2.4)', opacity: 0 }],
        { duration: 450, easing: 'ease-out' },
      )
      await new Promise((r) => setTimeout(r, 320))
    },
    hide() {
      anim?.stop()
      if (el) el.style.opacity = '0'
    },
    pauseFlight() { anim?.pause?.() },
    resumeFlight() { anim?.play?.() },
  }
})()

/* ── помощники сценария (прерываются при смене шага) ── */

function makeCtx(auth, genRef, gen, targetRef, pausedRef) {
  const guard = () => { if (genRef.current !== gen) throw new Error('tour-cancelled') }
  const tick = (ms) => new Promise((r) => setTimeout(r, ms))

  // ожидание снятия паузы (Space); отмена шага работает и в паузе
  const idle = async () => { while (pausedRef.current) { guard(); await tick(80) } }

  const sleep = async (ms) => {
    let left = ms
    while (left > 0) {
      guard()
      if (pausedRef.current) { await tick(80); continue }
      const t = Math.min(50, left)
      await tick(t)
      left -= t
    }
  }

  const waitFor = async (sel, timeout = 6000) => {
    const t0 = Date.now()
    while (Date.now() - t0 < timeout) {
      guard()
      const el = document.querySelector(sel)
      if (el) return el
      await tick(80)
    }
    throw new Error(`not-found: ${sel}`)
  }

  // подвести виртуальный курсор к центру элемента
  const cursorTo = async (el) => {
    const r = el.getBoundingClientRect()
    await cursor.move(r.left + r.width / 2, r.top + r.height / 2)
    guard()
  }

  const click = async (sel) => {
    const el = await waitFor(sel)
    await idle()
    await cursorTo(el)
    await cursor.press()
    guard()
    el.click()
  }

  const clickText = async (rootSel, text) => {
    const root = await waitFor(rootSel)
    const btn = [...root.querySelectorAll('button, a')].find((b) => b.textContent.includes(text))
    if (!btn) return
    await idle()
    await cursorTo(btn)
    await cursor.press()
    guard()
    btn.click()
  }

  // перенести прожектор на другой элемент посреди шага
  const focus = async (sel, { scroll = true } = {}) => {
    const el = await waitFor(sel)
    targetRef.current = el
    if (scroll) await smoothScrollTo(el)
  }

  // медленно пролистать страницу до элемента (демонстрация контента)
  const driftTo = async (sel, ms = 4000) => {
    const el = await waitFor(sel)
    await scrollWindowTo(centerOf(el), ms / 1000)
    guard()
  }

  const setNativeValue = (el, value) => {
    const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }

  const typeInto = async (sel, text, speed = 60) => {
    const el = await waitFor(sel)
    await idle()
    await cursorTo(el)
    el.focus()
    setNativeValue(el, '')
    await sleep(150)
    for (let i = 1; i <= text.length; i++) {
      guard()
      await idle()
      setNativeValue(el, text.slice(0, i))
      await tick(speed)
    }
  }

  const clearInput = (sel) => {
    const el = document.querySelector(sel)
    if (el) { setNativeValue(el, ''); el.blur() }
  }

  // закрыть дропдауны (useClickOutside слушает mousedown на window)
  const clickOutside = () => document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

  // провести курсором по графику слева направо (виртуальная точка едет вместе с тултипом)
  const sweepChart = async (sel, duration = 2200) => {
    const svg = await waitFor(sel)
    const r = svg.getBoundingClientRect()
    await cursor.move(r.left + 8, r.top + r.height / 2)
    const steps = 50
    for (let i = 0; i <= steps; i++) {
      guard()
      await idle()
      const x = r.left + 8 + ((r.width - 16) * i) / steps
      const y = r.top + r.height / 2
      cursor.set(x, y)
      svg.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: x, clientY: y }))
      await tick(duration / steps)
    }
    await sleep(600)
    svg.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }))
    cursor.hide()
  }

  return { auth, sleep, waitFor, click, clickText, focus, driftTo, typeInto, clearInput, clickOutside, sweepChart }
}

/* ── сценарий ── */

const STORY = '/story/koreycy-samoidentifikaciya'

const STEPS = [
  /* ── главная ── */
  {
    route: '/', target: null, placement: 'center',
    title: 'Добро пожаловать в «Голоса России»',
    text: 'Мультимедийная платформа, где представители народов России рассказывают о себе сами. Гид всё покажет и сделает за вас — просто нажимайте «Далее» (или стрелки ← →). Выход — Esc.',
    onEnter: ({ auth }) => {
      if (auth.user) auth.logout()
      try {
        localStorage.removeItem('golosa-feedback:koreycy-samoidentifikaciya')
        localStorage.removeItem('golosa-comments:koreycy-samoidentifikaciya')
        const bm = (JSON.parse(localStorage.getItem('golosa-bookmarks')) || []).filter((s) => s !== 'koreycy-samoidentifikaciya')
        localStorage.setItem('golosa-bookmarks', JSON.stringify(bm))
        const subs = (JSON.parse(localStorage.getItem('golosa-subs')) || []).filter((s) => s !== 'elena-suhorukih')
        localStorage.setItem('golosa-subs', JSON.stringify(subs))
        const likes = (JSON.parse(localStorage.getItem('golosa-likes')) || []).filter((s) => s !== 'koreycy-samoidentifikaciya')
        localStorage.setItem('golosa-likes', JSON.stringify(likes))
        const clikes = (JSON.parse(localStorage.getItem('golosa-comment-likes')) || []).filter((s) => !s.startsWith('koreycy-samoidentifikaciya/'))
        localStorage.setItem('golosa-comment-likes', JSON.stringify(clikes))
      } catch { /* ignore */ }
    },
  },
  {
    route: '/', target: '[data-tour="hero-day"]', placement: 'right',
    title: 'Публикация дня',
    text: 'Главная открывается историей дня. Каждый материал привязан к народу и подсвечен его фирменным цветом.',
  },
  {
    route: '/', target: '[data-tour="trending"]', placement: 'left',
    title: 'В тренде на неделе',
    text: 'Топ-5 самых читаемых историй недели — рейтинг по просмотрам.',
  },
  {
    route: '/', target: '[data-tour="peoples"]', placement: 'top', fit: true,
    title: 'Народы платформы',
    text: 'У каждого народа свой акцентный цвет, который проходит через весь сайт. Карточки наклоняются за курсором в 3D.',
  },
  {
    route: '/', target: '[data-tour="fresh"]', placement: 'top', fit: true,
    title: 'Свежие истории',
    text: 'Последние опубликованные материалы — лента живёт и пополняется.',
  },

  /* ── шапка слева направо ── */
  {
    route: '/', target: '[data-tour="logo"]', placement: 'bottom',
    title: 'Логотип',
    text: 'Круги — народы вокруг общего центра, каждый своего цвета. Клик по логотипу всегда возвращает на главную.',
  },
  {
    route: '/', target: '[data-tour="search"]', placement: 'bottom',
    title: 'Поисковая строка',
    text: 'Поиск по историям, народам, темам и авторам — всегда под рукой в центре шапки.',
  },
  {
    route: '/', target: '[data-tour="nav-links"]', placement: 'bottom',
    title: 'Разделы',
    text: '«Лента» — все материалы платформы, «Народы» — каталог культур. После входа здесь появятся и «Подписки».',
  },
  /* ── глава 2 ── */
  {
    route: null, target: null, placement: 'center', chapter: { num: 2, of: 3 },
    title: 'Аккаунт читателя',
    text: 'Дальше — личная часть платформы: вход в аккаунт, поиск, лента с фильтрами, закладки, история просмотров, подписки и уведомления. Гид всё сделает сам — продолжайте, когда будете готовы.',
  },
  {
    route: '/', target: '[data-tour="auth"]', placement: 'bottom',
    title: 'Вход',
    text: 'Кнопка входа. Сейчас гид зайдёт в демо-аккаунт читателя — смотрите.',
  },
  {
    route: '/', target: '[data-tour="login-modal"]', placement: 'right', autoNext: true,
    title: 'Входим как читатель',
    text: 'Гид печатает логин user и пароль — и нажимает «Войти».',
    onEnter: async (ctx) => { await ctx.sleep(300); await ctx.click('[data-tour="auth"]') },
    play: async (ctx) => {
      await ctx.sleep(600)
      await ctx.typeInto('[data-tour="login-modal"] input[autocomplete="username"]', 'user', 100)
      await ctx.sleep(250)
      await ctx.typeInto('[data-tour="login-modal"] input[autocomplete="current-password"]', 'password', 70)
      await ctx.sleep(600)
      await ctx.clickText('[data-tour="login-modal"]', 'Войти')
    },
    onLeave: ({ auth }) => auth.closeLogin(),
  },

  /* ── поиск ── */
  {
    route: '/', target: '[data-tour="search"]', placement: 'bottom',
    title: 'Поиск с подсказками',
    text: 'Гид набирает запрос — подсказки появляются на лету: народы и истории с обложками и форматами.',
    play: async (ctx) => {
      await ctx.sleep(500)
      await ctx.typeInto('[data-tour="search"] input', 'якут', 120)
      await ctx.focus('[data-tour="search-results"]', { scroll: false })
    },
    onLeave: (ctx) => { ctx.clickOutside(); ctx.clearInput('[data-tour="search"] input') },
  },

  /* ── лента ── */
  {
    route: '/feed', target: '[data-tour="filters"]', placement: 'bottom',
    title: 'Фильтры ленты',
    text: 'Формат, народ и тема. Гид открывает «Формат» и выбирает «Лонгрид» — лента фильтруется, а фильтр попадает в адрес страницы.',
    play: async (ctx) => {
      await ctx.sleep(800)
      await ctx.clickText('[data-tour="filters"]', 'Формат')
      await ctx.focus('[data-tour="filter-menu"]', { scroll: false })
      await ctx.sleep(1100)
      await ctx.clickText('[data-tour="filter-menu"]', 'Лонгрид')
      await ctx.focus('[data-tour="filters"]', { scroll: false })
    },
    onLeave: async (ctx) => { await ctx.clickText('[data-tour="filters"]', 'Сбросить') },
  },
  {
    route: '/feed', target: '[data-tour="feed-grid"]', placement: 'right',
    title: 'Все истории платформы',
    text: 'Лонгриды, интервью, подборки и видео — карточки с обложками, авторами и временем чтения.',
  },
  {
    route: '/feed', target: '[data-tour="now-reading"]', placement: 'left',
    title: 'Сейчас читают',
    text: 'Топ-5 — живой рейтинг того, что читатели открывают прямо сейчас.',
  },

  /* ── народы ── */
  {
    route: '/feed', target: '[data-tour="nav-cultures"]', placement: 'bottom',
    title: 'Вкладка «Народы»',
    text: 'Каталог всех культур платформы — гид переходит по вкладке.',
    play: async (ctx) => { await ctx.sleep(1000); await ctx.click('[data-tour="nav-cultures"]') },
  },
  {
    route: '/cultures', target: null, placement: 'corner',
    title: 'Народы платформы',
    text: 'Вся страница целиком: карточки народов с фирменными цветами, числом материалов и 3D-наклоном за курсором.',
  },
  {
    route: '/cultures', target: '[data-tour="culture-koreycy"]', placement: 'right', autoNext: true,
    title: 'Например, корейцы',
    text: 'Гид открывает страницу корейцев — у каждого народа есть свой дом на платформе.',
    play: async (ctx) => { await ctx.sleep(1300); await ctx.click('[data-tour="culture-koreycy"]') },
  },
  {
    route: '/culture/koreycy', target: null, placement: 'corner',
    title: 'Страница народа',
    text: 'Шапка в акцентном цвете, самоназвание, ключевые факты — язык, население, регион — и все истории народа ниже.',
  },
  {
    route: '/culture/koreycy', target: '[data-tour="related-cultures"]', placement: 'top',
    title: 'Похожие культуры',
    text: 'Внизу страницы — переходы к другим народам: можно путешествовать по культурам, не возвращаясь в каталог.',
  },
  {
    route: '/culture/koreycy', target: '[data-tour="culture-authors"]', placement: 'top',
    title: 'Голоса народа',
    text: 'Авторы, которые пишут об этом народе, — с подписчиками и переходом на их страницы.',
  },
  {
    route: '/culture/koreycy', target: '[data-tour="culture-stories"]', placement: 'right', fit: true, autoNext: true,
    title: 'Истории народа',
    text: 'Все материалы корейцев. Гид открывает лонгрид «Корейская самоидентификация в Приморье».',
    play: async (ctx) => { await ctx.sleep(1500); await ctx.click(`a[href="${STORY}"]`) },
  },

  /* ── лонгрид ── */
  {
    route: STORY, target: null, placement: 'corner', autoNext: true,
    title: 'Лонгрид',
    text: 'Пролистаем статью: буквица, цитаты-карточки, фирменная типографика. Сверху бежит полоса прогресса чтения.',
    play: async (ctx) => { await ctx.sleep(900); await ctx.driftTo('[data-tour="related"]', 4500) },
  },
  {
    route: STORY, target: '[data-tour="related"]', placement: 'top', fit: true,
    title: 'Рекомендации',
    text: '«Похожие истории» подбираются по народу и темам — читатель не упирается в конец статьи.',
  },
  {
    route: STORY, target: '[data-tour="feedback"]', placement: 'top',
    title: 'Система оценок',
    text: 'Гид проходит мини-опрос: оценка звёздами, что понравилось, хотите ли ещё таких историй и комментарий.',
    play: async (ctx) => {
      await ctx.sleep(700)
      await ctx.click('[data-tour="feedback"] [aria-label="Оценка 5 из 5"]')
      await ctx.sleep(1100)
      await ctx.clickText('[data-tour="feedback"]', 'Герой истории')
      await ctx.sleep(500)
      await ctx.clickText('[data-tour="feedback"]', 'Узнал(а) новое')
      await ctx.sleep(700)
      await ctx.clickText('[data-tour="feedback"]', 'Далее')
      await ctx.sleep(900)
      await ctx.clickText('[data-tour="feedback"]', 'Да, хочу')
      await ctx.sleep(900)
      await ctx.typeInto('[data-tour="feedback"] textarea', 'Очень атмосферно, ждём продолжения!', 45)
      await ctx.sleep(500)
      await ctx.clickText('[data-tour="feedback"]', 'Отправить')
    },
  },
  {
    route: STORY, target: '[data-tour="comments"]', placement: 'right', fit: true,
    title: 'Комментарии',
    text: 'Под каждой историей живёт обсуждение. Гид пишет комментарий и отправляет — он останется в разделе.',
    play: async (ctx) => {
      await ctx.sleep(800)
      await ctx.typeInto('[data-tour="comments"] textarea', 'Очень тёплая история, спасибо!', 50)
      await ctx.sleep(400)
      await ctx.clickText('[data-tour="comments"]', 'Отправить')
    },
  },

  /* ── автор ── */
  {
    route: STORY, target: '[data-tour="article-author"]', placement: 'bottom', autoNext: true,
    title: 'Автор истории',
    text: 'У каждого материала есть автор — гид переходит на её страницу.',
    play: async (ctx) => { await ctx.sleep(1400); await ctx.click('[data-tour="article-author"] a') },
  },
  {
    route: '/author/elena-suhorukih', target: '[data-tour="subscribe"]', placement: 'bottom',
    title: 'Подписка на автора',
    text: 'Один клик — и новые материалы автора будут в ваших подписках и уведомлениях. Гид подписывается.',
    play: async (ctx) => { await ctx.sleep(1000); await ctx.click('[data-tour="subscribe"] button') },
  },
  {
    route: '/author/elena-suhorukih', target: '[data-tour="author-content"]', placement: 'top', fit: true,
    title: 'Материалы автора',
    text: 'Вся библиотека автора в одном месте — с просмотрами и подписчиками.',
  },

  /* ── лайк и закладки ── */
  {
    route: STORY, target: '[data-tour="like"]', placement: 'bottom',
    title: 'Лайк',
    text: 'Вернулись в лонгрид. Понравилась история — жмём сердечко: гид ставит лайк, счётчик растёт.',
    play: async (ctx) => { await ctx.sleep(900); await ctx.click('[data-tour="like"] button') },
  },
  {
    route: STORY, target: '[data-tour="bookmark"]', placement: 'bottom',
    title: 'В закладки',
    text: 'Рядом — закладки. Гид сохраняет статью: иконка подпрыгивает, снизу всплывает подтверждение.',
    play: async (ctx) => { await ctx.sleep(900); await ctx.click('[data-tour="bookmark"] button') },
  },
  {
    route: null, target: '[data-tour="menu-bookmarks"]', placement: 'bottom', autoNext: true,
    title: 'Меню профиля → Закладки',
    text: 'Всё личное живёт в меню под аватаркой. Гид открывает «Закладки».',
    onEnter: async (ctx) => { await ctx.sleep(300); await ctx.click('[data-tour="avatar"] button') },
    play: async (ctx) => { await ctx.sleep(1400); await ctx.click('[data-tour="menu-bookmarks"]') },
    onLeave: (ctx) => ctx.clickOutside(),
  },
  {
    route: '/bookmarks', target: '[data-tour="bookmarks-grid"]', placement: 'right', fit: true,
    title: 'Закладка на месте',
    text: 'Сохранённая история уже здесь — раздел переживёт любые перезагрузки.',
  },

  /* ── уведомления ── */
  {
    route: '/bookmarks', target: '[data-tour="bell"]', placement: 'bottom',
    title: 'Колокольчик',
    text: 'Счётчик непрочитанных уведомлений — как на YouTube. Открываем…',
  },
  {
    route: '/bookmarks', target: '[data-tour="bell-menu"]', placement: 'bottom',
    title: 'Уведомления',
    text: 'Свежие материалы авторов, на которых вы подписаны. «Показать все» ведёт на полную страницу уведомлений.',
    onEnter: async (ctx) => { await ctx.sleep(300); await ctx.click('[data-tour="bell"] button') },
    onLeave: (ctx) => ctx.clickOutside(),
  },

  /* ── история и подписки ── */
  {
    route: null, target: '[data-tour="menu-history"]', placement: 'bottom', autoNext: true,
    title: 'Меню → История просмотров',
    text: 'Всё, что вы открывали, сохраняется автоматически. Гид переходит в историю.',
    onEnter: async (ctx) => { ctx.clickOutside(); await ctx.sleep(250); await ctx.click('[data-tour="avatar"] button') },
    play: async (ctx) => { await ctx.sleep(1200); await ctx.click('[data-tour="menu-history"]') },
    onLeave: (ctx) => ctx.clickOutside(),
  },
  {
    route: '/history', target: '[data-tour="history-list"]', placement: 'right', fit: true,
    title: 'История просмотров',
    text: 'Открытые истории, сгруппированные по дням — «Сегодня», «Вчера»… Можно очистить одной кнопкой.',
  },
  {
    route: null, target: '[data-tour="nav-subs"]', placement: 'bottom',
    title: 'Вкладка «Подписки»',
    text: 'После входа в шапке появился раздел «Подписки» — переходим.',
    play: async (ctx) => { await ctx.sleep(1000); await ctx.click('[data-tour="nav-subs"]') },
  },
  {
    route: '/subscriptions', target: '[data-tour="subs-authors"]', placement: 'bottom',
    title: 'Подписки',
    text: 'Персональная лента. Елена Сухоруких, на которую гид подписался минуту назад, уже здесь.',
  },

  /* ── настройки и заявка ── */
  {
    route: null, target: '[data-tour="menu-settings"]', placement: 'bottom', autoNext: true,
    title: 'Меню → Настройки',
    text: 'Настройки профиля — тоже в меню под аватаркой.',
    onEnter: async (ctx) => { await ctx.sleep(300); await ctx.click('[data-tour="avatar"] button') },
    play: async (ctx) => { await ctx.sleep(1200); await ctx.click('[data-tour="menu-settings"]') },
  },
  {
    route: null, target: '[data-tour="profile-modal"]', placement: 'right',
    title: 'Настройки профиля',
    text: 'Имя, псевдоним, регион, «о себе» и аватар — всё редактируется в одном окне.',
    onLeave: ({ auth }) => auth.closeProfile(),
  },
  {
    route: null, target: '[data-tour="footer"]', placement: 'top', autoNext: true,
    title: 'Футер',
    text: 'Разделы, все народы платформы и «О проекте». Гид наводится на ссылку и переходит к странице проекта.',
    play: async (ctx) => {
      await ctx.sleep(1400)
      await ctx.focus('[data-tour="footer"] a[href="/about"]', { scroll: false })
      await ctx.sleep(1200)
      await ctx.click('[data-tour="footer"] a[href="/about"]')
    },
  },
  {
    route: '/about', target: null, placement: 'corner',
    title: 'О проекте',
    text: 'Миссия, три правила платформы и форматы. Пролистаем к заявке автора…',
    play: async (ctx) => { await ctx.sleep(800); await ctx.driftTo('[data-tour="apply-form"]', 3800) },
  },
  {
    route: '/about', target: '[data-tour="apply-form"]', placement: 'left',
    title: 'Стать автором',
    text: 'Гид заполняет заявку: имя, народ, почта и тема — и отправляет.',
    play: async (ctx) => {
      await ctx.sleep(600)
      await ctx.typeInto('[data-tour="apply-form"] input[placeholder="Имя"]', 'Мария', 80)
      await ctx.typeInto('[data-tour="apply-form"] input[placeholder="Народ, который вы представляете"]', 'Карелы', 70)
      await ctx.typeInto('[data-tour="apply-form"] input[type="email"]', 'maria@example.com', 55)
      await ctx.typeInto('[data-tour="apply-form"] textarea', 'Хочу рассказать о карельских рунах и культуре Севера.', 40)
      await ctx.sleep(500)
      await ctx.clickText('[data-tour="apply-form"]', 'Отправить заявку')
    },
  },

  /* ── глава 3 ── */
  {
    route: null, target: null, placement: 'center', chapter: { num: 3, of: 3 },
    title: 'Студия автора',
    text: 'Финальная часть: кабинет автора. Гид сменит аккаунт, покажет материалы со статусами модерации, загрузит видео, разберёт аналитику, гайдлайны и аудиторию.',
  },

  /* ── смена аккаунта на автора ── */
  {
    route: null, target: '[data-tour="menu-logout"]', placement: 'bottom', autoNext: true,
    title: 'Сменим роль',
    text: 'Выходим из аккаунта читателя, чтобы зайти как автор.',
    onEnter: async (ctx) => { await ctx.sleep(300); await ctx.click('[data-tour="avatar"] button') },
    play: async (ctx) => { await ctx.sleep(1100); await ctx.click('[data-tour="menu-logout"]') },
  },
  {
    route: null, target: '[data-tour="login-modal"]', placement: 'right', autoNext: true,
    title: 'Входим как автор',
    text: 'Логин author — у авторов есть студия, аналитика и загрузка контента.',
    onEnter: async (ctx) => { await ctx.sleep(500); await ctx.click('[data-tour="auth"]') },
    play: async (ctx) => {
      await ctx.sleep(600)
      await ctx.typeInto('[data-tour="login-modal"] input[autocomplete="username"]', 'author', 100)
      await ctx.sleep(250)
      await ctx.typeInto('[data-tour="login-modal"] input[autocomplete="current-password"]', 'password', 70)
      await ctx.sleep(600)
      await ctx.clickText('[data-tour="login-modal"]', 'Войти')
    },
    onLeave: ({ auth }) => auth.closeLogin(),
  },

  /* ── студия ── */
  {
    route: null, target: '[data-tour="menu-studio"]', placement: 'bottom', autoNext: true,
    title: 'Меню → Студия',
    text: 'У автора в меню появились «Студия» и «Аналитика». Переходим в кабинет.',
    onEnter: async (ctx) => { await ctx.sleep(400); await ctx.click('[data-tour="avatar"] button') },
    play: async (ctx) => { await ctx.sleep(1200); await ctx.click('[data-tour="menu-studio"]') },
    onLeave: (ctx) => ctx.clickOutside(),
  },
  {
    route: '/studio', target: null, placement: 'corner',
    title: 'Студия автора',
    text: 'Кабинет целиком: профиль, живые счётчики статистики и материалы. В шапке — свои вкладки: Аналитика, Гайдлайны, Аудитория.',
  },
  {
    route: '/studio', target: '[data-tour="my-content"]', placement: 'top', fit: true,
    title: 'Мои материалы',
    text: 'Публикации со статусами модерации, просмотрами и лайками. Можно редактировать обложки, форматы и темы.',
  },
  {
    route: '/studio', target: '[data-tour="add-modal"]', placement: 'right',
    title: 'Кнопка «Добавить»',
    text: 'Гид выбирает «Видео», заполняет название с описанием и отправляет на модерацию.',
    onEnter: async (ctx) => { await ctx.sleep(300); ctx.auth.openAddContent(null) },
    play: async (ctx) => {
      await ctx.sleep(1300)
      await ctx.click('[data-tour="add-modal"] [data-type="Видео"]')
      await ctx.sleep(900)
      await ctx.typeInto('[data-tour="add-modal"] input[placeholder="Название материала"]', 'Один день оленевода', 65)
      await ctx.sleep(300)
      await ctx.typeInto('[data-tour="add-modal"] textarea', 'Рассвет в тундре, бригада №4 и пятьсот оленей.', 40)
      await ctx.sleep(700)
      await ctx.clickText('[data-tour="add-modal"]', 'Отправить на модерацию')
    },
    onLeave: ({ auth }) => auth.closeAddContent(),
  },

  /* ── аналитика ── */
  {
    // route null: гид сам кликает по вкладке в шапке студии — виден полёт курсора
    route: null, target: '[data-tour="kpi"]', placement: 'bottom',
    title: 'Аналитика: метрики',
    text: 'Гид переходит по вкладке «Аналитика». Просмотры, лайки, подписчики и среднее чтение за 30 дней — с динамикой к прошлому месяцу.',
    onEnter: async (ctx) => { await ctx.sleep(300); await ctx.click('[data-tour="studio-tab-analytics"]') },
  },
  {
    route: '/studio/analytics', target: '[data-tour="chart"]', placement: 'top',
    title: 'График просмотров',
    text: 'Интерактивный график за 30 дней — гид проводит по нему курсором, тултип показывает значения по дням.',
    play: async (ctx) => { await ctx.sleep(1300); await ctx.sweepChart('[data-tour="chart"] svg') },
  },
  {
    route: '/studio/analytics', target: '[data-tour="top-content"]', placement: 'right',
    title: 'Топ материалов',
    text: 'Самые читаемые публикации автора с анимированными рейтингами.',
  },
  {
    route: '/studio/analytics', target: '[data-tour="sources"]', placement: 'left',
    title: 'Источники переходов',
    text: 'Откуда приходят читатели: лента, поиск, подписки и внешние ссылки.',
  },

  /* ── гайдлайны и аудитория ── */
  {
    route: null, target: null, placement: 'corner',
    title: 'Гайдлайны',
    text: 'Редакционные принципы: что мы публикуем, чего избегаем, требования к форматам и чек-лист перед отправкой.',
    onEnter: async (ctx) => { await ctx.sleep(300); await ctx.click('[data-tour="studio-tab-guidelines"]') },
  },
  {
    route: null, target: null, placement: 'corner',
    title: 'Аудитория',
    text: 'Советы по работе с аудиторией: сегменты читателей, матрица форматов и воронка вовлечения.',
    onEnter: async (ctx) => { await ctx.sleep(300); await ctx.click('[data-tour="studio-tab-audience"]') },
  },

  /* ── финал ── */
  {
    route: '/', target: null, placement: 'center',
    title: 'Вот и всё!',
    text: '«Голоса России» — платформа, где каждый народ звучит своим голосом: живо, лично и без музейного стекла. Спасибо за внимание!',
  },
]

/* ── геометрия карточки гида ── */

function cardPosition(step, r, vw, vh, cardH) {
  if (step.placement === 'corner') return { kind: 'corner' }
  if (step.fit) return { kind: 'dock' } // карточка внизу по центру, блок может не влезать
  if (!r || step.placement === 'center') return { kind: 'center' }
  if (vw < 640) return { kind: 'sheet' }

  let placement = step.placement
  if (placement === 'bottom' && r.bottom + PAD + GAP + cardH > vh - MARGIN) placement = 'top'
  if (placement === 'top' && r.top - PAD - GAP - cardH < MARGIN) placement = 'bottom'
  if (placement === 'left' && r.left - CARD_W - GAP - PAD < MARGIN) placement = 'bottom'
  if (placement === 'right' && r.right + CARD_W + GAP + PAD > vw - MARGIN) placement = 'bottom'

  const cx = r.left + r.width / 2
  const x = clamp(cx - CARD_W / 2, MARGIN, vw - CARD_W - MARGIN)
  const arrowX = clamp(cx - x, 26, CARD_W - 26)
  const sideY = clamp(r.top + r.height / 2 - cardH / 2, MARGIN, vh - cardH - MARGIN)

  switch (placement) {
    case 'top':
      return { kind: 'abs', x, y: clamp(r.top - PAD - GAP - cardH, MARGIN, vh - MARGIN), arrow: { side: 'bottom', x: arrowX } }
    case 'left':
      return { kind: 'abs', x: r.left - PAD - GAP - CARD_W, y: sideY, arrow: { side: 'right', y: clamp(r.top + r.height / 2 - sideY, 22, cardH - 22) } }
    case 'right':
      return { kind: 'abs', x: r.right + PAD + GAP, y: sideY, arrow: { side: 'left', y: clamp(r.top + r.height / 2 - sideY, 22, cardH - 22) } }
    default:
      return { kind: 'abs', x, y: r.bottom + PAD + GAP, arrow: { side: 'top', x: arrowX } }
  }
}

export default function Presentation() {
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useAuth()
  const [active, setActive] = useState(false)
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState(null)
  const [cardH, setCardH] = useState(230)
  const [paused, setPaused] = useState(false)
  const targetRef = useRef(null)
  const genRef = useRef(0)
  const prevStepRef = useRef(null)
  const enteredRef = useRef(-1)
  const doneRef = useRef(-1)
  const cardRef = useRef(null)
  const pausedRef = useRef(false)

  // Пауза (Space): замораживает автодействия, автоперелистывание, скролл и полёт курсора
  const setPause = (v) => {
    if (pausedRef.current === v) return // play() на завершённой анимации перезапустил бы её
    pausedRef.current = v
    setPaused(v)
    if (v) { scrollCtrl?.pause?.(); cursor.pauseFlight() }
    else { scrollCtrl?.play?.(); cursor.resumeFlight() }
  }

  // Команда `presentation` в консоли (срабатывает и без скобок)
  useEffect(() => {
    const start = () => {
      genRef.current++
      prevStepRef.current = null
      enteredRef.current = -1
      doneRef.current = -1
      setStep(0)
      setActive(true)
    }
    window.addEventListener('golosa:presentation', start)
    try {
      Object.defineProperty(window, 'presentation', {
        configurable: true,
        get() {
          window.dispatchEvent(new Event('golosa:presentation'))
          return () => '▶ Презентация запущена'
        },
      })
    } catch { /* ignore */ }
    console.info('%c«Голоса России»: наберите presentation — запустится экскурсия по сайту', 'color:#028090;font-weight:bold')
    return () => window.removeEventListener('golosa:presentation', start)
  }, [])

  const s = STEPS[step]

  const exit = () => {
    setPause(false)
    const gen = ++genRef.current
    stopScroll()
    cursor.hide()
    const ctx = makeCtx(auth, genRef, gen, targetRef, pausedRef)
    try { STEPS[prevStepRef.current]?.onLeave?.(ctx) } catch { /* ignore */ }
    auth.closeLogin()
    auth.closeAddContent()
    auth.closeProfile()
    ctx.clickOutside()
    prevStepRef.current = null
    targetRef.current = null
    setRect(null)
    setActive(false)
  }
  // ручная навигация снимает паузу — иначе новый шаг повиснет на первом sleep
  const next = () => { setPause(false); if (step >= STEPS.length - 1) exit(); else setStep(step + 1) }
  const prev = () => { if (step > 0) { setPause(false); setStep(step - 1) } }

  // Подготовка шага: onLeave предыдущего, onEnter, навигация, цель, скролл, сценарий
  useEffect(() => {
    if (!active) return
    // переход страницы внутри уже отработавшего шага (клик по ссылке) — не перезапускаем
    if (doneRef.current === step) return
    const gen = ++genRef.current
    stopScroll()
    cursor.hide()
    const ctx = makeCtx(auth, genRef, gen, targetRef, pausedRef)

    const run = async () => {
      try {
        if (prevStepRef.current !== null && prevStepRef.current !== step) {
          try { await STEPS[prevStepRef.current]?.onLeave?.(ctx) } catch { /* ignore */ }
        }
        prevStepRef.current = step

        if (s.route && location.pathname !== s.route) {
          targetRef.current = null
          setRect(null)
          enteredRef.current = -1
          navigate(s.route)
          return // эффект перезапустится после смены маршрута
        }

        if (enteredRef.current !== step) {
          enteredRef.current = step
          await s.onEnter?.(ctx)
        }

        targetRef.current = null
        setRect(null)

        if (s.target) {
          const el = await ctx.waitFor(s.target, 6000)
          targetRef.current = el
          // fit: блок прижимается к верху экрана, чтобы карточка-док внизу была видна
          await smoothScrollTo(el, s.fit ? 'top' : 'center')
          if (genRef.current !== gen) return
          setRect(el.getBoundingClientRect())
        } else if (s.placement === 'corner') {
          await scrollWindowTo(0, 0.6)
        }

        doneRef.current = step // дальше pathname может меняться кликами сценария
        if (s.play) await s.play(ctx)

        // автоперелистывание после завершённого действия
        if (s.autoNext && genRef.current === gen) {
          await ctx.sleep(300)
          setStep((i) => (i === step ? Math.min(i + 1, STEPS.length - 1) : i))
        }
      } catch (e) {
        if (e?.message !== 'tour-cancelled') console.warn('[презентация] шаг', step + 1, e?.message || e)
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, step, location.pathname])

  // сброс done при смене шага
  useEffect(() => { if (doneRef.current !== step) doneRef.current = -1 }, [step])

  // Слежение за целью каждый кадр — прожектор «приклеен» к блоку
  useEffect(() => {
    if (!active) return
    let raf
    let last = null
    const loop = () => {
      const el = targetRef.current
      if (el && document.contains(el)) {
        const r = el.getBoundingClientRect()
        if (!last || Math.abs(r.top - last.top) > 0.5 || Math.abs(r.left - last.left) > 0.5 ||
            Math.abs(r.width - last.width) > 0.5 || Math.abs(r.height - last.height) > 0.5) {
          last = r
          setRect(r)
        }
      } else if (el) {
        // цель исчезла из DOM (модалка закрылась, страница сменилась) — гасим прожектор
        targetRef.current = null
        last = null
        setRect(null)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active])

  // Клавиатура
  useEffect(() => {
    if (!active) return
    const onKey = (e) => {
      if (e.key === 'Escape') exit()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.code === 'Space') { e.preventDefault(); setPause(!pausedRef.current) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, step])

  // Замер высоты карточки для точного позиционирования
  useEffect(() => {
    const h = cardRef.current?.offsetHeight
    if (h && Math.abs(h - cardH) > 4) setCardH(h)
  }, [step, active, cardH])

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800

  const hasRect = rect && rect.width > 0
  const spot = hasRect
    ? { top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2, borderRadius: 18 }
    : { top: vh / 2, left: vw / 2, width: 0, height: 0, borderRadius: 18 }

  const pos = cardPosition(s, hasRect ? rect : null, vw, vh, cardH)

  const card = (
    <motion.div
      key={step}
      ref={cardRef}
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="pointer-events-auto relative rounded-2xl bg-cream p-5 shadow-card-hover sm:p-6"
    >
      {pos.arrow && (
        <span
          className="absolute h-3.5 w-3.5 rotate-45 bg-cream"
          style={{
            ...(pos.arrow.side === 'top' && { top: -7, left: pos.arrow.x - 7 }),
            ...(pos.arrow.side === 'bottom' && { bottom: -7, left: pos.arrow.x - 7 }),
            ...(pos.arrow.side === 'left' && { left: -7, top: pos.arrow.y - 7 }),
            ...(pos.arrow.side === 'right' && { right: -7, top: pos.arrow.y - 7 }),
          }}
          aria-hidden
        />
      )}

      <button
        onClick={exit}
        aria-label="Завершить презентацию"
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-ink/40 transition-colors hover:bg-navy/5 hover:text-navy"
      >
        <X size={15} />
      </button>

      <div className="mb-1.5 flex items-center gap-2">
        <span className="eyebrow">
          {s.chapter ? `Часть ${s.chapter.num} из ${s.chapter.of}` : `${step + 1} / ${STEPS.length}`}
        </span>
        {paused && (
          <span className="rounded-full bg-clay/10 px-2 py-0.5 text-[11px] font-semibold text-clay">
            Пауза · Space — продолжить
          </span>
        )}
      </div>
      {s.chapter && <div className="mb-2 mt-1 h-1 w-12 rounded-full bg-clay" aria-hidden />}
      <h3 className={`pr-8 font-display font-bold leading-snug text-navy ${s.chapter ? 'text-2xl' : 'text-lg'}`}>{s.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink/70">{s.text}</p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPause(!paused)}
            aria-label={paused ? 'Продолжить' : 'Пауза'}
            title={paused ? 'Продолжить (Space)' : 'Пауза (Space)'}
            className={`grid h-9 w-9 place-items-center rounded-full border transition-colors ${
              paused ? 'border-clay bg-clay/10 text-clay' : 'border-navy/20 text-navy hover:bg-navy/5'
            }`}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button
            onClick={prev}
            disabled={step === 0}
            className={`inline-flex items-center gap-1.5 rounded-full border border-navy/20 px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy/5 ${
              step === 0 ? 'invisible' : ''
            }`}
          >
            <ArrowLeft size={15} /> Назад
          </button>
        </div>
        <button
          onClick={next}
          className="inline-flex items-center gap-1.5 rounded-full bg-navy px-5 py-2 text-sm font-semibold text-cream transition-colors hover:bg-navy-deep"
        >
          {step >= STEPS.length - 1 ? 'Завершить' : 'Далее'} <ArrowRight size={15} />
        </button>
      </div>
    </motion.div>
  )

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="presentation"
          className="pointer-events-none fixed inset-0 z-[200]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* щит: блокирует клики по сайту */}
          <div className="pointer-events-auto absolute inset-0" aria-hidden />

          {/* прожектор (в corner-режиме страница видна целиком, без затемнения) */}
          {s.placement !== 'corner' && (
            <motion.div
              className="absolute border border-cream/30"
              style={{ boxShadow: '0 0 0 9999px rgba(16, 38, 64, 0.65)' }}
              initial={false}
              animate={spot}
              transition={{ type: 'spring', stiffness: 260, damping: 30, mass: 0.7 }}
              aria-hidden
            />
          )}

          {/* виртуальный курсор гида */}
          <div
            ref={(node) => cursor.attach(node)}
            className="pointer-events-none absolute left-0 top-0 opacity-0 transition-opacity duration-200"
            aria-hidden
          >
            <span className="block h-3.5 w-3.5 rounded-full bg-clay shadow-lg ring-2 ring-white" style={{ margin: '-7px 0 0 -7px' }} />
            <span className="absolute left-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-clay opacity-0" style={{ margin: '-7px 0 0 -7px' }} />
          </div>

          {/* карточка гида */}
          {pos.kind === 'abs' ? (
            <motion.div
              key="card-abs"
              className="absolute"
              style={{ width: CARD_W }}
              initial={false}
              animate={{ x: pos.x, y: pos.y }}
              transition={{ type: 'spring', stiffness: 300, damping: 32, mass: 0.7 }}
            >
              {card}
            </motion.div>
          ) : pos.kind === 'sheet' ? (
            <div key="card-sheet" className="absolute" style={{ left: MARGIN, right: MARGIN, bottom: 20 }}>
              {card}
            </div>
          ) : pos.kind === 'corner' ? (
            <div key="card-corner" className="absolute" style={{ right: 24, bottom: 24, width: CARD_W }}>
              {card}
            </div>
          ) : pos.kind === 'dock' ? (
            <div
              key="card-dock"
              className="absolute"
              style={{ left: '50%', bottom: 24, transform: 'translateX(-50%)', width: Math.min(CARD_W + 30, vw - 32) }}
            >
              {card}
            </div>
          ) : (
            <div
              key="card-center"
              className="absolute"
              style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: Math.min(CARD_W + 50, vw - 32) }}
            >
              {card}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
