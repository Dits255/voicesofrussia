import { useEffect, useState } from 'react'
import { authors } from './data'

// Состояние, зеркалируемое в localStorage
export function useLocal(key, initial) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial } catch { return initial }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* ignore */ } }, [key, v])
  return [v, setV]
}

// Закрытие дропдауна по клику вне элемента и по Escape
export function useClickOutside(ref, onClose) {
  useEffect(() => {
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [ref, onClose])
}

// Список slug'ов в localStorage с toggle/has (подписки, закладки)
export function useUserList(key, initial = []) {
  const [list, setList] = useLocal(key, initial)
  const has = (slug) => list.includes(slug)
  const toggle = (slug) =>
    setList((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]))
  return { list, has, toggle, setList }
}

// Подписки: при первом запуске сидируем первыми пятью авторами (демо)
const SEED_SUBS = authors.slice(0, 5).map((a) => a.slug)
export const useSubscriptions = () => useUserList('golosa-subs', SEED_SUBS)

export const useBookmarks = () => useUserList('golosa-bookmarks', [])

// --- История просмотров ---
const HISTORY_KEY = 'golosa-history'
const HISTORY_MAX = 50

export function useViewHistory() {
  const [items, setItems] = useLocal(HISTORY_KEY, [])
  const clear = () => setItems([])
  return { items, clear }
}

// Запись просмотра напрямую в localStorage — страница истории при открытии
// перечитает актуальное значение через useLocal
export function recordVisit(slug) {
  try {
    const prev = JSON.parse(localStorage.getItem(HISTORY_KEY)) || []
    if (prev[0]?.slug === slug) return
    const next = [{ slug, ts: Date.now() }, ...prev.filter((e) => e.slug !== slug)].slice(0, HISTORY_MAX)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  } catch { /* ignore */ }
}
