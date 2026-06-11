import cultures from '../data/cultures.json'
import content from '../data/content.json'
import authors from '../data/authors.json'
import { BookOpen, Mic, LayoutList, Clapperboard, Zap, Headphones } from 'lucide-react'

export { cultures, content, authors }

// Приписка к байлайну, когда автор(ы) известны
export const BYLINE_NOTE = 'Студенты ДВФУ · направление «Журналистика»'

// --- Таксономии ---
export const FORMATS = [
  { id: 'Лонгрид', label: 'Лонгрид', Icon: BookOpen, active: true },
  { id: 'Интервью', label: 'Интервью', Icon: Mic, active: true },
  { id: 'Подборка', label: 'Подборка', Icon: LayoutList, active: true },
  { id: 'Видео', label: 'Видео', Icon: Clapperboard, active: true },
  { id: 'Короткое', label: 'Короткое видео', Icon: Zap, active: true },
  { id: 'Подкаст', label: 'Подкаст', Icon: Headphones, active: false },
]

export const TOPICS = ['Повседневность', 'Традиции', 'Язык', 'Еда', 'Музыка', 'Идентичность']

export const formatIcon = (id) => FORMATS.find((f) => f.id === id)?.Icon || BookOpen
export const formatLabel = (id) => FORMATS.find((f) => f.id === id)?.label || id

// --- Хелперы доступа ---
export const getCulture = (slug) => cultures.find((c) => c.slug === slug) || null
export const getContent = (slug) => content.find((c) => c.slug === slug) || null

export const cultureName = (slug) => getCulture(slug)?.name || ''
export const cultureAccent = (slug) => getCulture(slug)?.accent || '#1A3A5C'

export const contentByCulture = (slug) => content.filter((c) => c.cultureSlug === slug)

// --- Авторы ---
export const getAuthor = (slug) => authors.find((a) => a.slug === slug) || null
export const authorsOf = (item) => (item?.authorSlugs || []).map(getAuthor).filter(Boolean)
export const bylineFor = (item) => authorsOf(item).map((a) => a.name).join(', ')
export const contentByAuthor = (slug) =>
  content.filter((c) => (c.authorSlugs || []).includes(slug))
export const authorsByCulture = (slug) => authors.filter((a) => a.cultureSlug === slug)
export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export const featuredContent = () => content.filter((c) => c.featured)
export const sortByDate = (list) => [...list].sort((a, b) => (a.date < b.date ? 1 : -1))
export const trending = (n = 5) =>
  [...content]
    .filter((c) => !c.isPlaceholder)
    .sort((a, b) => parseViews(b.views) - parseViews(a.views))
    .slice(0, n)

function parseViews(v) {
  if (!v || v === '—') return 0
  const num = parseFloat(String(v).replace(',', '.'))
  return /тыс/.test(v) ? num * 1000 : num
}

// Похожие культуры: те же первые буквы региона не считаем — просто другие, кроме текущей
export const relatedCultures = (slug, n = 3) =>
  cultures.filter((c) => c.slug !== slug).slice(0, n)

// Похожие истории: тот же народ либо пересечение тем
export const relatedContent = (item, n = 3) => {
  if (!item) return []
  return content
    .filter((c) => c.slug !== item.slug && !c.isPlaceholder)
    .map((c) => {
      let score = 0
      if (c.cultureSlug && c.cultureSlug === item.cultureSlug) score += 3
      score += (c.topics || []).filter((t) => (item.topics || []).includes(t)).length
      return { c, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.c)
}

// --- Тело статьи (сырой HTML, собранный из docx) ---
// Ленивый glob: HTML статей не попадает в основной бандл,
// каждая статья грузится отдельным чанком при открытии
const bodies = import.meta.glob('../content/*/index.html', {
  query: '?raw',
  import: 'default',
})

export const loadArticleHtml = (slug) => {
  const load = bodies[`../content/${slug}/index.html`]
  return load ? load() : Promise.resolve('')
}

export const formatDate = (iso) => {
  if (!iso) return ''
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ]
  const d = new Date(iso)
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}
