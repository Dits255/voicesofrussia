import { Link } from 'react-router-dom'
import { cultures } from '../lib/data'

export default function Footer() {
  return (
    <footer className="mt-24 bg-navy text-cream/80">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="font-display text-xl font-bold text-cream">
            Голоса<span className="text-teal">России</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream/60">
            Мультимедийная платформа, где представители народов России рассказывают о себе сами —
            живо, лично и без музейного стекла.
          </p>
          <p className="mt-6 text-xs text-cream/40">© {new Date().getFullYear()} Голоса России</p>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-cream/40">Разделы</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/" className="hover:text-teal">Главная</Link></li>
            <li><Link to="/feed" className="hover:text-teal">Лента</Link></li>
            <li><Link to="/about" className="hover:text-teal">О проекте</Link></li>
            <li><Link to="/about#apply" className="hover:text-teal">Стать автором</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-cream/40">Народы</h4>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            {cultures.map((c) => (
              <li key={c.slug}>
                <Link to={`/culture/${c.slug}`} className="hover:text-teal">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
