import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLocal, useCommentLikes, hashOf } from '../lib/hooks'

// Демо-комментарии: подбираются детерминированно по slug — у каждой истории
// свой стабильный набор, «живой» вид без бэкенда
const POOL = [
  { name: 'Айталина Никифорова', text: 'Спасибо за материал! Читается на одном дыхании, как будто сама там побывала.' },
  { name: 'Дмитрий Цой', text: 'Очень тёплая история. Здорово, что люди рассказывают о себе сами, без посредников.' },
  { name: 'Сэсэг Доржиева', text: 'Отправила ссылку родителям — узнали знакомые места и очень обрадовались.' },
  { name: 'Алан Кудзиев', text: 'Сильный текст. Особенно зацепила прямая речь героев.' },
  { name: 'Мария Ким', text: 'Фотографии чудесные! Хочется теперь съездить и увидеть всё своими глазами.' },
  { name: 'Тимур Баиров', text: 'Больше таких историй! Голоса самих людей — это бесценно.' },
  { name: 'Наталья Хертек', text: 'Прочитала на одном дыхании. Подписалась на автора, жду новые материалы.' },
  { name: 'Заур Алиев', text: 'Спасибо редакции за бережное отношение к теме. Видно большую работу.' },
]
const AVATAR_COLORS = ['#028090', '#E07A5F', '#1A3A5C']

const initialsOf = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

const seededFor = (slug) => {
  const h = hashOf(slug)
  return Array.from({ length: 2 + (h % 2) }, (_, i) => {
    const p = POOL[(h + i * 3) % POOL.length]
    return {
      id: `seed-${i}`,
      name: p.name,
      text: p.text,
      ts: Date.now() - (1 + ((h + i * 5) % 6)) * 86400000,
    }
  })
}

function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000)
  if (m < 1) return 'только что'
  if (m < 60) return `${m} мин назад`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч назад`
  const d = Math.floor(h / 24)
  return d === 1 ? 'вчера' : `${d} дн. назад`
}

function Avatar({ name, color }) {
  return (
    <span
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-cream"
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {initialsOf(name)}
    </span>
  )
}

function CommentItem({ slug, c, color, onDelete }) {
  const { user, openLogin } = useAuth()
  const { has, toggle } = useCommentLikes()
  const key = `${slug}/${c.id}`
  const on = !!user && has(key)
  const base = c.mine ? 0 : (hashOf(key) * 7) % 15
  const count = base + (on ? 1 : 0)

  const onLike = () => {
    if (!user) { openLogin(); return }
    toggle(key)
  }

  return (
    <div className="flex gap-3">
      <Avatar name={c.name} color={color} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="font-semibold text-navy">{c.name}</span>
          {c.mine && <span className="rounded-full bg-teal/10 px-1.5 py-px text-[11px] font-semibold text-teal">вы</span>}
          <span className="text-xs text-ink/40">{timeAgo(c.ts)}</span>
        </div>
        <p className="mt-1 text-[15px] leading-relaxed text-ink/80">{c.text}</p>
        <div className="mt-1.5 flex items-center gap-4">
          <button
            onClick={onLike}
            aria-pressed={on}
            className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${
              on ? 'text-clay' : 'text-ink/45 hover:text-clay'
            }`}
          >
            <motion.span animate={on ? { scale: [1, 1.4, 1] } : { scale: 1 }} transition={{ duration: 0.3 }} className="grid">
              <Heart size={13} fill={on ? 'currentColor' : 'none'} />
            </motion.span>
            {count > 0 && count}
          </button>
          {c.mine && user && (
            <button
              onClick={() => onDelete(c.id)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-ink/45 transition-colors hover:text-clay"
            >
              <Trash2 size={13} /> Удалить
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const INITIAL_COMMENTS = 3

export default function Comments({ slug }) {
  const { user, openLogin } = useAuth()
  const [mine, setMine] = useLocal(`golosa-comments:${slug}`, [])
  const [text, setText] = useState('')
  const [expanded, setExpanded] = useState(false)
  const seeded = seededFor(slug)
  const all = [...mine, ...seeded]
  const visible = expanded ? all : all.slice(0, INITIAL_COMMENTS)
  const restCount = all.length - visible.length

  const submit = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t || !user) return
    setMine((p) => [{ id: `u-${Date.now()}`, name: user.name, text: t, ts: Date.now(), mine: true }, ...p])
    setText('')
  }
  const remove = (id) => setMine((p) => p.filter((c) => c.id !== id))

  return (
    <section data-tour="comments" className="wrap mt-12">
      <div className="mx-auto max-w-prose">
        <h2 className="font-display text-2xl font-bold text-navy">
          Комментарии <span className="ml-1 text-lg font-semibold text-ink/40">{all.length}</span>
        </h2>

        {user ? (
          <form onSubmit={submit} className="mt-5 flex gap-3">
            <Avatar name={user.name} color="#028090" />
            <div className="min-w-0 flex-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={2}
                placeholder="Поделитесь впечатлением…"
                className="w-full resize-none rounded-xl border border-navy/15 bg-white p-3 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-teal"
              />
              <AnimatePresence initial={false}>
                {text.trim() && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <button type="submit" className="btn-navy mt-2">Отправить</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        ) : (
          <button
            onClick={openLogin}
            className="mt-5 w-full rounded-2xl border border-dashed border-navy/20 p-4 text-left text-sm text-ink/50 transition-colors hover:border-teal hover:text-teal"
          >
            Войдите, чтобы оставить комментарий
          </button>
        )}

        <div className="mt-7 space-y-6">
          <AnimatePresence initial={false}>
            {visible.map((c, i) => (
              <motion.div
                key={c.id}
                layout="position"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.25 }}
              >
                <CommentItem
                  slug={slug}
                  c={c}
                  color={c.mine ? '#028090' : AVATAR_COLORS[(hashOf(slug) + i) % AVATAR_COLORS.length]}
                  onDelete={remove}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {restCount > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-6 w-full rounded-full border border-navy/15 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-teal hover:text-teal"
          >
            Показать ещё {restCount}
          </button>
        )}
      </div>
    </section>
  )
}
