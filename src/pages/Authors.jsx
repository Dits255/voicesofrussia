import { useEffect, useState } from 'react'
import {
  X, ImagePlus, Eye, ThumbsUp, UserPlus, FileText, Pencil, Trash2, Plus, Settings,
} from 'lucide-react'
import { FORMATS, TOPICS, cultures, cultureName, initials } from '../lib/data'
import { LS, DEFAULT_PROFILE, DEFAULT_CONTENT, fmtNum } from '../lib/studio'
import { useLocal } from '../lib/hooks'
import { FormatBadge, CountUp } from '../components/ui'
import { useAuth } from '../context/AuthContext'

const readDataUrl = (file) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file) })
const accentOf = (slug) => cultures.find((c) => c.slug === slug)?.accent || '#1A3A5C'

function Avatar({ profile, size = 64 }) {
  const bg = profile.cultureSlug ? accentOf(profile.cultureSlug) : '#E07A5F'
  return profile.avatar ? (
    <img src={profile.avatar} alt="" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span
      className="grid shrink-0 place-items-center rounded-full font-display font-bold text-cream"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}
    >
      {initials(profile.name)}
    </span>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-navy">{label}</div>
      {children}
    </div>
  )
}

const inputCls = 'w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm outline-none focus:border-teal'

function FormatChips({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FORMATS.filter((f) => f.active).map((f) => (
        <button
          key={f.id} type="button" onClick={() => onChange(f.id)}
          className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
            value === f.id ? 'border-navy bg-navy text-cream' : 'border-navy/15 bg-white text-ink/70 hover:border-navy/35'
          }`}
        >
          <f.Icon size={14} strokeWidth={2.2} /> {f.label}
        </button>
      ))}
    </div>
  )
}

function TopicChips({ value, onChange }) {
  const toggle = (t) => onChange(value.includes(t) ? value.filter((x) => x !== t) : [...value, t])
  return (
    <div className="flex flex-wrap gap-2">
      {TOPICS.map((t) => (
        <button
          key={t} type="button" onClick={() => toggle(t)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
            value.includes(t) ? 'bg-teal text-cream' : 'bg-white text-ink/70 ring-1 ring-navy/15 hover:ring-navy/35'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

function CultureSelect({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} text-navy`}>
      <option value="">Несколько народов / общее</option>
      {cultures.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
    </select>
  )
}

/* ── ProfileHeader ── */

function ProfileHeader({ profile, onEdit }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-center gap-4">
        <Avatar profile={profile} size={72} />
        <div>
          <h2 className="font-display text-xl font-bold text-navy">{profile.name}</h2>
          <p className="text-sm text-ink/55">
            @{profile.handle}{profile.cultureSlug ? ` · ${cultureName(profile.cultureSlug)}` : ''} · {profile.region}
          </p>
          <p className="mt-1 max-w-md text-sm text-ink/60">{profile.bio}</p>
        </div>
      </div>
      <button onClick={onEdit} className="btn-ghost shrink-0"><Settings size={16} /> Профиль</button>
    </div>
  )
}

function StatTiles({ content, profile }) {
  const views = content.reduce((s, c) => s + (c.views || 0), 0)
  const likes = content.reduce((s, c) => s + (c.likes || 0), 0)
  const tiles = [
    { icon: Eye, label: 'Просмотры', value: views, format: fmtNum },
    { icon: ThumbsUp, label: 'Лайки', value: likes, format: fmtNum },
    { icon: UserPlus, label: 'Подписчики', value: profile.followers, format: fmtNum },
    { icon: FileText, label: 'Материалы', value: content.length },
  ]
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-2xl bg-white p-4 shadow-card">
          <t.icon size={18} className="text-teal" />
          <div className="mt-2 font-display text-2xl font-extrabold text-navy">
            <CountUp value={t.value} format={t.format} />
          </div>
          <div className="text-xs uppercase tracking-wide text-ink/45">{t.label}</div>
        </div>
      ))}
    </div>
  )
}

/* ── Мой контент ── */

function StatusChip({ status }) {
  return status === 'published'
    ? <span className="chip bg-teal/15 text-teal">Опубликовано</span>
    : <span className="chip bg-clay/15 text-clay-dark">На модерации</span>
}

function MyContentCard({ item, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-card">
      <div className="relative aspect-[16/9] overflow-hidden" style={{ backgroundColor: accentOf(item.cultureSlug) }}>
        {item.cover
          ? <img src={item.cover} alt="" className="h-full w-full object-cover" />
          : <div className="grid h-full w-full place-items-center text-cream/70"><ImagePlus size={26} /></div>}
        <div className="absolute left-3 top-3"><FormatBadge format={item.format} /></div>
        <div className="absolute right-3 top-3"><StatusChip status={item.status} /></div>
      </div>
      <div className="p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-teal">{cultureName(item.cultureSlug) || 'Народы России'}</div>
        <h3 className="mt-1 font-display text-base font-bold leading-snug text-navy">{item.title}</h3>
        <div className="mt-3 flex items-center gap-4 text-xs text-ink/55">
          <span className="inline-flex items-center gap-1"><Eye size={14} /> {fmtNum(item.views)}</span>
          <span className="inline-flex items-center gap-1"><ThumbsUp size={14} /> {fmtNum(item.likes)}</span>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={onEdit} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-navy/15 py-2 text-sm font-semibold text-navy hover:bg-navy/5">
            <Pencil size={15} /> Редактировать
          </button>
          <button onClick={onDelete} aria-label="Удалить" className="grid h-9 w-9 place-items-center rounded-full border border-navy/15 text-ink/50 hover:border-clay hover:text-clay">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

function MyContent({ content, setContent, onAdd }) {
  const [editing, setEditing] = useState(null)
  const remove = (id) => setContent((p) => p.filter((c) => c.id !== id))
  const save = (item) => { setContent((p) => p.map((c) => (c.id === item.id ? item : c))); setEditing(null) }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-navy">Мои материалы <span className="text-ink/35">{content.length}</span></h2>
        <button onClick={onAdd} className="btn-primary"><Plus size={17} /> Добавить</button>
      </div>

      {content.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy/20 p-12 text-center text-ink/50">
          Здесь будут ваши материалы.
          <button onClick={onAdd} className="ml-1 font-semibold text-teal hover:underline">Добавить первый</button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.map((item) => (
            <MyContentCard key={item.id} item={item} onEdit={() => setEditing(item)} onDelete={() => remove(item.id)} />
          ))}
        </div>
      )}

      {editing && <EditModal item={editing} onSave={save} onDelete={() => { remove(editing.id); setEditing(null) }} onClose={() => setEditing(null)} />}
    </div>
  )
}

function EditModal({ item, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(item)
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  const onCover = async (e) => { const f = e.target.files?.[0]; if (f) set('cover', await readDataUrl(f)) }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div className="absolute inset-0 bg-navy-deep/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative my-auto w-full max-w-lg rounded-2xl bg-cream p-6 shadow-card-hover sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-navy">Редактировать материал</h3>
          <button onClick={onClose} aria-label="Закрыть" className="grid h-9 w-9 place-items-center rounded-full text-ink/50 hover:bg-navy/5"><X size={18} /></button>
        </div>
        <div className="space-y-5">
          <Field label="Формат"><FormatChips value={form.format} onChange={(v) => set('format', v)} /></Field>
          <Field label="Народ"><CultureSelect value={form.cultureSlug || ''} onChange={(v) => set('cultureSlug', v || null)} /></Field>
          <Field label="Заголовок"><input value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} /></Field>
          <Field label="Подзаголовок"><input value={form.subtitle || ''} onChange={(e) => set('subtitle', e.target.value)} className={inputCls} /></Field>
          <Field label="Темы"><TopicChips value={form.topics || []} onChange={(v) => set('topics', v)} /></Field>
          <Field label="Обложка">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-teal">
              <ImagePlus size={17} className="text-teal" /> {form.cover ? 'Заменить' : 'Загрузить'}
              <input type="file" accept="image/*" onChange={onCover} className="hidden" />
            </label>
          </Field>
        </div>
        <div className="mt-7 flex items-center justify-between gap-3">
          <button onClick={onDelete} className="inline-flex items-center gap-1.5 text-sm font-semibold text-clay hover:underline"><Trash2 size={15} /> Удалить</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-ghost">Отмена</button>
            <button onClick={() => onSave(form)} className="btn-primary">Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Studio page ── */

export default function Authors() {
  const { openProfile, openAddContent } = useAuth()
  const [profile] = useLocal(LS.profile, DEFAULT_PROFILE)
  const [content, setContent] = useLocal(LS.content, DEFAULT_CONTENT)

  return (
    <div className="wrap py-10">
      <header className="mb-6">
        <div className="eyebrow mb-2">Кабинет автора</div>
        <h1 className="font-display text-4xl font-extrabold text-navy sm:text-5xl">Студия</h1>
      </header>

      <ProfileHeader profile={profile} onEdit={openProfile} />
      <StatTiles content={content} profile={profile} />

      <div className="mt-8">
        <MyContent content={content} setContent={setContent} onAdd={() => openAddContent()} />
      </div>
    </div>
  )
}
