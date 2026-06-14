import { useCallback, useEffect, useMemo, useState } from 'react'
import { authors, contentByAuthor, sortByDate } from './data'

const readLocal = (key, initial) => {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial } catch { return initial }
}

// Подписчики по ключу — чтобы все экземпляры useLocal с одним ключом в одной
// вкладке оставались синхронными (событие storage срабатывает только между вкладками)
const channels = new Map()

// Состояние, зеркалируемое в localStorage и общее для всех его читателей
export function useLocal(key, initial) {
  const [v, setV] = useState(() => readLocal(key, initial))

  useEffect(() => {
    let subs = channels.get(key)
    if (!subs) { subs = new Set(); channels.set(key, subs) }
    const onChange = (val) => setV(val)
    subs.add(onChange)
    // первый запуск: сидируем значение, если его ещё нет; иначе подтягиваем актуальное
    if (localStorage.getItem(key) == null) {
      try { localStorage.setItem(key, JSON.stringify(initial)) } catch { /* ignore */ }
    } else {
      setV(readLocal(key, initial))
    }
    const onStorage = (e) => { if (e.key === key) setV(readLocal(key, initial)) }
    window.addEventListener('storage', onStorage)
    return () => {
      subs.delete(onChange)
      if (subs.size === 0) channels.delete(key)
      window.removeEventListener('storage', onStorage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const set = useCallback((next) => {
    const prev = readLocal(key, initial)
    const val = typeof next === 'function' ? next(prev) : next
    try { localStorage.setItem(key, JSON.stringify(val)) } catch { /* ignore */ }
    const subs = channels.get(key)
    if (subs && subs.size) subs.forEach((fn) => fn(val))
    else setV(val)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return [v, set]
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

// Лайки материалов и лайки комментариев (ключи вида `slug` и `slug/commentId`)
export const useLikes = () => useUserList('golosa-likes', [])
export const useCommentLikes = () => useUserList('golosa-comment-likes', [])

// Детерминированный «шум» из строки — стабильные демо-цифры (лайки, комментарии)
export const hashOf = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7)

// Демо-уведомления: свежие материалы авторов из подписок + прочитанность
export function useNotifications() {
  const { list: subs } = useSubscriptions()
  const [read, setRead] = useLocal('golosa-notif-read', [])
  const items = useMemo(
    () => sortByDate(subs.flatMap((slug) => contentByAuthor(slug)))
      .filter((c) => !c.isPlaceholder)
      .slice(0, 12),
    [subs],
  )
  const unread = items.filter((c) => !read.includes(c.slug)).length
  const markRead = (slug) => setRead((p) => (p.includes(slug) ? p : [...p, slug]))
  const markAll = () => setRead(items.map((c) => c.slug))
  return { items, read, unread, markRead, markAll }
}

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
