import { cultures, contentByCulture } from '../lib/data'
import { CultureCard } from '../components/cards'

export default function Cultures() {
  return (
    <div className="wrap py-10">
      <header className="mb-8">
        <div className="eyebrow mb-2">Народы</div>
        <h1 className="font-display text-4xl font-extrabold text-navy sm:text-5xl">Народы платформы</h1>
        <p className="mt-2 max-w-2xl text-ink/60">
          {cultures.length} народов России — от тайги Сихотэ-Алиня до буддийских степей Калмыкии.
          Откройте любой, чтобы прочитать истории его представителей.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {cultures.map((c) => (
          <div key={c.slug} className="flex flex-col">
            <CultureCard culture={c} wide />
            <span className="mt-2 px-1 text-xs text-ink/45">
              {contentByCulture(c.slug).length} материалов
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
