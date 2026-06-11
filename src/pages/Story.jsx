import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Play, Bookmark } from 'lucide-react'
import {
  getContent, getCulture, loadArticleHtml,
  relatedContent, formatDate, cultureName, BYLINE_NOTE, authorsOf,
} from '../lib/data'
import { useBookmarks, recordVisit } from '../lib/hooks'
import { useAuth } from '../context/AuthContext'
import { FormatBadge, AuthorAvatar, CoverImage } from '../components/ui'
import { ContentCard } from '../components/cards'
import ArticleFeedback from '../components/ArticleFeedback'
import NotFound from './NotFound'

function AuthorLinks({ item, size = 26, dark = false }) {
  const auts = authorsOf(item)
  if (!auts.length) return null
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {auts.map((a) => (
        <Link
          key={a.slug}
          to={`/author/${a.slug}`}
          className={`inline-flex items-center gap-2 ${dark ? 'hover:text-clay' : 'hover:text-teal'}`}
        >
          <AuthorAvatar author={a} size={size} />
          <span className={`font-semibold ${dark ? 'text-cream' : 'text-navy'}`}>{a.name}</span>
        </Link>
      ))}
    </div>
  )
}

// Тонкая полоса прогресса чтения под шапкой, в акцентном цвете народа
function ReadingProgress({ color }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 })
  return (
    <motion.div
      style={{ scaleX, backgroundColor: color }}
      className="fixed inset-x-0 top-16 z-40 h-[3px] origin-left"
      aria-hidden
    />
  )
}

// Кнопка «В закладки»: для гостя открывает окно входа
function BookmarkButton({ slug, dark = false }) {
  const { user, openLogin } = useAuth()
  const { has, toggle } = useBookmarks()
  const [toast, setToast] = useState(false)
  const timer = useRef(null)
  const on = !!user && has(slug)

  useEffect(() => () => clearTimeout(timer.current), [])

  const onClick = () => {
    if (!user) { openLogin(); return }
    const adding = !on
    toggle(slug)
    clearTimeout(timer.current)
    if (adding) {
      setToast(true)
      timer.current = setTimeout(() => setToast(false), 2200)
    } else {
      setToast(false)
    }
  }

  return (
    <>
      <button
        onClick={onClick}
        aria-pressed={on}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold transition-colors ${
          dark
            ? on
              ? 'border-cream/40 bg-cream/15 text-cream'
              : 'border-cream/30 text-cream/85 hover:bg-cream/10'
            : on
              ? 'border-teal bg-teal/10 text-teal'
              : 'border-navy/20 text-ink/65 hover:border-teal hover:text-teal'
        }`}
      >
        <motion.span
          animate={on ? { scale: [1, 1.45, 1] } : { scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="grid"
        >
          <Bookmark size={14} fill={on ? 'currentColor' : 'none'} />
        </motion.span>
        {on ? 'В закладках' : 'В закладки'}
      </button>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-[90] flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-cream shadow-card-hover"
          >
            <Bookmark size={15} fill="currentColor" className="text-clay" />
            Сохранено в закладки
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Related({ related }) {
  if (!related.length) return null
  return (
    <section className="wrap mt-16">
      <h2 className="mb-6 font-display text-2xl font-bold text-navy">Похожие истории</h2>
      <div className="grid gap-5 md:grid-cols-3">
        {related.map((r) => <ContentCard key={r.slug} item={r} />)}
      </div>
    </section>
  )
}

// === Видео-страница в духе YouTube: плеер сверху, под ним заголовок и описание ===
function VideoView({ item, culture, related }) {
  const isShort = item.format === 'Короткое'
  return (
    <div className="pb-6">
      <div className="wrap py-8 sm:py-10">
        <div className="mx-auto max-w-4xl">
          {/* Плеер: реальное видео, если задан item.videoSrc, иначе заглушка */}
          <div
            className={`relative mx-auto overflow-hidden rounded-2xl bg-black ${
              isShort ? 'aspect-[9/16] max-w-[340px]' : 'aspect-video w-full'
            }`}
          >
            {item.videoSrc ? (
              <video
                controls
                playsInline
                preload="metadata"
                poster={item.hero}
                className="h-full w-full bg-black object-contain"
              >
                <source src={item.videoSrc} />
                Ваш браузер не поддерживает видео.
              </video>
            ) : (
              <>
                <img src={item.hero} alt="" className="h-full w-full object-cover opacity-40" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="flex flex-col items-center gap-3 text-cream">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-cream/95 text-navy shadow-lg transition-transform hover:scale-105">
                      <Play size={26} fill="currentColor" className="ml-1" />
                    </span>
                    <span className="rounded-full bg-navy/70 px-3 py-1.5 text-sm font-medium backdrop-blur">
                      Видео скоро появится
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Заголовок */}
          <h1 className="mt-5 font-display text-2xl font-extrabold leading-tight text-navy sm:text-3xl">
            {item.title}
          </h1>
          {item.subtitle && <p className="mt-1.5 text-lg text-ink/60">{item.subtitle}</p>}

          {/* Мета-строка */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-navy/10 pb-4">
            <FormatBadge format={item.format} soon={item.isPlaceholder} />
            {culture && (
              <Link
                to={`/culture/${culture.slug}`}
                className="chip text-cream"
                style={{ backgroundColor: culture.accent }}
              >
                {culture.name}
              </Link>
            )}
            <span className="text-sm text-ink/55">
              {formatDate(item.date)}{item.duration ? ` · ${item.duration}` : ''}
            </span>
            {item.topics?.map((t) => (
              <span key={t} className="text-sm text-teal">#{t.toLowerCase()}</span>
            ))}
            <BookmarkButton slug={item.slug} />
          </div>

          {/* Описание (как блок описания на YouTube) */}
          <div className="mt-4 rounded-2xl bg-cream-2/60 p-5 text-[15px] leading-relaxed text-ink/80">
            {authorsOf(item).length > 0 && (
              <div className="mb-3">
                <AuthorLinks item={item} size={24} />
                <p className="mt-1 text-sm text-ink/55">{BYLINE_NOTE}</p>
              </div>
            )}
            <p>{item.excerpt}</p>
            {!item.videoSrc && (
              <p className="mt-3 text-ink/55">
                Полноценный ролик появится на платформе позже. А пока — текстовые истории этого народа.
              </p>
            )}
            {culture && (
              <Link to={`/culture/${culture.slug}`} className="btn-navy mt-5">
                Истории народа «{cultureName(item.cultureSlug)}»
              </Link>
            )}
          </div>
        </div>
      </div>

      <ArticleFeedback slug={item.slug} cultureSlug={item.cultureSlug} />

      <Related related={related} />
    </div>
  )
}

export default function Story() {
  const { slug } = useParams()
  const item = getContent(slug)
  const hasBody = !!item && item.format !== 'Видео' && item.format !== 'Короткое'

  // запись в историю просмотров
  useEffect(() => { if (item) recordVisit(slug) }, [slug, item])

  // параллакс hero-фото: картинка отстаёт от скролла
  const heroRef = useRef(null)
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(heroProgress, [0, 1], ['0%', '24%'])

  // тело статьи грузится отдельным чанком
  const [html, setHtml] = useState('')
  useEffect(() => {
    let alive = true
    setHtml('')
    if (hasBody) loadArticleHtml(slug).then((h) => { if (alive) setHtml(h) })
    return () => { alive = false }
  }, [slug, hasBody])

  if (!item) return <NotFound />

  const culture = getCulture(item.cultureSlug)
  const related = relatedContent(item, 3)

  if (!hasBody) return <VideoView item={item} culture={culture} related={related} />

  const accent = culture?.accent || '#E07A5F'

  return (
    <article className="pb-10" style={{ '--accent': accent }}>
      <ReadingProgress color={accent} />
      {/* Шапка — на тёмном фоне, чтобы текст ниже фото оставался читаемым */}
      <header className="relative bg-navy text-cream">
        <div ref={heroRef} className="relative h-[44vh] min-h-[320px] w-full overflow-hidden sm:h-[56vh]">
          <motion.div style={{ y: heroY, scale: 1.12 }} className="h-full w-full">
            <CoverImage src={item.hero} alt={item.title} accent={accent} label={cultureName(item.cultureSlug)} eager />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-navy/10" />
        </div>
        <div className="wrap relative -mt-40 pb-12 sm:-mt-48">
          <div className="max-w-prose">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <FormatBadge format={item.format} soon={item.isPlaceholder} />
              {culture && (
                <Link
                  to={`/culture/${culture.slug}`}
                  className="chip text-cream"
                  style={{ backgroundColor: culture.accent }}
                >
                  {culture.name}
                </Link>
              )}
              {item.topics?.map((t) => (
                <span key={t} className="chip bg-cream/15 text-cream/90">{t}</span>
              ))}
              <BookmarkButton slug={item.slug} dark />
            </div>
            <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-5xl">{item.title}</h1>
            {item.subtitle && <p className="mt-3 text-xl text-cream/80">{item.subtitle}</p>}
            <div className="mt-6 text-sm text-cream/70">
              <AuthorLinks item={item} size={28} dark />
              <div className="mt-2 text-cream/55">
                {authorsOf(item).length > 0 && `${BYLINE_NOTE} · `}
                {formatDate(item.date)} · {item.readingTime} мин чтения
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Тело */}
      <div className="wrap mt-10">
        {html ? (
          <div className="article-body mx-auto max-w-prose" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className="mx-auto max-w-prose space-y-3.5" aria-hidden>
            {[100, 95, 98, 88, 0, 97, 92, 85].map((w, i) =>
              w === 0
                ? <div key={i} className="h-4" />
                : <div key={i} className="skeleton h-4 rounded-full" style={{ width: `${w}%` }} />,
            )}
          </div>
        )}
      </div>

      <ArticleFeedback slug={item.slug} cultureSlug={item.cultureSlug} />

      <Related related={related} />
    </article>
  )
}
