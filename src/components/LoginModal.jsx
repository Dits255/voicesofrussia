import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const inputCls =
  'w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm text-navy outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/15'

export default function LoginModal() {
  const { login, closeLogin } = useAuth()
  const [view, setView] = useState('login')

  const [loginVal, setLoginVal] = useState('user')
  const [password, setPassword] = useState('password')
  const [loginError, setLoginError] = useState('')

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPwd, setRegPwd] = useState('')
  const [regPwd2, setRegPwd2] = useState('')
  const [regDone, setRegDone] = useState(false)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeLogin() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeLogin])

  const submitLogin = (e) => {
    e.preventDefault()
    setLoginError('')
    try { login(loginVal, password); closeLogin() }
    catch (err) { setLoginError(err.message) }
  }

  const submitRegister = (e) => {
    e.preventDefault()
    setRegDone(true)
  }

  const goRegister = () => { setView('register'); setRegDone(false) }
  const goLogin = () => { setView('login'); setLoginError('') }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-navy-deep/60 backdrop-blur-sm"
        onClick={closeLogin}
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        data-tour="login-modal"
        className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-cream p-6 shadow-card-hover sm:p-8"
      >
        <button
          onClick={closeLogin}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-ink/40 transition-colors hover:bg-navy/5 hover:text-navy"
          aria-label="Закрыть"
        >
          <X size={16} />
        </button>

        <div className="eyebrow mb-1">Голоса России</div>

        {view === 'login' ? (
          <>
            <h2 className="mb-6 font-display text-xl font-bold text-navy">Вход</h2>
            <form onSubmit={submitLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy">Логин</label>
                <input
                  value={loginVal}
                  onChange={(e) => setLoginVal(e.target.value)}
                  autoComplete="username"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy">Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className={inputCls}
                />
              </div>
              {loginError && (
                <p className="rounded-xl bg-clay/10 px-4 py-2.5 text-sm font-medium text-clay">{loginError}</p>
              )}
              <button type="submit" className="btn-navy w-full justify-center">Войти</button>
              <p className="text-center text-xs text-ink/45">
                Войдите как <code className="rounded bg-navy/[0.08] px-1.5 py-0.5 font-mono text-navy/65">author</code> чтобы увидеть панель автора
              </p>
            </form>
            <p className="mt-5 border-t border-navy/[0.08] pt-5 text-center text-sm text-ink/55">
              Нет аккаунта?{' '}
              <button onClick={goRegister} className="font-semibold text-teal hover:underline">
                Зарегистрироваться →
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="mb-6 font-display text-xl font-bold text-navy">Регистрация</h2>
            {regDone ? (
              <div className="rounded-xl border border-teal/30 bg-teal/[0.08] px-5 py-4 text-sm text-navy">
                <p className="font-semibold">Регистрация пока недоступна</p>
                <p className="mt-1 text-ink/65">
                  Платформа в стадии запуска. Оставьте заявку в разделе{' '}
                  <Link to="/about#apply" onClick={closeLogin} className="font-medium text-teal hover:underline">
                    О проекте →
                  </Link>
                </p>
              </div>
            ) : (
              <form onSubmit={submitRegister} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-navy">Имя</label>
                  <input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Ваше имя" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-navy">Email</label>
                  <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-navy">Пароль</label>
                  <input type="password" value={regPwd} onChange={(e) => setRegPwd(e.target.value)} placeholder="Придумайте пароль" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-navy">Подтверждение</label>
                  <input type="password" value={regPwd2} onChange={(e) => setRegPwd2(e.target.value)} placeholder="Повторите пароль" className={inputCls} />
                </div>
                <button type="submit" className="btn-navy w-full justify-center">Зарегистрироваться</button>
              </form>
            )}
            <p className="mt-5 border-t border-navy/[0.08] pt-5 text-center text-sm text-ink/55">
              Уже есть аккаунт?{' '}
              <button onClick={goLogin} className="font-semibold text-teal hover:underline">
                Войти →
              </button>
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}
