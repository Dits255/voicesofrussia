import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Check, ImagePlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const inputCls =
  'w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm text-navy outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/15'

const DEFAULTS = {
  author: {
    name: 'Автор платформы',
    handle: 'author.platform',
    region: 'Россия',
    bio: 'Демонстрационный аккаунт платформы «Голоса России». Здесь будут ваши публикации, статистика и настройки профиля.',
  },
  user: {
    name: 'Пользователь платформы',
    handle: 'user.platform',
    region: 'Россия',
    bio: 'Демонстрационный аккаунт читателя «Голосов России». Здесь будут ваши данные, подписки и настройки.',
  },
}

export default function ProfileModal() {
  const { user, closeProfile } = useAuth()
  const isAuthor = user?.role === 'author'
  const [form, setForm] = useState(DEFAULTS[isAuthor ? 'author' : 'user'])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeProfile() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [closeProfile])

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setSaved(false) }

  const submit = (e) => { e.preventDefault(); setSaved(true) }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-navy-deep/60 backdrop-blur-sm"
        onClick={closeProfile}
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        data-tour="profile-modal"
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-cream p-6 shadow-card-hover sm:p-8"
      >
        <button
          onClick={closeProfile}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-ink/40 transition-colors hover:bg-navy/5 hover:text-navy"
          aria-label="Закрыть"
        >
          <X size={16} />
        </button>

        <div className="eyebrow mb-1">{isAuthor ? 'Студия' : 'Аккаунт'}</div>
        <h2 className="mb-6 font-display text-xl font-bold text-navy">Настройки профиля</h2>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">Имя</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">Псевдоним</label>
              <input value={form.handle} onChange={(e) => set('handle', e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Регион</label>
            <input value={form.region} onChange={(e) => set('region', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">О себе</label>
            <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={3} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Аватар</label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-teal">
              <ImagePlus size={17} className="text-teal" />
              Загрузить фото
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </div>
          {saved ? (
            <div className="flex items-center gap-2 rounded-xl border border-teal/30 bg-teal/[0.08] px-4 py-3 text-sm text-navy">
              <Check size={16} className="shrink-0 text-teal" />
              Сохранение будет доступно при запуске платформы
            </div>
          ) : (
            <button type="submit" className="btn-navy w-full justify-center">Сохранить</button>
          )}
        </form>
      </motion.div>
    </div>
  )
}
