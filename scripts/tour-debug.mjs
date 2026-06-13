// Отладка презентации: следит за счётчиком шагов (часть листается сама),
// жмёт «Далее» на ручных шагах, пишет скриншот каждого шага в temp/tour
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const URL = 'http://localhost:4399/'
const OUT = 'temp/tour'
fs.mkdirSync(OUT, { recursive: true })

// сколько ждать стабильности перед «Далее» (по заголовку шага)
// у скриптовых шагов ожидание должно перекрывать всё действие с полётами курсора,
// иначе «Далее» отменит сценарий на середине (например, до клика «Войти»)
const WAIT_BY_TITLE = {
  'Входим как читатель': 12000,
  'Входим как автор': 12000,
  'Система оценок': 17000,
  'Кнопка «Добавить»': 14000,
  'Стать автором': 13000,
  'График просмотров': 9000,
  'Лонгрид': 9000,
  'О проекте': 8000,
  'Фильтры ленты': 7500,
  'Меню профиля → Закладки': 8000,
  'Меню → История просмотров': 8000,
  'Меню → Настройки': 8000,
  'Меню → Студия': 8000,
  'Футер': 8000,
  'Комментарии': 9000,
  'Например, корейцы': 6000,
  'Истории народа': 6000,
  'Автор истории': 6000,
  'Сменим роль': 6000,
  'Поиск с подсказками': 6000,
  'Лайк': 5000,
  'Подписка на автора': 5000,
  'В закладки': 5000,
  'Вкладка «Народы»': 5000,
  'Вкладка «Подписки»': 5000,
  'Уведомления': 5000,
  'Аналитика: метрики': 5000,
  'Гайдлайны': 5000,
  'Аудитория': 5000,
}
const DEFAULT_WAIT = 3500

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message.slice(0, 300)))
page.on('console', (m) => { if (m.text().includes('презентация')) console.log('CONSOLE:', m.text()) })

await page.goto(URL, { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle0' })
await page.evaluate(() => window.dispatchEvent(new Event('golosa:presentation')))

const read = () => page.evaluate(() => {
  const counter = document.querySelector('.z-\\[200\\] .eyebrow')?.textContent || null
  const spotEl = [...document.querySelectorAll('.z-\\[200\\] > div')].find((d) => d.style.boxShadow)
  const r = spotEl?.getBoundingClientRect()
  return {
    counter,
    title: document.querySelector('.z-\\[200\\] h3')?.textContent || '',
    path: location.pathname,
    spot: r ? `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}` : 'нет',
  }
})

let last = null
let stableSince = Date.now()
let started = false
const deadline = Date.now() + 540000

while (Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 600))
  const info = await read()
  if (!info.counter) {
    if (started) { console.log('Тур завершён.'); break }
    continue
  }
  started = true
  if (info.counter !== last) {
    last = info.counter
    stableSince = Date.now()
    await new Promise((r) => setTimeout(r, 1400)) // даём прожектору доехать
    const after = await read()
    const n = info.counter.split('/')[0].trim().padStart(2, '0')
    console.log(`шаг [${after.counter}] "${after.title}" path=${after.path} spot=${after.spot}`)
    await page.screenshot({ path: `${OUT}/step-${n}.png` })
    continue
  }
  const wait = WAIT_BY_TITLE[info.title] ?? DEFAULT_WAIT
  if (Date.now() - stableSince > wait) {
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('.z-\\[200\\] button')]
        .find((x) => x.textContent.includes('Далее') || x.textContent.includes('Завершить'))
      b?.click()
    })
    stableSince = Date.now()
  }
}
await browser.close()
console.log('done')
