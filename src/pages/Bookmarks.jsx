import { Link, Navigate } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import { getContent } from '../lib/data'
import { useBookmarks } from '../lib/hooks'
import { useAuth } from '../context/AuthContext'
import { ContentCard } from '../components/cards'

export default function Bookmarks() {
  const { user } = useAuth()
  const { list } = useBookmarks()
  if (!user) return <Navigate to="/" replace />

  // последние сохранённые — первыми
  const items = [...list].reverse().map(getContent).filter(Boolean)

  return (
    <div className="wrap py-10">
      <header className="mb-8">
        <div className="eyebrow mb-2">Сохранённое</div>
        <h1 className="font-display text-4xl font-extrabold text-navy sm:text-5xl">Закладки</h1>
      </header>

      {items.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item) => <ContentCard key={item.slug} item={item} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-navy/20 p-12 text-center text-ink/50">
          <Bookmark size={28} className="mx-auto mb-3 text-ink/30" />
          Здесь появятся сохранённые истории — нажмите на закладку на странице материала.
          <div className="mt-3">
            <Link to="/feed" className="font-semibold text-teal hover:underline">Перейти в ленту →</Link>
          </div>
        </div>
      )}
    </div>
  )
}
