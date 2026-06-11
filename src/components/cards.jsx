import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Play } from 'lucide-react'
import { getCulture, cultureName } from '../lib/data'
import { FormatBadge, Byline, CoverImage } from './ui'

const MotionLink = motion(Link)

const linkFor = (item) => `/story/${item.slug}`

// === Карточка-голос: крупный портрет, ядро главной ===
export function VoiceCard({ item, className = '' }) {
  const culture = getCulture(item.cultureSlug)
  const accent = culture?.accent || '#1A3A5C'
  return (
    <Link
      to={linkFor(item)}
      className={`group relative isolate block overflow-hidden rounded-2xl shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${className}`}
    >
      <div className="aspect-[3/4] w-full overflow-hidden">
        <CoverImage
          src={item.thumbnail}
          alt={item.title}
          accent={accent}
          label={cultureName(item.cultureSlug)}
          imgClassName="will-change-transform transition-transform duration-500 group-hover:scale-[1.06]"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/35 to-transparent" />

      <div className="absolute left-4 top-4 flex items-center gap-2">
        <FormatBadge format={item.format} soon={item.isPlaceholder} />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 text-cream">
        <span
          className="chip mb-2 text-cream"
          style={{ backgroundColor: accent }}
        >
          {cultureName(item.cultureSlug) || 'Народы России'}
        </span>
        <h3 className="font-display text-lg font-bold leading-snug [overflow-wrap:anywhere]">{item.title}</h3>
      </div>
    </Link>
  )
}

// === Универсальная контент-карточка (лента, сетки) ===
export function ContentCard({ item }) {
  const accent = getCulture(item.cultureSlug)?.accent || '#1A3A5C'
  return (
    <Link
      to={linkFor(item)}
      className="group isolate flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <CoverImage
          src={item.thumbnail}
          alt={item.title}
          accent={accent}
          label={cultureName(item.cultureSlug)}
          imgClassName="will-change-transform transition-transform duration-500 group-hover:scale-[1.05]"
        />
        <div className="absolute left-3 top-3">
          <FormatBadge format={item.format} soon={item.isPlaceholder} />
        </div>
        {item.isPlaceholder && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-cream/90 text-navy shadow-lg">
              <Play size={20} fill="currentColor" className="ml-0.5" />
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-teal">
          <span>{cultureName(item.cultureSlug) || 'Народы России'}</span>
        </div>
        <h3 className="font-display text-lg font-bold leading-snug text-navy group-hover:text-teal [overflow-wrap:anywhere]">
          {item.title}
        </h3>
        {item.subtitle && <p className="mt-1.5 line-clamp-2 text-sm text-ink/60">{item.subtitle}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <Byline item={item} avatarSize={22} />
          <span className="shrink-0 text-xs text-ink/45">
            {item.duration ? item.duration : `${item.readingTime} мин`}
          </span>
        </div>
      </div>
    </Link>
  )
}

// === Карточка народа (горизонтальная лента + сетки): 3D-наклон за курсором ===
export function CultureCard({ culture, wide = false }) {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 220, damping: 20 })
  const sry = useSpring(ry, { stiffness: 220, damping: 20 })

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 7)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 7)
  }
  const onLeave = () => { rx.set(0); ry.set(0) }

  return (
    <MotionLink
      to={`/culture/${culture.slug}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 800 }}
      className={`group relative isolate block shrink-0 overflow-hidden rounded-2xl shadow-card transition-shadow duration-300 hover:shadow-card-hover ${
        wide ? '' : 'w-[78vw] sm:w-[340px]'
      }`}
    >
      <div className="aspect-[4/5] w-full overflow-hidden">
        <CoverImage
          src={culture.cover}
          alt={culture.name}
          accent={culture.accent}
          label={culture.name}
          imgClassName="will-change-transform transition-transform duration-500 group-hover:scale-[1.06]"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 text-cream">
        <div
          className="mb-1 sm:mb-2 inline-block h-1 w-8 sm:w-10 rounded-full"
          style={{ backgroundColor: culture.accent }}
        />
        <h3 className="font-display text-lg sm:text-2xl font-bold leading-tight [overflow-wrap:anywhere]">{culture.name}</h3>
        <p className="text-xs sm:text-sm text-cream/70">{culture.region}</p>
        <p className="mt-1 sm:mt-2 line-clamp-2 text-xs sm:text-sm text-cream/85">{culture.tagline}</p>
      </div>
    </MotionLink>
  )
}

// === Компактная строка для сайдбара «Сейчас читают» ===
export function TrendingRow({ item, index }) {
  return (
    <Link to={linkFor(item)} className="group flex gap-3 py-3">
      <span className="font-display text-xl font-bold text-clay/70">{String(index + 1).padStart(2, '0')}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal">
          {cultureName(item.cultureSlug) || item.format}
        </p>
        <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-navy group-hover:text-teal">
          {item.title}
        </h4>
        <span className="text-xs text-ink/45">{item.views} просмотров</span>
      </div>
    </Link>
  )
}
