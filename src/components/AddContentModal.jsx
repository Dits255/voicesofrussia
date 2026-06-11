import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Check, Upload, ImagePlus, BookOpen, Mic, Clapperboard, Headphones, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const TYPES = [
  { id: 'Лонгрид', Icon: BookOpen, hint: 'Текстовая история с фото' },
  { id: 'Интервью', Icon: Mic, hint: 'Разговор с героем' },
  { id: 'Видео', Icon: Clapperboard, hint: 'Ролик или короткое видео' },
  { id: 'Подкаст', Icon: Headphones, hint: 'Аудиовыпуск' },
]

const ACCEPT = {
  Лонгрид: '.doc,.docx,.md,.txt,.pdf',
  Интервью: '.doc,.docx,.md,.txt,.pdf',
  Видео: 'video/*',
  Подкаст: 'audio/*',
}

const TITLES = {
  Лонгрид: 'Новый лонгрид',
  Интервью: 'Новое интервью',
  Видео: 'Новое видео',
  Подкаст: 'Новый подкаст',
}

const HINTS = {
  Лонгрид: 'doc, docx, md, pdf · до 50 МБ',
  Интервью: 'doc, docx, md, pdf · до 50 МБ',
  Видео: 'mp4, mov · до 500 МБ',
  Подкаст: 'mp3, wav · до 200 МБ',
}

const inputCls =
  'w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm text-navy outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/15'

export default function AddContentModal() {
  const { closeAddContent, addContentType } = useAuth()
  // null — сначала экран выбора формата
  const [type, setType] = useState(addContentType)
  const fromChooser = addContentType == null
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [fileName, setFileName] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => { setType(addContentType) }, [addContentType])
  useEffect(() => {
    setTitle(''); setDesc(''); setFileName(''); setDone(false)
  }, [type])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeAddContent() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [closeAddContent])

  const onFile = (e) => { const f = e.target.files?.[0]; if (f) setFileName(f.name) }

  const submit = (e) => { e.preventDefault(); setDone(true) }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-navy-deep/60 backdrop-blur-sm"
        onClick={closeAddContent}
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-2xl bg-cream p-8 shadow-card-hover"
      >
        <button
          onClick={closeAddContent}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-ink/40 transition-colors hover:bg-navy/5 hover:text-navy"
          aria-label="Закрыть"
        >
          <X size={16} />
        </button>

        {type == null ? (
          <>
            <div className="eyebrow mb-1">Студия</div>
            <h2 className="mb-6 font-display text-xl font-bold text-navy">Что хотите добавить?</h2>
            <div className="grid grid-cols-2 gap-3">
              {TYPES.map(({ id, Icon, hint }) => (
                <button
                  key={id}
                  onClick={() => setType(id)}
                  className="group rounded-2xl border border-navy/15 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-teal hover:shadow-card"
                >
                  <Icon size={22} className="text-teal" strokeWidth={1.8} />
                  <div className="mt-2.5 font-display font-bold text-navy group-hover:text-teal">{id}</div>
                  <div className="mt-0.5 text-xs text-ink/50">{hint}</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
        {fromChooser && !done && (
          <button
            onClick={() => setType(null)}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink/50 transition-colors hover:text-navy"
          >
            <ArrowLeft size={15} /> Другой формат
          </button>
        )}
        <div className="eyebrow mb-1">{type}</div>
        <h2 className="mb-6 font-display text-xl font-bold text-navy">{TITLES[type]}</h2>

        {done ? (
          <div className="flex items-start gap-3 rounded-xl border border-teal/30 bg-teal/[0.08] px-5 py-4 text-sm text-navy">
            <Check size={18} className="mt-0.5 shrink-0 text-teal" />
            <div>
              <p className="font-semibold">Загрузка будет доступна при запуске платформы</p>
              <p className="mt-1 text-ink/60">Оставьте заявку в разделе «О проекте» — мы сообщим о старте.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">Заголовок</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название материала"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">Описание</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
                placeholder="Краткое описание — 2–3 предложения"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">Файл</label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-navy/20 bg-white px-4 py-4 text-sm transition-colors hover:border-teal">
                <Upload size={18} className="shrink-0 text-teal" />
                <span className={fileName ? 'font-medium text-navy' : 'text-ink/50'}>
                  {fileName || 'Выбрать файл'}
                </span>
                <span className="ml-auto shrink-0 text-xs text-ink/35">{HINTS[type]}</span>
                <input type="file" accept={ACCEPT[type]} onChange={onFile} className="hidden" />
              </label>
            </div>
            {type === 'Видео' || type === 'Подкаст' ? null : (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy">Обложка</label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-teal">
                  <ImagePlus size={17} className="text-teal" />
                  Загрузить изображение
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>
            )}
            <button type="submit" className="btn-navy w-full justify-center">
              Отправить на модерацию
            </button>
          </form>
        )}
          </>
        )}
      </motion.div>
    </div>
  )
}
