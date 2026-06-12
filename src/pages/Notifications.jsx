import { Link, Navigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { authorsOf, formatDate } from '../lib/data'
import { useNotifications } from '../lib/hooks'
import { useAuth } from '../context/AuthContext'
import { AuthorAvatar, FormatBadge } from '../components/ui'

export default function Notifications() {
  const { user } = useAuth()
  const { items, read, unread, markRead, markAll } = useNotifications()
  if (!user) return <Navigate to="/" replace />

  return (
    <div className="wrap py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow mb-2">Что нового у ваших авторов</div>
          <h1 className="font-display text-4xl font-extrabold text-navy sm:text-5xl">Уведомления</h1>
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="btn-ghost shrink-0">
            <CheckCheck size={16} /> Отметить все прочитанными
          </button>
        )}
      </header>

      {items.length > 0 ? (
        <div className="mx-auto max-w-3xl space-y-3">
          {items.map((item) => {
            const author = authorsOf(item)[0]
            const isRead = read.includes(item.slug)
            return (
              <Link
                key={item.slug}
                to={`/story/${item.slug}`}
                onClick={() => markRead(item.slug)}
                className={`flex items-center gap-3 rounded-2xl p-3.5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover sm:gap-4 sm:p-4 ${
                  isRead ? 'bg-white/60' : 'bg-white'
                }`}
              >
                {author && <AuthorAvatar author={author} size={44} />}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${isRead ? 'text-ink/55' : 'text-ink/75'}`}>
                    <span className="font-semibold text-navy">{author?.name || 'Редакция'}</span>
                    {' '}опубликовал(а) новый материал
                  </p>
                  <p className={`mt-0.5 truncate font-display font-bold ${isRead ? 'text-navy/60' : 'text-navy'}`}>
                    {item.title}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-ink/45">
                    <FormatBadge format={item.format} /> {formatDate(item.date)}
                  </p>
                </div>
                {!isRead && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-teal" aria-label="Непрочитанное" />}
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-navy/20 p-12 text-center text-ink/50">
          <Bell size={28} className="mx-auto mb-3 text-ink/30" />
          Уведомлений пока нет — подпишитесь на авторов, чтобы не пропускать их новые материалы.
          <div className="mt-3">
            <Link to="/feed" className="font-semibold text-teal hover:underline">Перейти в ленту →</Link>
          </div>
        </div>
      )}
    </div>
  )
}
