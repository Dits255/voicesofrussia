import { Link } from 'react-router-dom'
import { formatIcon, formatLabel, authorsOf, getCulture, initials } from '../lib/data'

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
