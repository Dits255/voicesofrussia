import { useEffect, useState } from 'react'
import { ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react'

const KEY = (slug) => `golosa-feedback:${slug}`

export default function ArticleFeedback({ slug }) {
  const [vote, setVote] = useState(null)

  useEffect(() => {
    try { setVote(localStorage.getItem(KEY(slug))) } catch { /* ignore */ }
  }, [slug])

  const cast = (v) => {
    setVote(v)
    try { localStorage.setItem(KEY(slug), v) } catch { /* ignore */ }
  }

  return (
    <div className="wrap mt-12">
      <div className="mx-auto max-w-prose rounded-2xl border border-navy/10 bg-cream-2/50 p-6 text-center sm:p-8">
        {vote ? (
          <div>
            <CheckCircle2 className="mx-auto text-teal" size={34} strokeWidth={1.8} />
            <p className="mt-3 font-display text-lg font-bold text-navy">Спасибо за отклик!</p>
            <p className="mt-1 text-sm text-ink/60">
              {vote === 'up'
                ? 'Рады, что история откликнулась — передадим авторам.'
                : 'Жаль, что не зашло. Мы учтём это в работе над материалами.'}
            </p>
          </div>
        ) : (
          <>
            <div className="eyebrow">Ваше мнение</div>
            <h3 className="mt-2 font-display text-xl font-bold text-navy sm:text-2xl">
              Была ли эта история полезной и интересной?
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/55">
              Один клик помогает авторам и редакции понять, что важно читателям.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button onClick={() => cast('up')} className="btn-navy">
                <ThumbsUp size={18} /> Да, понравилось
              </button>
              <button onClick={() => cast('down')} className="btn-ghost">
                <ThumbsDown size={18} /> Не очень
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
