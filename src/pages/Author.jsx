import { useParams, Link } from 'react-router-dom'
import { UserPlus, Check, MapPin, GraduationCap } from 'lucide-react'
import { getAuthor, getCulture, contentByAuthor } from '../lib/data'
import { useSubscriptions } from '../lib/hooks'
import { useAuth } from '../context/AuthContext'
import { AuthorAvatar, Reveal } from '../components/ui'
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
  const { has, toggle } = useSubscriptions()

  if (user?.slug === slug) return null

  const on = !!user && has(slug)
  const onClick = () => { if (!user) { openLogin(); return } toggle(slug) }

  return on ? (
    <button onClick={onClick} className="btn-ghost shrink-0"><Check size={17} /> Вы подписаны</button>
  ) : (
    <button onClick={onClick} className="btn-primary shrink-0"><UserPlus size={17} /> Подписаться</button>
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
      {/* Цветная подложка с орнаментом из кругов-логотипа */}
      <div className="relative h-36 w-full overflow-hidden sm:h-44" style={{ background: `linear-gradient(135deg, ${accent}, #102640)` }}>
        <svg viewBox="0 0 100 100" className="absolute -top-6 right-[8%] h-[150%] w-auto opacity-10" aria-hidden>
          <circle cx="50" cy="50" r="28" fill="#FAF8F4" />
          <circle cx="14" cy="22" r="12" fill="#FAF8F4" opacity="0.7" />
          <circle cx="86" cy="78" r="9" fill="#FAF8F4" opacity="0.5" />
          <circle cx="22" cy="84" r="7" fill="#FAF8F4" opacity="0.4" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="#FAF8F4" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>

      {/* relative — иначе позиционированный баннер перекрывает аватар, заходящий на него */}
      <div className="wrap relative">
        {/* Аватар (заходит на подложку) + кнопка подписки */}
        <div className="-mt-12 flex items-end justify-between gap-4">
          <AuthorAvatar author={author} size={112} className="ring-4 ring-cream" />
          <SubscribeButton slug={author.slug} />
        </div>

        {/* Имя — строго ниже подложки */}
        <h1 className="mt-5 font-display text-3xl font-extrabold text-navy sm:text-4xl">{author.name}</h1>

        {/* Роль, народ, регион */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {author.role && (
            <span className="chip bg-navy/[0.08] normal-case tracking-normal text-navy">
              <GraduationCap size={14} /> {author.role}
            </span>
          )}
          {culture && (
            <Link
              to={`/culture/${culture.slug}`}
              className="chip normal-case tracking-normal text-cream transition-opacity hover:opacity-85"
              style={{ backgroundColor: accent }}
            >
              {culture.name}
            </Link>
          )}
          {author.region && (
            <span className="chip bg-navy/[0.08] normal-case tracking-normal text-ink/65">
              <MapPin size={14} /> {author.region}
            </span>
          )}
        </div>

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
              {items.map((item, i) => (
                <Reveal key={item.slug} index={i % 3} className="h-full">
                  <ContentCard item={item} />
                </Reveal>
              ))}
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
