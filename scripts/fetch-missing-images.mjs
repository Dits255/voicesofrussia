// Скачивает свободные изображения с Wikimedia Commons для слотов,
// которые пользователь не закрыл вручную. Запуск: node scripts/fetch-missing-images.mjs
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// slug материала -> поисковые запросы (по приоритету) на Commons
const JOBS = [
  { slug: 'alekseeva-intervyu', queries: ['podcast microphone studio', 'radio microphone interview', 'microphone recording'] },
  { slug: 'video-odin-den-olenevoda', queries: ['reindeer herder Yakutia', 'reindeer herding tundra Russia', 'reindeer herder'] },
  { slug: 'video-pochemu-ya-govoryu-na-yakutskom', queries: ['Yakut people Sakha', 'Sakha Republic people', 'Yakutsk people'] },
  { slug: 'video-babushka-varit-beshbarmak', queries: ['Beshbarmak dish', 'Beshbarmak', 'Kazakh cuisine meat'] },
]

const API = 'https://commons.wikimedia.org/w/api.php'

async function searchImage(query) {
  const url = `${API}?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=8` +
    `&gsrsearch=${encodeURIComponent(query + ' filetype:bitmap')}` +
    `&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1280`
  const res = await fetch(url, { headers: { 'User-Agent': 'GolosaRossii/1.0 (demo project)' } })
  if (!res.ok) throw new Error('api ' + res.status)
  const data = await res.json()
  const pages = Object.values(data?.query?.pages || {})
  // выбираем подходящее растровое изображение пошире
  const cand = pages
    .map((p) => p.imageinfo?.[0])
    .filter((i) => i && /jpeg|jpg|png/i.test(i.mime || '') && (i.thumbwidth || i.width) >= 800)
    .sort((a, b) => (b.thumbwidth || 0) - (a.thumbwidth || 0))[0]
  return cand?.thumburl || cand?.url || null
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'GolosaRossii/1.0 (demo project)' } })
  if (!res.ok) throw new Error('dl ' + res.status)
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.mkdir(path.dirname(dest), { recursive: true })
  await fs.writeFile(dest, buf)
  return buf.length
}

for (const job of JOBS) {
  let done = false
  for (const q of job.queries) {
    try {
      const url = await searchImage(q)
      if (!url) { console.log(`· «${q}» — нет результатов`); continue }
      const dest = path.join(ROOT, 'public', 'articles', job.slug, 'hero.jpg')
      const size = await download(url, dest)
      console.log(`✓ ${job.slug.padEnd(38)} ${(size / 1024).toFixed(0)} КБ  ← «${q}»`)
      done = true
      break
    } catch (e) {
      console.log(`· ${job.slug} «${q}» — ${e.message}`)
    }
  }
  if (!done) console.log(`✗ ${job.slug} — не удалось подобрать изображение`)
}
