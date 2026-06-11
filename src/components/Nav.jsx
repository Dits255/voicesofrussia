import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bookmark, Clock, Bell, Settings, LogOut, LayoutDashboard, BarChart3,
  UserCircle2, Plus,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useClickOutside } from '../lib/hooks'
import SearchBar from './SearchBar'
import LoginModal from './LoginModal'
import ProfileModal from './ProfileModal'
import AddContentModal from './AddContentModal'

const links = [
  { to: '/feed', label: 'Лента' },
  { to: '/cultures', label: 'Народы', match: '/culture' },
]

const STUDIO_LINKS = [
  { to: '/studio', label: 'Студия' },
  { to: '/studio/analytics', label: 'Аналитика' },
  { to: '/studio/guidelines', label: 'Гайдлайны' },
  { to: '/studio/audience', label: 'Аудитория' },
]

const CONTENT_TYPES = ['Лонгрид', 'Интервью', 'Видео', 'Подкаст']

const linkCls = (active) =>
  `whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-semibold transition-colors ${
    active ? 'text-teal' : 'text-ink/70 hover:text-navy'
  }`

function Logo() {
  return (
    <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="Голоса России — на главную">
      <svg
        viewBox="0 0 80 80" width="48" height="48"
        className="shrink-0 transition-opacity group-hover:opacity-75"
        aria-hidden
      >
        {/* Круги вокруг центра — в акцентных цветах народов платформы */}
        <circle cx="42" cy="40" r="22" fill="none" stroke="#E07A5F" strokeWidth="1" opacity="0.2"/>
        <circle cx="16" cy="24" r="10" fill="#4A8FB0"/>
        <circle cx="64" cy="18" r="7"  fill="#2A9D8F"/>
        <circle cx="20" cy="58" r="9"  fill="#E0A458"/>
        <circle cx="63" cy="58" r="5"  fill="#3E7B59"/>
        <circle cx="70" cy="38" r="4"  fill="#B5524A"/>
        <circle cx="42" cy="40" r="15" fill="#E07A5F"/>
      </svg>
      <span className="hidden font-display text-lg font-bold leading-none text-navy sm:inline">
        Голоса<span className="text-teal">России</span>
      </span>
    </Link>
  )
}

// Ползунок-подчёркивание, плавно перетекающий между активными пунктами
function Underline({ layoutId }) {
  return (
    <motion.span
      layoutId={layoutId}
      transition={{ type: 'spring', stiffness: 420, damping: 35 }}
      className="absolute inset-x-2.5 bottom-0 h-[2.5px] rounded-full bg-teal"
      aria-hidden
    />
  )
}

function NavLinks({ onClick, underlineId = 'nav-underline' }) {
  const { user } = useAuth()
  const location = useLocation()
  const all = user ? [...links, { to: '/subscriptions', label: 'Подписки' }] : links
  return all.map((l) => {
    const active = location.pathname === l.to || (l.match && location.pathname.startsWith(l.match))
    return (
      <NavLink key={l.to} to={l.to} onClick={onClick} className={`relative ${linkCls(active)}`}>
        {l.label}
        {active && <Underline layoutId={underlineId} />}
      </NavLink>
    )
  })
}

function DropItem({ icon: Icon, label, to, onClick, disabled }) {
  const base = `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors`
  const active = `text-ink/75 hover:bg-navy/5 hover:text-navy`
  const off = `cursor-not-allowed text-ink/30`

  if (to && !disabled) {
    return (
      <Link to={to} onClick={onClick} className={`${base} ${active}`}>
        {Icon && <Icon size={15} className="shrink-0" />}
        {label}
      </Link>
    )
  }
  return (
    <button disabled={disabled} onClick={onClick} className={`${base} ${disabled ? off : active}`}>
      {Icon && <Icon size={15} className="shrink-0" />}
      {label}
    </button>
  )
}

function UserDropdown({ onClose }) {
  const { user, logout, openProfile } = useAuth()
  const navigate = useNavigate()

  const openSettings = () => { onClose(); openProfile() }

  const doLogout = () => {
    logout()
    onClose()
    navigate('/')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl border border-navy/10 bg-cream shadow-card-hover"
    >
      <div className="border-b border-navy/10 px-4 py-3.5">
        <p className="font-semibold text-navy">{user.name}</p>
        <p className="text-xs text-ink/45">
          {user.role === 'author' ? 'Автор платформы' : 'user@platform.ru'}
        </p>
      </div>

      <div className="p-1.5">
        {user.role === 'author' ? (
          <>
            <DropItem icon={UserCircle2} label="Мой канал" to="/author/author-platformy" onClick={onClose} />
            <DropItem icon={LayoutDashboard} label="Студия" to="/studio" onClick={onClose} />
            <DropItem icon={BarChart3} label="Аналитика" to="/studio/analytics" onClick={onClose} />
            <div className="mx-3 my-1 h-px bg-navy/20" />
            <DropItem icon={Bookmark} label="Закладки" to="/bookmarks" onClick={onClose} />
            <DropItem icon={Clock} label="История просмотров" to="/history" onClick={onClose} />
            <DropItem icon={Bell} label="Уведомления" to="/notifications" onClick={onClose} />
            <DropItem icon={Settings} label="Настройки" onClick={openSettings} />
          </>
        ) : (
          <>
            <DropItem icon={Bookmark} label="Закладки" to="/bookmarks" onClick={onClose} />
            <DropItem icon={Clock} label="История просмотров" to="/history" onClick={onClose} />
            <DropItem icon={Bell} label="Уведомления" to="/notifications" onClick={onClose} />
            <DropItem icon={UserCircle2} label="Стать автором" to="/about#apply" onClick={onClose} />
            <DropItem icon={Settings} label="Настройки" onClick={openSettings} />
          </>
        )}

        <div className="mx-3 my-1 h-px bg-navy/20" />
        <button
          onClick={doLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-clay transition-colors hover:bg-clay/[0.08]"
        >
          <LogOut size={15} className="shrink-0" />
          Выйти
        </button>
      </div>
    </motion.div>
  )
}

function AuthButton() {
  const { user, openLogin } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useClickOutside(ref, () => setOpen(false))

  if (!user) {
    return (
      <button
        onClick={openLogin}
        className="rounded-full border border-navy/20 px-3.5 py-2 text-sm font-semibold text-navy transition-colors hover:border-teal hover:text-teal"
      >
        Войти
      </button>
    )
  }

  const bg = user.role === 'author' ? '#E07A5F' : '#1A3A5C'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={user.name}
        aria-haspopup="menu"
        aria-expanded={open}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-bold text-cream transition-opacity hover:opacity-80"
        style={{ background: bg }}
      >
        {user.initials}
      </button>
      <AnimatePresence>
        {open && <UserDropdown onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}

/* ── Studio-only components ── */

function AddContentButton() {
  const { openAddContent } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useClickOutside(ref, () => setOpen(false))

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border-2 border-clay px-3.5 py-1.5 text-sm font-semibold text-clay transition-colors hover:bg-clay/[0.08]"
      >
        <Plus size={16} strokeWidth={2.5} />
        Добавить
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-40 overflow-hidden rounded-2xl border border-navy/10 bg-cream shadow-card-hover"
          >
            <div className="p-1.5">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => { setOpen(false); openAddContent(type) }}
                  className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-ink/70 hover:bg-navy/5 hover:text-navy"
                >
                  {type}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StudioUserDropdown({ onClose, onSettings }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const doLogout = () => {
    logout()
    onClose()
    navigate('/')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 overflow-hidden rounded-2xl border border-navy/10 bg-cream shadow-card-hover"
    >
      <div className="border-b border-navy/10 px-4 py-3.5">
        <p className="font-semibold text-navy">{user?.name}</p>
        <p className="text-xs text-ink/45">Автор платформы</p>
      </div>
      <div className="p-1.5">
        <DropItem icon={UserCircle2} label="Мой канал" to="/author/author-platformy" onClick={onClose} />
        <DropItem icon={Settings} label="Настройки профиля" onClick={() => { onClose(); onSettings() }} />
        <div className="mx-3 my-1 h-px bg-navy/20" />
        <button
          onClick={doLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-clay transition-colors hover:bg-clay/[0.08]"
        >
          <LogOut size={15} className="shrink-0" />
          Выйти
        </button>
      </div>
    </motion.div>
  )
}

function StudioAuthButton() {
  const { user, openLogin, openProfile } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useClickOutside(ref, () => setOpen(false))

  if (!user) {
    return (
      <button
        onClick={openLogin}
        className="rounded-full border border-navy/20 px-3.5 py-2 text-sm font-semibold text-navy transition-colors hover:border-teal hover:text-teal"
      >
        Войти
      </button>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={user.name}
        aria-haspopup="menu"
        aria-expanded={open}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-bold text-cream transition-opacity hover:opacity-80"
        style={{ background: '#E07A5F' }}
      >
        {user.initials}
      </button>
      <AnimatePresence>
        {open && (
          <StudioUserDropdown
            onClose={() => setOpen(false)}
            onSettings={openProfile}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { showLogin, showProfile, showAddContent } = useAuth()
  const location = useLocation()

  const isStudio = location.pathname.startsWith('/studio')

  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'border-b border-navy/10 bg-cream/90 backdrop-blur-md' : 'bg-cream/60 backdrop-blur-sm'
        }`}
      >
        {isStudio ? (
          <>
            <nav className="wrap flex h-16 items-center justify-between gap-2">
              <Logo />
              <div className="flex items-center gap-0.5">
                <div className="hidden items-center gap-0.5 sm:flex">
                  {STUDIO_LINKS.map(({ to, label }) => {
                    const active = location.pathname === to
                    return (
                      <Link key={to} to={to} className={`relative ${linkCls(active)}`}>
                        {label}
                        {active && <Underline layoutId="studio-underline" />}
                      </Link>
                    )
                  })}
                  <div className="mx-2 h-5 w-px bg-navy/15" />
                </div>
                <AddContentButton />
                <div className="ml-1">
                  <StudioAuthButton />
                </div>
              </div>
            </nav>
            <div className="no-scrollbar flex gap-0.5 overflow-x-auto border-t border-navy/10 px-4 py-1.5 sm:hidden">
              {STUDIO_LINKS.map(({ to, label }) => {
                const active = location.pathname === to
                return (
                  <Link key={to} to={to} className={`relative ${linkCls(active)}`}>
                    {label}
                    {active && <Underline layoutId="studio-underline-mobile" />}
                  </Link>
                )
              })}
            </div>
          </>
        ) : (
          <nav className="wrap grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
            <Logo />

            <div className="md:px-2">
              <div className="mx-auto w-full md:max-w-[34rem]">
                <SearchBar />
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="hidden items-center gap-0.5 md:flex">
                <NavLinks />
              </div>

              <AuthButton />

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
        )}

        {open && !isStudio && (
          <div className="border-t border-navy/10 bg-cream md:hidden">
            <div className="wrap flex flex-col gap-1 py-3">
              <NavLinks onClick={() => setOpen(false)} underlineId="nav-underline-mobile" />
            </div>
          </div>
        )}
      </header>

      <AnimatePresence>
        {showLogin && <LoginModal />}
      </AnimatePresence>
      <AnimatePresence>
        {showProfile && <ProfileModal />}
      </AnimatePresence>
      <AnimatePresence>
        {showAddContent && <AddContentModal />}
      </AnimatePresence>
    </>
  )
}
