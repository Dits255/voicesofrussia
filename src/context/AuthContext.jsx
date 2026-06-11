import { createContext, useContext, useState, useCallback } from 'react'

const DEMO = {
  user:   { role: 'user',   name: 'Пользователь платформы', initials: 'ПП' },
  author: { role: 'author', name: 'Автор платформы', initials: 'АП', slug: 'author-platformy' },
}

const KEY = 'vr_auth'
const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null }
  })
  const [showLogin, setShowLogin] = useState(false)
  const openLogin  = useCallback(() => setShowLogin(true), [])
  const closeLogin = useCallback(() => setShowLogin(false), [])

  const [showProfile, setShowProfile] = useState(false)
  const openProfile  = useCallback(() => setShowProfile(true), [])
  const closeProfile = useCallback(() => setShowProfile(false), [])

  const [showAddContent, setShowAddContent] = useState(false)
  const [addContentType, setAddContentType] = useState('Лонгрид')
  const openAddContent  = useCallback((type = 'Лонгрид') => { setAddContentType(type); setShowAddContent(true) }, [])
  const closeAddContent = useCallback(() => setShowAddContent(false), [])

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

  return (
    <Ctx.Provider value={{
      user, login, logout,
      showLogin, openLogin, closeLogin,
      showProfile, openProfile, closeProfile,
      showAddContent, addContentType, openAddContent, closeAddContent,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
