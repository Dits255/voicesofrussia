import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { formatIcon, formatLabel, authorsOf, getCulture, initials } from '../lib/data'

// Число «накручивается» от нуля при появлении
export function CountUp({ value, format = String }) {
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) => format(Math.round(v)))
  useEffect(() => {
    const ctrl = animate(mv, value, { duration: 1.1, ease: [0.22, 1, 0.36, 1] })
    return () => ctrl.stop()
  }, [mv, value])
  return <motion.span>{text}</motion.span>
}

// Каскадное появление при скролле: элемент всплывает снизу с задержкой по индексу
export function Reveal({ index = 0, className = '', children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Обложка: скелетон-шиммер пока грузится, фирменный градиент-фолбэк при ошибке
export function CoverImage({ src, alt = '', accent = '#1A3A5C', label = '', imgClassName = '', className = '', eager = false }) {
  const [state, setState] = useState(src ? 'loading' : 'error')
  return (
    <div className={`relative h-full w-full ${className}`}>
      {state !== 'error' && (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          ref={(el) => { if (el && el.complete && el.naturalWidth > 0 && state === 'loading') setState('done') }}
          onLoad={() => setState('done')}
          onError={() => setState('error')}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            state === 'done' ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
        />
      )}
      {state === 'loading' && <div className="skeleton absolute inset-0" aria-hidden />}
      {state === 'error' && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ background: `linear-gradient(140deg, ${accent} 0%, #14273E 100%)` }}
          aria-hidden
        >
          {/* орнамент из кругов — отсылка к логотипу */}
          <svg viewBox="0 0 100 100" className="absolute -right-4 -top-4 h-2/3 w-2/3 opacity-15" aria-hidden>
            <circle cx="50" cy="50" r="28" fill="#FAF8F4" />
            <circle cx="14" cy="22" r="12" fill="#FAF8F4" opacity="0.7" />
            <circle cx="86" cy="78" r="9" fill="#FAF8F4" opacity="0.5" />
            <circle cx="22" cy="84" r="7" fill="#FAF8F4" opacity="0.4" />
          </svg>
          {label && (
            <span className="absolute bottom-2 left-4 select-none font-display text-6xl font-extrabold text-cream/25">
              {label[0]}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Аватар автора — инициалы на цвете народа (фото ещё не загружено)
export function AuthorAvatar({ author, size = 32, className = '' }) {
  const accent = getCulture(author?.cultureSlug)?.accent || '#1A3A5C'
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-display font-bold leading-none text-cream ${className}`}
      style={{ width: size, height: size, background: accent, fontSize: Math.round(size * 0.4) }}
      aria-hidden
    >
      {initials(author?.name)}
    </span>
  )
}

// Байлайн: аватар первого автора + имена (ссылки на профиль при linked)
export function Byline({ item, linked = false, dark = false, avatarSize = 24 }) {
  const list = authorsOf(item)
  if (!list.length) return null
  const nameCls = dark ? 'text-cream/85' : 'text-ink/65'
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <AuthorAvatar author={list[0]} size={avatarSize} />
      <span className={`truncate text-sm ${nameCls}`}>
        {list.map((a, i) => (
          <span key={a.slug}>
            {i > 0 && ', '}
            {linked ? (
              <Link to={`/author/${a.slug}`} className="font-medium hover:text-teal">{a.name}</Link>
            ) : (
              <span className="font-medium">{a.name}</span>
            )}
          </span>
        ))}
      </span>
    </span>
  )
}

// Бейдж формата
export function FormatBadge({ format, soon = false, className = '' }) {
  const Icon = formatIcon(format)
  return (
    <span
      className={`chip ${
        soon ? 'bg-clay text-white' : 'bg-navy/85 text-cream backdrop-blur'
      } ${className}`}
    >
      <Icon size={13} strokeWidth={2.4} aria-hidden />
      {formatLabel(format)}
      {soon && <span className="ml-1 normal-case text-white/85">· скоро</span>}
    </span>
  )
}

// Заголовок секции с «глазком» и опциональной ссылкой
export function SectionHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6">
      <div>
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h2 className="text-2xl font-bold leading-tight text-navy sm:text-3xl md:text-[2.1rem]">
          {title}
        </h2>
        {subtitle && <p className="mt-2 max-w-xl text-ink/60">{subtitle}</p>}
      </div>
      {action && (
        <Link
          to={action.to}
          className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-teal hover:gap-2.5 sm:inline-flex"
          style={{ transition: 'gap .2s' }}
        >
          {action.label}
          <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  )
}

// Метка времени чтения / длительности
export function MetaLine({ item }) {
  return (
    <span className="text-xs text-ink/50">
      {item.duration ? item.duration : item.readingTime ? `${item.readingTime} мин чтения` : ''}
    </span>
  )
}
