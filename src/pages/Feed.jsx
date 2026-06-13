import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { content, cultures, FORMATS, TOPICS, trending, sortByDate, cultureName, bylineFor } from '../lib/data'
import { useClickOutside } from '../lib/hooks'
import { ContentCard, TrendingRow } from '../components/cards'
import { Reveal } from '../components/ui'

const norm = (s) => (s || '').toString().toLowerCase().replace(/ё/g, 'е')

function Option({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
        active ? 'bg-navy text-cream' : 'text-ink/75 hover:bg-navy/5'
      }`}
    >
      <span className="truncate">{children}</span>
      {active && <Check size={15} className="shrink-0" />}
    </button>
  )
}

function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useClickOutside(ref, () => setOpen(false))

  const current = options.find((o) => o.id === value)
  const active = value != null
  const pick = (val) => { onChange(val); setOpen(false) }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
          active ? 'border-teal bg-teal text-cream' : 'border-navy/15 bg-white text-navy hover:border-navy/35'
        }`}
      >
        <span>{label}{active ? `: ${current?.label}` : ''}</span>
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            data-tour="filter-menu"
            className="absolute left-0 top-[calc(100%+8px)] z-40 max-h-[18rem] w-56 overflow-y-auto rounded-2xl border border-navy/10 bg-cream p-1.5 shadow-card-hover"
          >
            <Option active={value === null} onClick={() => pick(null)}>Все</Option>
            {options.map((o) => (
              <Option key={o.id} active={value === o.id} onClick={() => pick(o.id)}>{o.label}</Option>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Feed() {
  const [params, setParams] = useSearchParams()
  const [format, setFormat] = useState(params.get('format'))
  const [culture, setCulture] = useState(params.get('culture'))
  const [topic, setTopic] = useState(params.get('topic'))
  const q = params.get('q') || ''

  const update = (key, setter) => (val) => {
    setter(val)
    const next = new URLSearchParams(params)
    if (val) next.set(key, val)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const items = useMemo(() => {
    let list = sortByDate(content)
    if (q) {
      const nq = norm(q.trim())
      list = list.filter((c) =>
        norm([c.title, c.subtitle, c.excerpt, bylineFor(c), c.format, cultureName(c.cultureSlug), (c.topics || []).join(' ')].join(' ')).includes(nq)
      )
    }
    if (format) list = list.filter((c) => c.format === format)
    if (culture) list = list.filter((c) => c.cultureSlug === culture)
    if (topic) list = list.filter((c) => (c.topics || []).includes(topic))
    return list
  }, [q, format, culture, topic])

  const reset = () => {
    setFormat(null); setCulture(null); setTopic(null)
    setParams({}, { replace: true })
  }
  const active = format || culture || topic

  return (
    <div className="wrap py-10">
      <header className="mb-6">
        <div className="eyebrow mb-2">Лента</div>
        {q ? (
          <h1 className="font-display text-4xl font-extrabold text-navy sm:text-5xl">
            «{q}»
          </h1>
        ) : (
          <h1 className="font-display text-4xl font-extrabold text-navy sm:text-5xl">Все истории</h1>
        )}
      </header>

      {/* Компактная панель фильтров */}
      <div data-tour="filters" className="mb-8 flex flex-wrap items-center gap-2.5 border-y border-navy/10 py-4">
        <FilterDropdown label="Формат" value={format} onChange={update('format', setFormat)}
          options={FORMATS.filter((f) => f.active).map((f) => ({ id: f.id, label: f.label }))} />
        <FilterDropdown label="Народ" value={culture} onChange={update('culture', setCulture)}
          options={cultures.map((c) => ({ id: c.slug, label: c.name }))} />
        <FilterDropdown label="Тема" value={topic} onChange={update('topic', setTopic)}
          options={TOPICS.map((t) => ({ id: t, label: t }))} />
        {active && (
          <button onClick={reset} className="rounded-full px-3 py-2 text-sm font-semibold text-clay hover:bg-clay/10">
            Сбросить
          </button>
        )}
        <span className="ml-auto text-sm text-ink/50">{items.length} материалов</span>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        {/* Сетка */}
        <div>
          {items.length > 0 ? (
            <div data-tour="feed-grid" className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {items.map((i, idx) => (
                <Reveal key={i.slug} index={idx % 2} className="h-full">
                  <ContentCard item={i} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-navy/20 p-12 text-center text-ink/50">
              По этим фильтрам пока ничего нет.
              <button onClick={reset} className="ml-1 font-semibold text-teal hover:underline">Сбросить</button>
            </div>
          )}
        </div>

        {/* Сайдбар */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div data-tour="now-reading" className="rounded-2xl bg-navy p-6 text-cream">
            <div className="eyebrow text-clay">Сейчас читают</div>
            <h2 className="mt-1 font-display text-xl font-bold">Топ недели</h2>
            <div className="mt-3 divide-y divide-cream/10">
              {trending(5).map((t, i) => (
                <div key={t.slug} className="[&_*]:!text-cream">
                  <TrendingRow item={t} index={i} />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
