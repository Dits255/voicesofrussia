import { Link, Navigate } from 'react-router-dom'
import { authors, contentByAuthor, sortByDate } from '../lib/data'
import { useAuth } from '../context/AuthContext'
import { AuthorAvatar } from '../components/ui'
import { ContentCard } from '../components/cards'

const SUBSCRIBED_SLUGS = authors.slice(0, 5).map((a) => a.slug)

export default function Subscriptions() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />

  const subscribedAuthors = authors.filter((a) => SUBSCRIBED_SLUGS.includes(a.slug))
  const feed = sortByDate(
    SUBSCRIBED_SLUGS.flatMap((slug) => contentByAuthor(slug)),
  ).slice(0, 12)

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
        <div className="no-scrollbar flex gap-6 overflow-x-auto pb-2">
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
