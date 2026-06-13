import { Link, Navigate } from 'react-router-dom'
import { Clock, Trash2 } from 'lucide-react'
import { getContent, formatDate } from '../lib/data'
import { useViewHistory } from '../lib/hooks'
import { useAuth } from '../context/AuthContext'
import { ContentCard } from '../components/cards'

const dayLabel = (ts) => {
  const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diff = (startOf(new Date()) - startOf(new Date(ts))) / 86400000
  if (diff === 0) return 'Сегодня'
  if (diff === 1) return 'Вчера'
  return formatDate(new Date(ts).toISOString())
}

export default function History() {
  const { user } = useAuth()
  const { items, clear } = useViewHistory()
  if (!user) return <Navigate to="/" replace />

  // записи уже отсортированы от новых к старым — группируем по дню
  const groups = []
  for (const entry of items) {
    const item = getContent(entry.slug)
    if (!item) continue
    const label = dayLabel(entry.ts)
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(item)
    else groups.push({ label, items: [item] })
  }

  return (
    <div className="wrap py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow mb-2">Что вы читали</div>
          <h1 className="font-display text-4xl font-extrabold text-navy sm:text-5xl">История просмотров</h1>
        </div>
        {groups.length > 0 && (
          <button onClick={clear} className="btn-ghost shrink-0">
            <Trash2 size={16} /> Очистить историю
          </button>
        )}
      </header>

      {groups.length > 0 ? (
        <div data-tour="history-list" className="space-y-10">
          {groups.map((g) => (
            <section key={g.label}>
              <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-ink/40">{g.label}</p>
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                {g.items.map((item) => <ContentCard key={item.slug} item={item} />)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-navy/20 p-12 text-center text-ink/50">
          <Clock size={28} className="mx-auto mb-3 text-ink/30" />
          История пока пуста — откройте любую историю, и она появится здесь.
          <div className="mt-3">
            <Link to="/feed" className="font-semibold text-teal hover:underline">Перейти в ленту →</Link>
          </div>
        </div>
      )}
    </div>
  )
}
