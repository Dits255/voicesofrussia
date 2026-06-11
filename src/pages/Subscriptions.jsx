import { Link, Navigate } from 'react-router-dom'
import { authors, contentByAuthor, sortByDate } from '../lib/data'
import { useSubscriptions } from '../lib/hooks'
import { useAuth } from '../context/AuthContext'
import { AuthorAvatar } from '../components/ui'
import { ContentCard } from '../components/cards'

export default function Subscriptions() {
  const { user } = useAuth()
  const { list: subs } = useSubscriptions()
  if (!user) return <Navigate to="/" replace />

  const subscribedAuthors = authors.filter((a) => subs.includes(a.slug))
  const feed = sortByDate(
    subs.flatMap((slug) => contentByAuthor(slug)),
  ).slice(0, 12)

  if (subscribedAuthors.length === 0) {
    return (
      <div className="wrap py-10">
        <header className="mb-8">
          <div className="eyebrow mb-2">Ваша лента</div>
          <h1 className="font-display text-4xl font-extrabold text-navy sm:text-5xl">Подписки</h1>
        </header>
        <div className="rounded-2xl border border-dashed border-navy/20 p-12 text-center text-ink/50">
          Вы пока ни на кого не подписаны — найдите интересных авторов в ленте.
          <div className="mt-3">
            <Link to="/feed" className="font-semibold text-teal hover:underline">Перейти в ленту →</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wrap py-10">
      <header className="mb-8">
        <div className="eyebrow mb-2">Ваша лента</div>
        <h1 className="font-display text-4xl font-extrabold text-navy sm:text-5xl">Подписки</h1>
      </header>

      <div className="mb-10">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-ink/40">
          Авторы, на которых вы подписаны
        </p>
        {/* p-1 — чтобы ring при наведении не обрезался overflow-контейнером */}
        <div className="no-scrollbar flex gap-6 overflow-x-auto p-1 pb-2">
          {subscribedAuthors.map((author) => (
            <Link
              key={author.slug}
              to={`/author/${author.slug}`}
              className="group flex shrink-0 flex-col items-center gap-2"
            >
              <div className="ring-2 ring-transparent ring-offset-2 ring-offset-cream transition-all group-hover:ring-teal rounded-full">
                <AuthorAvatar author={author} size={64} />
              </div>
              <span className="max-w-[72px] text-center text-xs font-medium leading-tight text-ink/65 group-hover:text-teal">
                {author.name.split(' ')[0]}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-navy/10 pt-8">
        <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-ink/40">
          Последние материалы
        </p>
        {feed.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {feed.map((item) => (
              <ContentCard key={item.slug} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-navy/20 p-12 text-center text-ink/50">
            Авторы ещё ничего не опубликовали.
          </div>
        )}
      </div>
    </div>
  )
}
