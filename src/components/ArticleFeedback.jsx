import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Star, CheckCircle2 } from 'lucide-react'
import { getCulture } from '../lib/data'

const KEY = (slug) => `golosa-feedback:${slug}`

const TAGS_UP = ['Тема', 'Герой истории', 'Стиль текста', 'Фотографии', 'Узнал(а) новое']
const TAGS_DOWN = ['Слишком длинно', 'Не хватило глубины', 'Скучно написано', 'Мало фото', 'Не моя тема']

const STEP_NUM = { rate: 1, tags: 2, more: 3, comment: 4 }

// Старые голоса хранились строкой 'up'/'down' — считаем их завершённым опросом
const readSaved = (slug) => {
  try {
    const s = localStorage.getItem(KEY(slug))
    if (!s) return null
    if (s === 'up' || s === 'down') return { rating: s === 'up' ? 5 : 2 }
    return JSON.parse(s)
  } catch { return null }
}

// Частицы, разлетающиеся от иконки после положительного отклика
function Burst() {
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * 42,
              y: Math.sin(angle) * 42,
              opacity: 0,
              scale: 0.3,
            }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2 h-2 w-2 -ml-1 -mt-1 rounded-full"
            style={{ backgroundColor: i % 2 ? '#E07A5F' : '#028090' }}
          />
        )
      })}
    </span>
  )
}

function Stars({ value, onPick }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex justify-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= (hover || value)
        return (
          <motion.button
            key={n}
            whileTap={{ scale: 0.85 }}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onClick={() => onPick(n)}
            aria-label={`Оценка ${n} из 5`}
            className="p-1.5"
          >
            <motion.span
              animate={value === n ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="block"
            >
              <Star
                size={30}
                strokeWidth={1.6}
                className={`transition-colors duration-150 ${filled ? 'fill-clay text-clay' : 'text-navy/25'}`}
              />
            </motion.span>
          </motion.button>
        )
      })}
    </div>
  )
}

function StepBox({ stepKey, children }) {
  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function ArticleFeedback({ slug, cultureSlug = null }) {
  const culture = getCulture(cultureSlug)
  const [step, setStep] = useState('rate')
  const [rating, setRating] = useState(0)
  const [tags, setTags] = useState([])
  const [more, setMore] = useState(null)
  const [comment, setComment] = useState('')
  const [justDone, setJustDone] = useState(false)

  useEffect(() => {
    setStep('rate'); setRating(0); setTags([]); setMore(null); setComment(''); setJustDone(false)
    const saved = readSaved(slug)
    if (saved) {
      setRating(saved.rating || 0)
      setMore(saved.more ?? null)
      setStep('done')
    }
  }, [slug])

  const positive = rating >= 4

  const pickRating = (n) => { setRating(n); setTimeout(() => setStep('tags'), 500) }
  const toggleTag = (t) => setTags((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))
  const pickMore = (v) => { setMore(v); setTimeout(() => setStep('comment'), 250) }

  const finish = (withComment) => {
    const data = { rating, tags, more, comment: withComment ? comment.trim() : '' }
    try { localStorage.setItem(KEY(slug), JSON.stringify(data)) } catch { /* ignore */ }
    setJustDone(true)
    setStep('done')
  }

  return (
    <div className="wrap mt-12">
      <div data-tour="feedback" className="mx-auto max-w-prose overflow-hidden rounded-2xl border border-navy/10 bg-cream-2/50 p-6 text-center sm:p-8">
        {step !== 'done' && (
          <div className="mb-2 flex items-center justify-between">
            <div className="eyebrow">Ваше мнение</div>
            <span className="text-xs font-semibold text-ink/35">Шаг {STEP_NUM[step]} из 4</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'rate' && (
            <StepBox stepKey="rate">
              <h3 className="font-display text-xl font-bold text-navy sm:text-2xl">
                Как вам эта история?
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink/55">
                Оцените от 1 до 5 — это помогает авторам и редакции.
              </p>
              <div className="mt-5">
                <Stars value={rating} onPick={pickRating} />
              </div>
            </StepBox>
          )}

          {step === 'tags' && (
            <StepBox stepKey="tags">
              <h3 className="font-display text-xl font-bold text-navy sm:text-2xl">
                {positive ? 'Что понравилось?' : 'Что не так?'}
              </h3>
              <p className="mt-2 text-sm text-ink/55">Можно выбрать несколько вариантов.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {(positive ? TAGS_UP : TAGS_DOWN).map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTag(t)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                      tags.includes(t)
                        ? 'bg-teal text-cream'
                        : 'bg-white text-ink/70 ring-1 ring-navy/15 hover:ring-navy/35'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep('more')} className="btn-navy mt-6">
                Далее
              </button>
            </StepBox>
          )}

          {step === 'more' && (
            <StepBox stepKey="more">
              <h3 className="font-display text-xl font-bold text-navy sm:text-2xl">
                {culture ? `Хотите больше историй о народе «${culture.name}»?` : 'Хотите больше таких материалов?'}
              </h3>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button onClick={() => pickMore('yes')} className="btn-navy">Да, хочу</button>
                <button onClick={() => pickMore('no')} className="btn-ghost">Не обязательно</button>
              </div>
            </StepBox>
          )}

          {step === 'comment' && (
            <StepBox stepKey="comment">
              <h3 className="font-display text-xl font-bold text-navy sm:text-2xl">
                Хотите что-то добавить?
              </h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Расскажите подробнее — что запомнилось, чего не хватило…"
                className="mt-5 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/15"
              />
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button onClick={() => finish(true)} className="btn-navy">Отправить</button>
                <button onClick={() => finish(false)} className="text-sm font-semibold text-ink/50 transition-colors hover:text-navy">
                  Пропустить
                </button>
              </div>
            </StepBox>
          )}

          {step === 'done' && (
            <StepBox stepKey="done">
              <span className="relative mx-auto inline-block">
                <motion.span
                  initial={justDone ? { scale: 0 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 16 }}
                  className="inline-block"
                >
                  <CheckCircle2 className="text-teal" size={34} strokeWidth={1.8} />
                </motion.span>
                {justDone && positive && <Burst />}
              </span>
              <p className="mt-3 font-display text-lg font-bold text-navy">Спасибо за отклик!</p>
              <p className="mt-1 text-sm text-ink/60">
                {positive
                  ? 'Рады, что история откликнулась — передадим авторам.'
                  : 'Жаль, что не зашло. Мы учтём это в работе над материалами.'}
              </p>
              {more === 'yes' && culture && (
                <Link to={`/culture/${culture.slug}`} className="btn-navy mt-5">
                  Истории народа «{culture.name}» →
                </Link>
              )}
            </StepBox>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
