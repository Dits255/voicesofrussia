import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Studio() {
  const { user } = useAuth()

  return (
    <div className="wrap py-16">
      <div className="mx-auto max-w-lg text-center">
        <div className="eyebrow mb-4">Автор</div>
        <h1 className="mb-8 font-display text-4xl font-extrabold text-navy sm:text-5xl">
          Студия
        </h1>
        <div className="rounded-2xl bg-gradient-to-br from-teal to-teal-dark p-10 text-cream">
          <div className="mb-4 font-display text-4xl font-bold text-cream/30">✦</div>
          <h2 className="mb-3 font-display text-2xl font-bold">В разработке</h2>
          <p className="mb-7 text-cream/80">
            {user ? `Добро пожаловать, ${user.name}. ` : ''}
            Здесь будет панель управления публикациями, редактор материалов и аналитика.
            Мы работаем над этим.
          </p>
          <Link
            to="/"
            className="inline-block rounded-full bg-cream px-6 py-2.5 text-sm font-semibold text-navy transition-transform hover:-translate-y-0.5"
          >
            На главную
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 opacity-40">
          {['Публикации', 'Аналитика', 'Редактор'].map((label) => (
            <div key={label} className="rounded-xl border border-navy/15 px-4 py-6 text-sm font-semibold text-navy">
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
