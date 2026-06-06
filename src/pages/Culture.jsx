import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { getCulture, contentByCulture, relatedCultures, authorsByCulture } from '../lib/data'
import { ContentCard, CultureCard } from '../components/cards'
import { AuthorAvatar } from '../components/ui'
import NotFound from './NotFound'

const TABS = [
  { id: 'all', label: 'Все' },
  { id: 'Лонгрид', label: 'Лонгриды' },
  { id: 'Интервью', label: 'Интервью' },
  { id: 'Подборка', label: 'Подборки' },
  { id: 'video', label: 'Видео' },
]

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-cream/50">{label}</div>
      <div className="mt-1 font-semibold text-cream">{value}</div>
    </div>
  )
}

export default function Culture() {
  const { slug } = useParams()
  const culture = getCulture(slug)
  const [tab, setTab] = useState('all')
  if (!culture) return <NotFound />

  const all = contentByCulture(slug)
  const items = all.filter((c) => {
    if (tab === 'all') return true
    if (tab === 'video') return c.format === 'Видео' || c.format === 'Короткое'
    return c.format === tab
  })

  return (
    <div className="pb-6">
      {/* Шапка — тёмный фон, чтобы описание и статистика читались под фото */}
      <header className="bg-navy text-cream">
        <div className="relative h-[42vh] min-h-[300px] w-full overflow-hidden sm:h-[50vh]">
          <img src={culture.cover} alt={culture.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-navy/15" />
        </div>
        <div className="wrap relative -mt-40 pb-14 sm:-mt-44">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cream/15 px-3 py-1.5 text-sm backdrop-blur">
            <MapPin size={15} aria-hidden /> {culture.region}
          </div>
          <h1 className="font-display text-[1.6rem] font-extrabold leading-tight [overflow-wrap:anywhere] sm:text-4xl lg:text-5xl">{culture.name}</h1>
          <p className="mt-1 text-lg text-cream/70">самоназвание — {culture.selfName}</p>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-cream/85">{culture.description}</p>
          <div className="mt-7 grid max-w-lg grid-cols-2 gap-5 sm:grid-cols-3">
            <Stat label="Язык" value={culture.language} />
            <Stat label="Население" value={culture.population} />
            <Stat label="Регион" value={culture.region} />
          </div>
        </div>
      </header>

      {/* Контент с табами */}
      <section className="wrap mt-12">
        <div className="no-scrollbar mb-7 flex gap-2 overflow-x-auto border-b border-navy/10 pb-px">
          {TABS.map((t) => {
            const count =
              t.id === 'all' ? all.length
                : t.id === 'video' ? all.filter((c) => c.format === 'Видео' || c.format === 'Короткое').length
                : all.filter((c) => c.format === t.id).length
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  tab === t.id ? 'border-teal text-teal' : 'border-transparent text-ink/55 hover:text-navy'
                }`}
              >
                {t.label} <span className="text-ink/35">{count}</span>
              </button>
            )
          })}
        </div>

        {items.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((i) => <ContentCard key={i.slug} item={i} />)}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-navy/20 p-10 text-center text-ink/50">
            В этом формате историй пока нет.
          </p>
        )}
      </section>

      {/* Голоса народа */}
      {authorsByCulture(slug).length > 0 && (
        <section className="wrap mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold text-navy">Голоса народа</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {authorsByCulture(slug).map((a) => (
              <Link
                key={a.slug}
                to={`/author/${a.slug}`}
                className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover"
              >
                <AuthorAvatar author={a} size={56} />
                <div className="min-w-0">
                  <div className="font-display text-lg font-bold text-navy group-hover:text-teal">{a.name}</div>
                  <div className="text-sm text-ink/55">{a.role} · {a.followers} подписчиков</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Похожие культуры */}
      <section className="wrap mt-16">
        <h2 className="mb-6 font-display text-2xl font-bold text-navy">Похожие культуры</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {relatedCultures(slug, 3).map((c) => <CultureCard key={c.slug} culture={c} wide />)}
        </div>
      </section>
    </div>
  )
}
