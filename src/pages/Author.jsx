import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { UserPlus, Check } from 'lucide-react'
import { getAuthor, getCulture, contentByAuthor } from '../lib/data'
import { useAuth } from '../context/AuthContext'
import { AuthorAvatar } from '../components/ui'
import { ContentCard } from '../components/cards'
import NotFound from './NotFound'

const parseViews = (v) => {
  if (!v || v === '—') return 0
  const n = parseFloat(String(v).replace(',', '.'))
  return /тыс/.test(v) ? n * 1000 : n
}
const fmtViews = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(n / 1000 < 10 ? 1 : 0).replace('.', ',')} тыс.` : String(Math.round(n))

function SubscribeButton({ slug }) {
  const { user, openLogin } = useAuth()
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (!user) return
    try { setOn(localStorage.getItem(`golosa-sub:${slug}`) === '1') } catch { /* ignore */ }
  }, [slug, user])

  if (user?.slug === slug) return null

  const toggle = () => {
    if (!user) { openLogin(); return }
    const v = !on
    setOn(v)
    try { localStorage.setItem(`golosa-sub:${slug}`, v ? '1' : '0') } catch { /* ignore */ }
  }

  return on ? (
    <button onClick={toggle} className="btn-ghost shrink-0"><Check size={17} /> Вы подписаны</button>
  ) : (
    <button onClick={toggle} className="btn-primary shrink-0"><UserPlus size={17} /> Подписаться</button>
  )
}

function Stat({ value, label }) {
  return (
    <span className="whitespace-nowrap">
      <b className="font-display font-bold text-navy">{value}</b>{' '}
      <span className="text-ink/55">{label}</span>
    </span>
  )
}

export default function Author() {
  const { slug } = useParams()
  const author = getAuthor(slug)
  if (!author) return <NotFound />

  const culture = getCulture(author.cultureSlug)
  const items = contentByAuthor(slug)
  const views = items.reduce((s, c) => s + parseViews(c.views), 0)
  const accent = culture?.accent || '#1A3A5C'

  return (
    <div className="pb-6">
      {/* Цветная подложка */}
      <div className="h-36 w-full sm:h-44" style={{ background: `linear-gradient(135deg, ${accent}, #102640)` }} />

      <div className="wrap">
        {/* Аватар (заходит на подложку) + кнопка подписки */}
        <div className="-mt-12 flex items-end justify-between gap-4">
          <AuthorAvatar author={author} size={112} className="ring-4 ring-cream" />
          <SubscribeButton slug={author.slug} />
        </div>

        {/* Имя — строго ниже подложки */}
        <h1 className="mt-5 font-display text-3xl font-extrabold text-navy sm:text-4xl">{author.name}</h1>

        <p className="mt-3 max-w-2xl leading-relaxed text-ink/75">{author.bio}</p>

        {/* Компактная статистика */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <Stat value={author.followers} label="подписчиков" />
          <Stat value={items.length} label={items.length === 1 ? 'материал' : 'материалов'} />
          <Stat value={fmtViews(views)} label="просмотров" />
        </div>

        {/* Материалы */}
        <section className="mt-10">
          <h2 className="mb-6 font-display text-2xl font-bold text-navy">
            Материалы автора <span className="text-ink/35">{items.length}</span>
          </h2>
          {items.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((i) => <ContentCard key={i.slug} item={i} />)}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-navy/20 p-10 text-center text-ink/50">
              Пока нет опубликованных материалов.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
