import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, ThumbsUp, UserPlus, Clock3, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cultureName } from '../lib/data'
import { LS, DEFAULT_CONTENT, fmtNum } from '../lib/studio'
import { useLocal } from '../lib/hooks'
import { FormatBadge, CountUp } from '../components/ui'

const DAYS = 30
const TEAL = '#028090'

// Детерминированный «шум», чтобы график выглядел живым, но не менялся между визитами
const seeded = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x) }
const SERIES = Array.from({ length: DAYS }, (_, i) => {
  const weekend = i % 7 === 5 || i % 7 === 6 ? 1.25 : 1
  return Math.round((420 + i * 6 + Math.sin(i / 3.2) * 90 + seeded(i) * 160) * weekend)
})
const TOTAL_VIEWS = SERIES.reduce((s, v) => s + v, 0)

const SOURCES = [
  { label: 'Лента', value: 38 },
  { label: 'Поиск', value: 27 },
  { label: 'Подписки', value: 21 },
  { label: 'Внешние ссылки', value: 14 },
]

function DeltaChip({ value }) {
  const up = value >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
      up ? 'bg-teal/10 text-teal' : 'bg-clay/10 text-clay'
    }`}>
      <Icon size={13} /> {up ? '+' : ''}{value}%
    </span>
  )
}

function KpiTile({ icon: Icon, label, value, format, delta }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <Icon size={18} className="text-teal" />
        <DeltaChip value={delta} />
      </div>
      <div className="mt-2 font-display text-2xl font-extrabold text-navy">
        <CountUp value={value} format={format} />
      </div>
      <div className="text-xs uppercase tracking-wide text-ink/45">{label}</div>
    </div>
  )
}

const shortDate = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long' })
const dateOf = (i) => {
  const d = new Date()
  d.setDate(d.getDate() - (DAYS - 1 - i))
  return shortDate.format(d)
}

// Площадной график просмотров: линия «рисуется», при наведении — точка и значение
function ViewsChart({ data }) {
  const W = 640
  const H = 200
  const P = 10
  const ref = useRef(null)
  const [hover, setHover] = useState(null)

  const max = Math.max(...data)
  const pts = data.map((v, i) => [
    P + (i * (W - 2 * P)) / (data.length - 1),
    H - P - (v / max) * (H - 2 * P),
  ])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${H} L${pts[0][0].toFixed(1)},${H} Z`

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    const i = Math.round(((x - P) / (W - 2 * P)) * (data.length - 1))
    setHover(Math.min(data.length - 1, Math.max(0, i)))
  }

  // позиция тултипа в % ширины; у краёв прижимаем, чтобы не выходил за график
  const tipLeft = hover != null ? (pts[hover][0] / W) * 100 : 0
  const tipShift = tipLeft < 12 ? '0%' : tipLeft > 88 ? '-100%' : '-50%'

  return (
    <div>
      <div className="relative" ref={ref}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none"
          role="img"
          aria-label="График просмотров за 30 дней"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="views-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={TEAL} stopOpacity="0.22" />
              <stop offset="100%" stopColor={TEAL} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((t) => (
            <line key={t} x1={P} x2={W - P} y1={P + t * (H - 2 * P)} y2={P + t * (H - 2 * P)} stroke="#1A3A5C" strokeOpacity="0.07" />
          ))}
          <motion.path
            d={area}
            fill="url(#views-fill)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          />
          <motion.path
            d={line}
            fill="none"
            stroke={TEAL}
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
          {hover != null && (
            <g>
              <line
                x1={pts[hover][0]} x2={pts[hover][0]} y1={P} y2={H - P}
                stroke="#1A3A5C" strokeOpacity="0.25" strokeDasharray="3 4"
              />
              <circle cx={pts[hover][0]} cy={pts[hover][1]} r="5" fill={TEAL} stroke="#FAF8F4" strokeWidth="2.5" />
            </g>
          )}
        </svg>

        {hover != null && (
          <div
            className="pointer-events-none absolute -top-1 z-10 rounded-xl bg-navy px-3 py-1.5 text-cream shadow-card-hover"
            style={{ left: `${tipLeft}%`, transform: `translateX(${tipShift})` }}
          >
            <div className="whitespace-nowrap font-display text-sm font-bold">{fmtNum(data[hover])} просмотров</div>
            <div className="whitespace-nowrap text-xs text-cream/60">{dateOf(hover)}</div>
          </div>
        )}
      </div>
      <div className="mt-1 flex justify-between text-xs text-ink/40">
        <span>30 дней назад</span>
        <span>пик — {fmtNum(max)} в день</span>
        <span>сегодня</span>
      </div>
    </div>
  )
}

// Горизонтальная полоса с анимированным заполнением
function Bar({ pct, color = TEAL, delay = 0 }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy/[0.07]">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}

export default function StudioAnalytics() {
  const [content] = useLocal(LS.content, DEFAULT_CONTENT)
  const published = content.filter((c) => c.status === 'published')
  const top = [...published].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)
  const maxViews = Math.max(...top.map((c) => c.views || 0), 1)
  const likes = published.reduce((s, c) => s + (c.likes || 0), 0)

  return (
    <div className="wrap py-10">
      <header className="mb-6">
        <div className="eyebrow mb-2">Кабинет автора</div>
        <h1 className="font-display text-4xl font-extrabold text-navy sm:text-5xl">Аналитика</h1>
        <p className="mt-2 text-ink/55">Демо-данные за последние 30 дней.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile icon={Eye} label="Просмотры" value={TOTAL_VIEWS} format={fmtNum} delta={12} />
        <KpiTile icon={ThumbsUp} label="Лайки" value={likes} format={fmtNum} delta={8} />
        <KpiTile icon={UserPlus} label="Новые подписчики" value={86} delta={-3} />
        <KpiTile icon={Clock3} label="Среднее чтение" value={34} format={(n) => `${(n / 10).toFixed(1).replace('.', ',')} мин`} delta={5} />
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-navy">Просмотры за 30 дней</h2>
        <ViewsChart data={SERIES} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
          <h2 className="mb-5 font-display text-lg font-bold text-navy">Топ материалов</h2>
          <div className="space-y-5">
            {top.map((item, i) => (
              <div key={item.id}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <FormatBadge format={item.format} />
                    <span className="truncate text-sm font-semibold text-navy">{item.title}</span>
                  </div>
                  <span className="shrink-0 text-sm text-ink/55">
                    <Eye size={13} className="mr-1 inline -translate-y-px" />
                    {fmtNum(item.views)}
                  </span>
                </div>
                <Bar pct={((item.views || 0) / maxViews) * 100} delay={i * 0.08} />
                <div className="mt-1 text-xs text-ink/40">{cultureName(item.cultureSlug) || 'Народы России'}</div>
              </div>
            ))}
            {top.length === 0 && (
              <p className="rounded-xl border border-dashed border-navy/20 p-8 text-center text-sm text-ink/50">
                Опубликуйте первый материал, чтобы увидеть статистику.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-navy p-5 text-cream shadow-card sm:p-6">
          <h2 className="mb-5 font-display text-lg font-bold">Откуда приходят читатели</h2>
          <div className="space-y-4">
            {SOURCES.map((s, i) => (
              <div key={s.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-cream/85">{s.label}</span>
                  <span className="font-semibold">{s.value}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream/15">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${s.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-clay"
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-cream/50">
            Полная аналитика с разбивкой по регионам и устройствам появится при запуске платформы.
          </p>
        </div>
      </div>
    </div>
  )
}
