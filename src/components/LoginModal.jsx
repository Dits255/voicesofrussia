import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginModal({ onClose }) {
  const { login } = useAuth()
  const [loginVal, setLoginVal] = useState('user')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = (e) => {
    e.preventDefault()
    setError('')
    try {
      login(loginVal, password)
      onClose()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-navy-deep/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm rounded-2xl bg-cream p-8 shadow-card-hover"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-ink/40 transition-colors hover:bg-navy/5 hover:text-navy"
          aria-label="Закрыть"
        >
          <X size={16} />
        </button>

        <div className="mb-6">
          <div className="eyebrow mb-1">Голоса России</div>
          <h2 className="font-display text-2xl font-bold text-navy">Войти в аккаунт</h2>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Логин</label>
            <input
              value={loginVal}
              onChange={(e) => setLoginVal(e.target.value)}
              autoComplete="username"
              className="w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm text-navy outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/15"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm text-navy outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/15"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-clay/10 px-4 py-2.5 text-sm font-medium text-clay">{error}</p>
          )}

          <button type="submit" className="btn-navy w-full justify-center">
            Войти
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-ink/50">
          Войдите как{' '}
          <code className="rounded bg-navy/8 px-1.5 py-0.5 font-mono text-navy/70">author</code>{' '}
          чтобы увидеть панель автора
        </p>

        <div className="mt-6 border-t border-navy/10 pt-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-ink/60">Нет аккаунта?</span>
            <button
              disabled
              title="Регистрация откроется с полным запуском платформы"
              className="cursor-not-allowed rounded-full border border-navy/15 px-4 py-2 text-sm font-semibold text-navy/35"
            >
              Зарегистрироваться →
            </button>
          </div>
          <p className="mt-2 text-xs text-ink/40">
            Регистрация откроется с полным запуском платформы
          </p>
        </div>
      </motion.div>
    </div>
  )
}
