import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { content, cultures, cultureName, bylineFor } from '../lib/data'
import { useClickOutside } from '../lib/hooks'
import { FormatBadge } from './ui'

const norm = (s) => (s || '').toString().toLowerCase().replace(/ё/g, 'е')

export default function SearchBar({ autoFocus = false }) {
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)
  const wrapRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  // клик вне строки или Escape — закрыть подсказки
  useClickOutside(wrapRef, () => setFocused(false))

  const query = norm(q.trim())

  const peoples = useMemo(() => {
    if (!query) return []
    return cultures
      .filter((c) => norm([c.name, c.selfName, c.region, c.tagline, c.description].join(' ')).includes(query))
      .slice(0, 3)
  }, [query])

  const stories = useMemo(() => {
    if (!query) return []
    return content
      .filter((c) =>
        norm([c.title, c.subtitle, c.excerpt, bylineFor(c), c.format, cultureName(c.cultureSlug), (c.topics || []).join(' ')].join(' ')).includes(query)
      )
      .slice(0, 6)
  }, [query])

  const results = [
    ...peoples.map((c) => ({ kind: 'culture', item: c })),
    ...stories.map((c) => ({ kind: 'story', item: c })),
  ]
  const showPanel = focused && query.length > 0

  const go = (to) => { setFocused(false); setQ(''); inputRef.current?.blur(); navigate(to) }

  const goToFeed = () => {
    const trimmed = q.trim()
    setFocused(false)
    inputRef.current?.blur()
    navigate(trimmed ? `/feed?q=${encodeURIComponent(trimmed)}` : '/feed')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { setFocused(false); inputRef.current?.blur() }
    if (e.key === 'Enter') goToFeed()
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      <div
        className={`flex items-center gap-2.5 rounded-full border bg-white/90 px-4 transition-all ${
          focused ? 'border-teal shadow-card' : 'border-navy/15 hover:border-navy/30'
        }`}
      >
        <button onClick={goToFeed} aria-label="Перейти к результатам поиска" className="shrink-0 text-ink/40 hover:text-teal transition-colors">
          <Search size={17} />
        </button>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={onKeyDown}
          placeholder="Искать историю, народ, тему…"
          className="h-10 w-full min-w-0 bg-transparent text-sm text-navy outline-none placeholder:text-ink/40"
          aria-label="Поиск по сайту"
        />
        {q && (
          <button onClick={() => { setQ(''); inputRef.current?.focus() }} aria-label="Очистить" className="shrink-0 text-ink/40 hover:text-navy">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Выпадашка отрисовывается только при открытии (иначе пустая широкая
          обёртка создаёт горизонтальный оверфлоу страницы на мобиле).
          Центрирование через framer x:'-50%', чтобы не конфликтовать с transform. */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ x: '-50%' }}
            className="absolute left-1/2 top-[calc(100%+10px)] z-50 w-[min(32rem,92vw)] overflow-hidden rounded-2xl border border-navy/10 bg-cream shadow-card-hover"
          >
              <div className="max-h-[70vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-ink/55">
                  По запросу «{q.trim()}» ничего не найдено.
                </p>
              ) : (
                <>
                  {peoples.length > 0 && (
                    <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-ink/40">Народы</div>
                  )}
                  {peoples.map((c, i) => (
                    <Suggestion key={c.slug} index={i} onClick={() => go(`/culture/${c.slug}`)}>
                      <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                        <img src={c.cover} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-navy">{c.name}</span>
                        <span className="block truncate text-xs text-ink/50">{c.region}</span>
                      </span>
                    </Suggestion>
                  ))}

                  {stories.length > 0 && (
                    <div className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-widest text-ink/40">Истории</div>
                  )}
                  {stories.map((s, i) => (
                    <Suggestion key={s.slug} index={peoples.length + i} onClick={() => go(`/story/${s.slug}`)}>
                      <span className="h-11 w-16 shrink-0 overflow-hidden rounded-lg">
                        <img src={s.thumbnail} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="mb-1 flex items-center gap-2">
                          <FormatBadge format={s.format} soon={s.isPlaceholder} />
                          <span className="truncate text-xs text-teal">{cultureName(s.cultureSlug)}</span>
                        </span>
                        <span className="block truncate font-semibold text-navy">{s.title}</span>
                      </span>
                    </Suggestion>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Один пункт подсказки с плавным появлением и лёгким каскадом
function Suggestion({ children, onClick, index }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut', delay: Math.min(index * 0.035, 0.25) }}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-navy/5"
    >
      {children}
    </motion.button>
  )
}
