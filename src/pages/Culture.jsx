import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Languages, Users } from 'lucide-react'
import { getCulture, contentByCulture, relatedCultures, authorsByCulture } from '../lib/data'
import { ContentCard, CultureCard } from '../components/cards'
import { AuthorAvatar, Reveal } from '../components/ui'
import NotFound from './NotFound'

const TABS = [
  { id: 'all', label: 'Все' },
  { id: 'Лонгрид', label: 'Лонгриды' },
  { id: 'Интервью', label: 'Интервью' },
  { id: 'Подборка', label: 'Подборки' },
  { id: 'video', label: 'Видео' },
]

// Факт «журнальной врезкой»: без плашек, лейбл с акцентной иконкой и крупное значение
function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div className="min-w-0 flex-1 py-3 first:pt-0 last:pb-0 sm:px-6 sm:py-0 sm:first:pl-0 sm:last:pr-0">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-cream/50">
        <Icon size={14} style={{ color: accent }} aria-hidden /> {label}
      </div>
      <div className="mt-1.5 font-display text-base font-bold leading-snug text-cream sm:text-lg">{value}</div>
    </div>
  )
}

export default function Culture() {
  const { slug } = useParams()
  const culture = getCulture(slug)
  const [tab, setTab] = useState('all')

  // Бегущее подчёркивание активного таба. Нарочно без layoutId:
  // shared-layout-анимация внутри уходящей страницы подвешивает exit у AnimatePresence
  const tabsRef = useRef(null)
  const [bar, setBar] = useState(null)
  useEffect(() => {
    const btn = tabsRef.current?.querySelector(`[data-tab="${tab}"]`)
    if (btn) setBar({ left: btn.offsetLeft + 8, width: btn.offsetWidth - 16 })
  }, [tab])

  if (!culture) return <NotFound />

  const all = contentByCulture(slug)
  const items = all.filter((c) => {
    if (tab === 'all') return true
    if (tab === 'video') return c.format === 'Видео' || c.format === 'Короткое'
    return c.format === tab
  })

  return (
    <div className="pb-6">
      {/* Шапка — тёмный фон с подмешанным акцентом народа */}
      <header className="bg-navy text-cream">
        <div className="relative h-[42vh] min-h-[300px] w-full overflow-hidden sm:h-[50vh]">
          <img src={culture.cover} alt={culture.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-navy/15" />
          <div
            className="absolute inset-0 mix-blend-soft-light"
            style={{ background: `linear-gradient(160deg, ${culture.accent}AA, transparent 60%)` }}
            aria-hidden
          />
        </div>
        <div className="wrap relative -mt-40 pb-14 sm:-mt-44">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cream/15 px-3 py-1.5 text-sm backdrop-blur">
            <MapPin size={15} aria-hidden /> {culture.region}
          </div>
          <div className="mb-3 h-1.5 w-14 rounded-full" style={{ backgroundColor: culture.accent }} aria-hidden />
          <h1 className="font-display text-[1.6rem] font-extrabold leading-tight [overflow-wrap:anywhere] sm:text-4xl lg:text-5xl">{culture.name}</h1>
          <p className="mt-1 text-lg text-cream/70">самоназвание — {culture.selfName}</p>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-cream/85">{culture.description}</p>
          <div
            data-tour="culture-facts"
            className="mt-8 flex max-w-2xl flex-col divide-y divide-cream/15 sm:flex-row sm:divide-x sm:divide-y-0"
          >
            <Stat icon={Languages} label="Язык" value={culture.language} accent={culture.accent} />
            <Stat icon={Users} label="Население" value={culture.population} accent={culture.accent} />
            <Stat icon={MapPin} label="Регион" value={culture.region} accent={culture.accent} />
          </div>
        </div>
      </header>

      {/* Контент с табами */}
      <section className="wrap mt-12">
        <div ref={tabsRef} data-tour="culture-tabs" className="no-scrollbar relative mb-7 flex gap-2 overflow-x-auto border-b border-navy/10 pb-px">
          {bar && (
            <motion.span
              className="absolute bottom-0 h-[2.5px] rounded-full"
              style={{ backgroundColor: culture.accent }}
              initial={false}
              animate={{ left: bar.left, width: bar.width }}
              transition={{ type: 'spring', stiffness: 420, damping: 35 }}
              aria-hidden
            />
          )}
          {TABS.map((t) => {
            const count =
              t.id === 'all' ? all.length
                : t.id === 'video' ? all.filter((c) => c.format === 'Видео' || c.format === 'Короткое').length
                : all.filter((c) => c.format === t.id).length
            return (
              <button
                key={t.id}
                data-tab={t.id}
                onClick={() => setTab(t.id)}
                className={`relative shrink-0 px-4 py-3 text-sm font-semibold transition-colors ${
                  tab === t.id ? '' : 'text-ink/55 hover:text-navy'
                }`}
                style={tab === t.id ? { color: culture.accent } : undefined}
              >
                {t.label} <span className="text-ink/35">{count}</span>
              </button>
            )
          })}
        </div>

        {items.length > 0 ? (
          <div data-tour="culture-stories" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <Reveal key={item.slug} index={i % 3} className="h-full">
                <ContentCard item={item} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-navy/20 p-10 text-center text-ink/50">
            В этом формате историй пока нет.
          </p>
        )}
      </section>

      {/* Голоса народа */}
      {authorsByCulture(slug).length > 0 && (
        <section data-tour="culture-authors" className="wrap mt-16">
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
      <section data-tour="related-cultures" className="wrap mt-16">
        <h2 className="mb-6 font-display text-2xl font-bold text-navy">Похожие культуры</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {relatedCultures(slug, 3).map((c) => <CultureCard key={c.slug} culture={c} wide />)}
        </div>
      </section>
    </div>
  )
}
