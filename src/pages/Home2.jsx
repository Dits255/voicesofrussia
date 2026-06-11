import { Link } from 'react-router-dom'
import {
  cultures, content, featuredContent, trending, sortByDate, cultureName, bylineFor,
} from '../lib/data'
import { TrendingRow, ContentCard, CultureCard } from '../components/cards'
import { FormatBadge } from '../components/ui'

function HeroBlock() {
  const lead = featuredContent()[0]
  const trendItems = trending(5)

  return (
    <section className="wrap py-8 lg:py-12">
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr] lg:items-start">
        <Link
          to={`/story/${lead.slug}`}
          className="group relative block overflow-hidden rounded-2xl shadow-card-hover"
        >
          <div className="aspect-[4/3] w-full overflow-hidden">
            <img
              src={lead.hero}
              alt={lead.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/45 to-transparent" />
          <div className="absolute left-5 top-5">
            <FormatBadge format={lead.format} />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-7 text-cream">
            <span className="eyebrow text-clay">Публикация дня</span>
            <h2 className="mt-1.5 font-display text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
              {lead.title}
            </h2>
            {lead.subtitle && (
              <p className="mt-1.5 hidden text-base text-cream/75 sm:block sm:text-lg">{lead.subtitle}</p>
            )}
            <div className="mt-2 text-xs text-cream/70 sm:mt-4 sm:text-sm">
              {cultureName(lead.cultureSlug)}
              {bylineFor(lead) ? ` · ${bylineFor(lead)}` : ''}
            </div>
          </div>
        </Link>

        <div>
          <h2 className="font-display text-xl font-bold text-navy">В тренде на неделе</h2>
          <div className="mt-2 h-px bg-navy/10" />
          <div className="divide-y divide-navy/[0.08]">
            {trendItems.map((item, i) => (
              <TrendingRow key={item.slug} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ContentGrid() {
  const items = sortByDate(content.filter((c) => c.hasBody && !c.isPlaceholder)).slice(0, 8)
  return (
    <section className="wrap py-8">
      <h2 className="mb-5 font-display text-xl font-bold text-navy">Свежие истории</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <ContentCard key={item.slug} item={item} />
        ))}
      </div>
    </section>
  )
}

function PeoplesStrip() {
  return (
    <section className="py-8">
      <div className="wrap mb-5">
        <h2 className="font-display text-xl font-bold text-navy">Народы</h2>
      </div>
      {/* py-8/-my-8 — запас, чтобы overflow-контейнер не обрезал тени карточек */}
      <div className="no-scrollbar -mt-8 -mb-5 flex gap-4 overflow-x-auto px-5 py-8 sm:px-8 lg:px-12">
        {cultures.map((c) => (
          <CultureCard key={c.slug} culture={c} />
        ))}
      </div>
    </section>
  )
}

export default function Home2() {
  return (
    <>
      <HeroBlock />
      <div className="border-t border-navy/10">
        <ContentGrid />
        <PeoplesStrip />
      </div>
    </>
  )
}
