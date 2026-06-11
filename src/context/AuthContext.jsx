import { createContext, useContext, useState, useCallback } from 'react'

const DEMO = {
  user:   { role: 'user',   name: 'Пользователь платформы', initials: 'ПП' },
  author: { role: 'author', name: 'Автор платформы',         initials: 'АП' },
}

const KEY = 'vr_auth'
const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null }
  })

  const login = useCallback((login, password) => {
    const acc = DEMO[login.trim().toLowerCase()]
    if (!acc || password !== 'password') throw new Error('Неверный логин или пароль')
    const data = { ...acc, login: login.trim().toLowerCase() }
    localStorage.setItem(KEY, JSON.stringify(data))
    setUser(data)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(KEY)
    setUser(null)
  }, [])

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
