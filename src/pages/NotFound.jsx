import { Link } from 'react-router-dom'
import { trending } from '../lib/data'
import { ContentCard } from '../components/cards'
import { Reveal } from '../components/ui'

export default function NotFound() {
  const popular = trending(3)

  return (
    <div className="wrap py-16 sm:py-20">
      <div className="relative mx-auto max-w-xl text-center">
        {/* Орнамент из кругов — отсылка к логотипу */}
        <svg viewBox="0 0 200 120" className="mx-auto w-64 max-w-full" aria-hidden>
          <circle cx="100" cy="60" r="34" fill="#E07A5F" opacity="0.9" />
          <circle cx="40" cy="30" r="16" fill="#1A3A5C" opacity="0.85" />
          <circle cx="165" cy="26" r="11" fill="#1A3A5C" opacity="0.55" />
          <circle cx="32" cy="92" r="12" fill="#1A3A5C" opacity="0.4" />
          <circle cx="170" cy="90" r="8" fill="#1A3A5C" opacity="0.3" />
          <circle cx="100" cy="60" r="48" fill="none" stroke="#1A3A5C" strokeWidth="1" opacity="0.15" />
          <text
            x="100" y="60"
            textAnchor="middle" dominantBaseline="central"
            fill="#FAF8F4" fontSize="30" fontWeight="800"
            fontFamily="inherit"
          >
            404
          </text>
        </svg>

        <h1 className="mt-6 font-display text-3xl font-bold text-navy">Такой истории нет</h1>
        <p className="mt-3 text-ink/60">
          Возможно, она переехала, ещё не опубликована — или этот голос пока не записан.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link to="/" className="btn-navy">На главную</Link>
          <Link to="/feed" className="btn-ghost">В ленту</Link>
        </div>
      </div>

      {popular.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-center font-display text-2xl font-bold text-navy">Сейчас читают</h2>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {popular.map((item, i) => (
              <Reveal key={item.slug} index={i} className="h-full">
                <ContentCard item={item} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
