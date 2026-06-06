// Конвертация .docx статей -> HTML + извлечение изображений.
// Источник: ../статьи/*.docx  ->  ../src/content/<slug>/index.html (+ media/)
// Запуск: npm run convert
import mammoth from 'mammoth'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC_DIR = path.resolve(ROOT, 'статьи')
const OUT_DIR = path.resolve(ROOT, 'src', 'content')
const PUBLIC_ARTICLES = path.resolve(ROOT, 'public', 'articles')

// Имя файла .docx -> slug материала (совпадает со slug в content.json)
const FILE_TO_SLUG = {
  'Республика_Саха_в_миниатюре.docx': 'saha-v-miniature',
  'Среди_лесов_Сихотэ_Алиня_история_народа_удэгейцев.docx': 'sredi-lesov-sihote-alinya',
  'Традиции одного из кочевых народов России - буряты, их колорит и вера.docx': 'buryaty-tradicii',
  'Калмыки_как_состояние_души_о_традициях,_степных_тюльпанах,_солёном.docx': 'kalmyki-sostoyanie-dushi',
  'Гостеприимство_садака_и_свадьба_в_юрте_как_живут_казахи_в_России.docx': 'kazahi-sadaka-svadba',
  'Корейская_самоидентификация_в_Приморском_крае_в_наши_дни.docx': 'koreycy-samoidentifikaciya',
  'Культура_как_специя_как_живёт_азербайджанская_семья_во_Владивостоке.docx': 'azerbaydzhancy-kultura-kak-speciya',
  'Между долгом и свободой.docx': 'osetiny-mezhdu-dolgom-i-svobodoy',
  'Татары на Дальнем Востоке - как сохранить связь с корнями и остаться собой.docx': 'tatary-na-dalnem-vostoke',
  'ПРИМЕТЫ И СУЕВЕРИЯ ЖУРНАЛ.docx': 'primety-i-sueveriya',
  'статья_голоса_народов_необычные_музыкальные_инструменты_народов.docx': 'muzykalnye-instrumenty',
  'Интервью. Алексеева Галина Васильевна. .docx': 'alekseeva-intervyu',
}

// Нормализуем ключи карты в NFC, чтобы сравнение с именами файлов было устойчивым
for (const k of Object.keys(FILE_TO_SLUG)) {
  const nk = k.normalize('NFC')
  if (nk !== k) {
    FILE_TO_SLUG[nk] = FILE_TO_SLUG[k]
    delete FILE_TO_SLUG[k]
  }
}

const stripExt = (s) => s.replace(/\.[^.]+$/, '')

async function convertOne(file, slug) {
  const inPath = path.join(SRC_DIR, file)
  const outDir = path.join(OUT_DIR, slug) // src/content/<slug> — только текст
  const publicDir = path.join(PUBLIC_ARTICLES, slug) // public/articles/<slug> — картинки
  await fs.mkdir(outDir, { recursive: true })

  let imgIndex = 0
  const result = await mammoth.convertToHtml(
    { path: inPath },
    {
      convertImage: mammoth.images.imgElement(async (image) => {
        imgIndex += 1
        const ext = (image.contentType && image.contentType.split('/')[1] || 'png').replace('jpeg', 'jpg')
        const name = `img-${imgIndex}.${ext}`
        await fs.mkdir(publicDir, { recursive: true })
        const buffer = await image.read('base64')
        await fs.writeFile(path.join(publicDir, name), Buffer.from(buffer, 'base64'))
        // Абсолютный путь к статике (Vite раздаёт public/ из корня)
        return { src: `/articles/${slug}/${name}` }
      }),
      styleMap: [
        "p[style-name='Title'] => h1:fresh",
        "p[style-name='Heading 1'] => h2:fresh",
        "p[style-name='Heading 2'] => h3:fresh",
      ],
    }
  )

  let html = result.value

  // 1) Заголовок в документе (первый <p><strong>...</strong></p>) — вырезаем дубль
  let docTitle = ''
  const titleMatch = html.match(/^\s*<p>\s*<strong>(.*?)<\/strong>\s*<\/p>/i)
  if (titleMatch) {
    docTitle = titleMatch[1].replace(/<[^>]+>/g, '').trim()
    html = html.slice(titleMatch[0].length)
  }

  // 2) Первое изображение -> hero (и убираем обёрнутый <p><img></p> + подпись «Фото:»)
  let heroImage = ''
  let heroCaption = ''
  const imgMatch = html.match(/<p>\s*<img[^>]*src="([^"]+)"[^>]*\/?>\s*<\/p>/i)
  if (imgMatch) {
    heroImage = imgMatch[1]
    html = html.replace(imgMatch[0], '')
    const capMatch = html.match(/^\s*<p>\s*<em>([\s\S]*?)<\/em>\s*<\/p>/i)
    if (capMatch && /Фото|источник|автор/i.test(capMatch[1])) {
      heroCaption = capMatch[1].replace(/<[^>]+>/g, '').trim()
      html = html.replace(capMatch[0], '')
    }
  }

  html = html.trim()
  const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const excerpt = plain.slice(0, 200).replace(/\s+\S*$/, '') + '…'

  await fs.writeFile(path.join(outDir, 'index.html'), html, 'utf8')
  await fs.writeFile(
    path.join(outDir, 'meta.json'),
    JSON.stringify({ slug, docTitle, heroImage, heroCaption, excerpt, words: plain.split(' ').length }, null, 2),
    'utf8'
  )
  return { slug, file, images: imgIndex, words: plain.split(' ').length, hero: !!heroImage }
}

// Файлы-источники, которые НЕ превращаем в отдельный материал
const SKIP = new Set(['Текст для брошюры. Интервью с Г. В. Алексеевой. .docx'.normalize('NFC')])

async function main() {
  await fs.rm(OUT_DIR, { recursive: true, force: true })
  await fs.rm(PUBLIC_ARTICLES, { recursive: true, force: true })
  await fs.mkdir(OUT_DIR, { recursive: true })
  const files = await fs.readdir(SRC_DIR)
  const docx = files.filter((f) => f.toLowerCase().endsWith('.docx'))
  const report = []
  for (const file of docx) {
    const key = file.normalize('NFC') // macOS отдаёт имена в NFD
    if (SKIP.has(key)) {
      console.log(`· пропуск (брошюра): ${file}`)
      continue
    }
    const slug = FILE_TO_SLUG[key]
    if (!slug) {
      console.warn('⚠ нет маппинга для', file)
      continue
    }
    const r = await convertOne(file, slug)
    report.push(r)
    console.log(`✓ ${r.slug.padEnd(34)} ${String(r.words).padStart(5)} слов  ${r.images} изобр.`)
  }
  console.log(`\nГотово: ${report.length} статей -> ${path.relative(ROOT, OUT_DIR)}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
