import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
          data-tour="hero-day"
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

        <div data-tour="trending">
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
    <section data-tour="fresh" className="wrap py-8">
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
  const scrollerRef = useRef(null)
  const [edge, setEdge] = useState({ left: true, right: false })

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const update = () => setEdge({
      left: el.scrollLeft < 8,
      right: el.scrollLeft > el.scrollWidth - el.clientWidth - 8,
    })
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])

  const scrollBy = (dir) => {
    const el = scrollerRef.current
    el?.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  const arrow = 'grid h-9 w-9 place-items-center rounded-full border border-navy/20 text-navy transition-all hover:bg-navy/5 disabled:opacity-30 disabled:hover:bg-transparent'

  return (
    <section className="wrap py-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-navy">Народы</h2>
        <div className="hidden gap-2 sm:flex">
          <button onClick={() => scrollBy(-1)} disabled={edge.left} aria-label="Прокрутить назад" className={arrow}>
            <ChevronLeft size={17} />
          </button>
          <button onClick={() => scrollBy(1)} disabled={edge.right} aria-label="Прокрутить вперёд" className={arrow}>
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      {/* Лента в ширину контейнера: отрицательные поля повторяют отступы .wrap,
          карточки при скролле растворяются в градиенте на линии контейнера */}
      <div className="relative -mx-5 sm:-mx-8 lg:-mx-12">
        {/* py-8/-my-8 — запас, чтобы overflow не обрезал тени карточек */}
        <div
          ref={scrollerRef}
          data-tour="peoples"
          className="no-scrollbar -my-8 flex gap-4 overflow-x-auto px-5 py-8 sm:px-8 lg:px-12"
        >
          {cultures.map((c) => (
            <CultureCard key={c.slug} culture={c} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-cream to-transparent sm:w-8 lg:w-12" aria-hidden />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-5 bg-gradient-to-l from-cream to-transparent sm:w-8 lg:w-12" aria-hidden />
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
