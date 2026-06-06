import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import SearchBar from './SearchBar'

const links = [
  { to: '/feed', label: 'Лента' },
  { to: '/cultures', label: 'Народы', match: '/culture' },
  { to: '/about', label: 'О проекте' },
]

function Logo() {
  return (
    <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="Голоса России — на главную">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy text-cream transition-colors group-hover:bg-teal">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 7v5a6 6 0 0 0 12 0V7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="12" y1="18" x2="12" y2="21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="12" cy="6" r="2.4" fill="#E07A5F" />
        </svg>
      </span>
      <span className="hidden font-display text-lg font-bold leading-none text-navy sm:inline">
        Голоса<span className="text-teal">России</span>
      </span>
    </Link>
  )
}

function NavLinks({ onClick }) {
  const location = useLocation()
  return links.map((l) => (
    <NavLink
      key={l.to}
      to={l.to}
      onClick={onClick}
      className={({ isActive }) =>
        `whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
          isActive || (l.match && location.pathname.startsWith(l.match))
            ? 'text-teal'
            : 'text-ink/70 hover:text-navy'
        }`
      }
    >
      {l.label}
    </NavLink>
  ))
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-navy/10 bg-cream/90 backdrop-blur-md' : 'bg-cream/60 backdrop-blur-sm'
      }`}
    >
      <nav className="wrap grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
        <Logo />

        {/* Поиск — растягивается, по центру на десктопе, виден и на мобиле */}
        <div className="md:px-2">
          <div className="mx-auto w-full md:max-w-[34rem]">
            <SearchBar />
          </div>
        </div>

        {/* Справа: ссылки + кнопка */}
        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-1 md:flex">
            <NavLinks />
          </div>

          {/* Бургер (мобильный) */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-navy/15 text-navy md:hidden"
            aria-label="Меню"
            aria-expanded={open}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Мобильное меню: ссылки */}
      {open && (
        <div className="border-t border-navy/10 bg-cream md:hidden">
          <div className="wrap flex flex-col gap-1 py-3">
            <NavLinks onClick={() => setOpen(false)} />
          </div>
        </div>
      )}
    </header>
  )
}
