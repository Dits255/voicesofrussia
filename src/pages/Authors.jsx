import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Check, X, Upload, ImagePlus, Send, Users, Megaphone, Heart, ArrowRight,
  Eye, ThumbsUp, UserPlus, FileText, Pencil, Trash2, Plus, Settings,
} from 'lucide-react'
import { FORMATS, TOPICS, cultures, cultureName } from '../lib/data'
import { FormatBadge } from '../components/ui'

const LS = { profile: 'golosa-profile', content: 'golosa-mycontent' }

const TABS = [
  { id: 'content', label: 'Мой контент' },
  { id: 'add', label: 'Добавить' },
  { id: 'profile', label: 'Профиль' },
  { id: 'guidelines', label: 'Гайдлайны' },
  { id: 'audience', label: 'Аудитория' },
]

/* ───────────────────────────  утилиты / состояние  ─────────────────────────── */

function useLocal(key, initial) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial } catch { return initial }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* ignore */ } }, [key, v])
  return [v, setV]
}

const DEFAULT_PROFILE = {
  name: 'Аяна Спиридонова',
  handle: 'ayana.sakha',
  cultureSlug: 'yakuty',
  region: 'Якутск',
  bio: 'Рассказываю про современную Якутию — без шаманской клюквы. Студентка, автор «Голосов России».',
  avatar: '',
  followers: 1240,
}

const DEFAULT_CONTENT = [
  { id: 'm1', title: 'Как я храню якутский дома', subtitle: 'Язык в обычной городской семье', format: 'Лонгрид', cultureSlug: 'yakuty', topics: ['Язык', 'Идентичность'], status: 'published', views: 12300, likes: 840, cover: '' },
  { id: 'm2', title: 'Ысыах в большом городе', subtitle: 'Праздник солнца вдали от дома', format: 'Короткое', cultureSlug: 'yakuty', topics: ['Традиции'], status: 'moderation', views: 0, likes: 0, cover: '' },
  { id: 'm3', title: 'Строганина: рецепт от бабушки', subtitle: 'Как готовят на родине', format: 'Подборка', cultureSlug: 'yakuty', topics: ['Еда'], status: 'published', views: 5100, likes: 320, cover: '' },
]

const fmtNum = (n) => {
  if (!n) return '0'
  if (n >= 1000) { const v = n / 1000; return `${v.toFixed(v < 10 ? 1 : 0).replace('.', ',')} тыс.` }
  return String(n)
}
const initials = (name) => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
const readDataUrl = (file) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file) })
const accentOf = (slug) => cultures.find((c) => c.slug === slug)?.accent || '#1A3A5C'

function Avatar({ profile, size = 64 }) {
  return profile.avatar ? (
    <img src={profile.avatar} alt="" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span
      className="grid shrink-0 place-items-center rounded-full font-display font-bold text-cream"
      style={{ width: size, height: size, background: accentOf(profile.cultureSlug), fontSize: size * 0.36 }}
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

const acceptFor = (format) =>
  format === 'Видео' || format === 'Короткое' ? 'video/*'
    : format === 'Подкаст' ? 'audio/*' : '.doc,.docx,.md,.txt,.pdf'
const fmtSize = (b) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} МБ` : `${Math.max(1, Math.round(b / 1e3))} КБ`)

/* ───────────────────────────  шапка кабинета  ─────────────────────────── */

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
    { icon: Eye, label: 'Просмотры', value: fmtNum(views) },
    { icon: ThumbsUp, label: 'Лайки', value: fmtNum(likes) },
    { icon: UserPlus, label: 'Подписчики', value: fmtNum(profile.followers) },
    { icon: FileText, label: 'Материалы', value: content.length },
  ]
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-2xl bg-white p-4 shadow-card">
          <t.icon size={18} className="text-teal" />
          <div className="mt-2 font-display text-2xl font-extrabold text-navy">{t.value}</div>
          <div className="text-xs uppercase tracking-wide text-ink/45">{t.label}</div>
        </div>
      ))}
    </div>
  )
}

/* ───────────────────────────  Мой контент  ─────────────────────────── */

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

/* ───────────────────────────  Добавить контент  ─────────────────────────── */

function UploadStudio({ onAdd, onDone }) {
  const [format, setFormat] = useState('Лонгрид')
  const [cultureSlug, setCultureSlug] = useState('')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [topics, setTopics] = useState([])
  const [file, setFile] = useState(null)
  const [cover, setCover] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [byline, setByline] = useState('')

  const onCover = async (e) => { const f = e.target.files?.[0]; if (f) setCover(await readDataUrl(f)) }

  const submit = (e) => {
    e.preventDefault()
    onAdd({
      id: `m${Date.now()}`, title, subtitle, format, cultureSlug: cultureSlug || null,
      topics, status: 'moderation', views: 0, likes: 0, cover,
    })
    onDone()
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <form onSubmit={submit} className="space-y-7">
        <Field label="Формат"><FormatChips value={format} onChange={setFormat} /></Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Народ"><CultureSelect value={cultureSlug} onChange={setCultureSlug} /></Field>
          <Field label="Автор(ы)"><input value={byline} onChange={(e) => setByline(e.target.value)} placeholder="Имя, или несколько через запятую" className={inputCls} /></Field>
        </div>

        <Field label="Заголовок"><input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Коротко и по сути — как живёт ваш народ сегодня" className={inputCls} /></Field>
        <Field label="Подзаголовок"><input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Уточнение в одну строку" className={inputCls} /></Field>
        <Field label="Темы"><TopicChips value={topics} onChange={setTopics} /></Field>

        <Field label={`Файл материала (${acceptFor(format)})`}>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-navy/20 bg-white px-6 py-8 text-center transition-colors hover:border-teal">
            <Upload size={26} className="text-teal" />
            {file ? (
              <span className="text-sm font-semibold text-navy">{file.name} · {fmtSize(file.size)}</span>
            ) : (
              <>
                <span className="text-sm font-semibold text-navy">Перетащите файл или выберите</span>
                <span className="text-xs text-ink/50">До 500 МБ. Видео — mp4, аудио — mp3, текст — docx/md</span>
              </>
            )}
            <input type="file" accept={acceptFor(format)} onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
          </label>
        </Field>

        <Field label="Обложка (превью обновится справа)">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm font-semibold text-navy transition-colors hover:border-teal">
            <ImagePlus size={18} className="text-teal" /> {cover ? 'Заменить обложку' : 'Загрузить обложку'}
            <input type="file" accept="image/*" onChange={onCover} className="hidden" />
          </label>
        </Field>

        <Field label="Краткое описание">
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} placeholder="2–3 предложения, которые появятся в ленте и анонсах" className={inputCls} />
        </Field>

        <button type="submit" className="btn-primary w-full sm:w-auto"><Send size={17} /> Отправить на модерацию</button>
        <p className="text-xs text-ink/45">Демо-студия — файлы никуда не загружаются, материал появится в «Моём контенте».</p>
      </form>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="text-xs font-semibold uppercase tracking-widest text-ink/40">Как это будет в ленте</div>
        <div className="mt-3 overflow-hidden rounded-xl bg-white shadow-card">
          <div className="relative aspect-[16/10] overflow-hidden" style={{ backgroundColor: accentOf(cultureSlug) }}>
            {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-cream/70"><ImagePlus size={28} /></div>}
            <div className="absolute left-3 top-3"><FormatBadge format={format} /></div>
          </div>
          <div className="p-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal">{cultureName(cultureSlug) || 'Народы России'}</div>
            <h3 className="font-display text-lg font-bold leading-snug text-navy">{title || 'Заголовок вашей истории'}</h3>
            {subtitle && <p className="mt-1.5 line-clamp-2 text-sm text-ink/60">{subtitle}</p>}
            <div className="mt-4 text-xs text-ink/55">{byline || 'Автор'}</div>
          </div>
        </div>
      </aside>
    </div>
  )
}

/* ───────────────────────────  Профиль  ─────────────────────────── */

function ProfileSettings({ profile, setProfile }) {
  const [form, setForm] = useState(profile)
  const [saved, setSaved] = useState(false)
  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setSaved(false) }
  const onAvatar = async (e) => { const f = e.target.files?.[0]; if (f) set('avatar', await readDataUrl(f)) }
  const save = (e) => { e.preventDefault(); setProfile(form); setSaved(true) }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-7">
      <div className="flex items-center gap-5">
        <Avatar profile={form} size={88} />
        <div className="flex flex-col gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:border-teal">
            <ImagePlus size={17} className="text-teal" /> Сменить аватар
            <input type="file" accept="image/*" onChange={onAvatar} className="hidden" />
          </label>
          {form.avatar && <button type="button" onClick={() => set('avatar', '')} className="text-left text-xs font-semibold text-clay hover:underline">Убрать фото</button>}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Имя"><input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} /></Field>
        <Field label="Никнейм"><input value={form.handle} onChange={(e) => set('handle', e.target.value)} className={inputCls} /></Field>
        <Field label="Народ"><CultureSelect value={form.cultureSlug || ''} onChange={(v) => set('cultureSlug', v || null)} /></Field>
        <Field label="Город / регион"><input value={form.region} onChange={(e) => set('region', e.target.value)} className={inputCls} /></Field>
      </div>

      <Field label="О себе"><textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={3} className={inputCls} /></Field>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary">Сохранить профиль</button>
        {saved && <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal"><Check size={16} /> Сохранено</span>}
      </div>
    </form>
  )
}

/* ───────────────────────────  Гайдлайны  ─────────────────────────── */

const TAKE = [
  'Личный опыт от первого лица — голос конкретного человека',
  'Конкретные детали: имя бабушки, вкус блюда, слово на родном языке',
  'Современность: как народ живёт сегодня — в городе, на работе, в соцсетях',
  'Родной язык приветствуется (с переводом или субтитрами)',
]
const DONT = [
  'Костюмы напрокат и постановочный «фольклор» ради экзотики',
  'Стереотипы и «дикая экзотика» вместо культурного кода',
  'Обезличенный вирусный контент без этнической специфики',
  'Непроверенные факты и чужие материалы без разрешения',
]
const SPECS = {
  Лонгрид: '4 000–12 000 знаков, 1–3 фото, подзаголовки',
  Интервью: 'расшифровка + аудио по желанию, согласие героя',
  Подборка: '5–12 пунктов, по фото на пункт',
  Видео: '3–15 минут, горизонтально 16:9, звук чистый',
  Короткое: 'до 60 секунд, вертикально 9:16',
  Подкаст: '15–40 минут, mp3, обложка эпизода',
}
const CHECKLIST = [
  'Материал от первого лица и с конкретными деталями',
  'Указан народ, формат и темы',
  'Есть обложка и краткое описание',
  'Факты и имена проверены, получены согласия',
]

function Guidelines() {
  return (
    <div className="space-y-12">
      <p className="max-w-2xl text-lg leading-relaxed text-ink/70">
        Мы ищем баланс между аутентичностью и массовой привлекательностью. Эти правила помогают
        не свалиться ни в «музей за стеклом», ни в безликий развлекательный контент.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-teal/20 bg-teal/5 p-6">
          <h3 className="font-display text-xl font-bold text-navy">Берём</h3>
          <ul className="mt-4 space-y-3">
            {TAKE.map((t) => (
              <li key={t} className="flex gap-3 text-sm text-ink/75"><Check size={18} className="mt-0.5 shrink-0 text-teal" strokeWidth={2.6} /><span>{t}</span></li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-clay/25 bg-clay/5 p-6">
          <h3 className="font-display text-xl font-bold text-navy">Не берём</h3>
          <ul className="mt-4 space-y-3">
            {DONT.map((t) => (
              <li key={t} className="flex gap-3 text-sm text-ink/75"><X size={18} className="mt-0.5 shrink-0 text-clay" strokeWidth={2.6} /><span>{t}</span></li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <h3 className="font-display text-2xl font-bold text-navy">Требования по форматам</h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {FORMATS.filter((f) => f.active).map((f) => (
            <div key={f.id} className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-card">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal/10 text-teal"><f.Icon size={18} strokeWidth={1.9} /></span>
              <div><div className="font-semibold text-navy">{f.label}</div><div className="text-sm text-ink/60">{SPECS[f.id]}</div></div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-navy p-7 text-cream sm:p-9">
        <h3 className="font-display text-xl font-bold">Чек-лист перед отправкой</h3>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {CHECKLIST.map((t) => (
            <li key={t} className="flex gap-3 text-cream/85"><Check size={18} className="mt-0.5 shrink-0 text-clay" strokeWidth={2.6} /><span>{t}</span></li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ───────────────────────────  Аудитория  ─────────────────────────── */

const SEGMENTS = [
  { title: 'Молодёжь 16–24', who: 'Смотрят вертикальные видео, ловят тренды, ценят искренность и юмор.', format: 'Короткое видео', channel: 'Shorts, Reels, VK Клипы, TikTok', tone: 'Лёгкий, личный, с самоиронией', example: { label: '«Почему я говорю на якутском»', to: '/story/video-pochemu-ya-govoryu-na-yakutskom' } },
  { title: 'Земляки и диаспоры', who: 'Ищут своё — родной язык, традиции, события, ощущение общности.', format: 'Интервью, репортаж', channel: 'Telegram-сообщества, тематические паблики', tone: 'Тёплый, «свой для своих»', example: { label: '«Гостеприимство, садака и свадьба в юрте»', to: '/story/kazahi-sadaka-svadba' } },
  { title: 'Любознательные 25–45', who: 'Читают вдумчиво, любят контекст и хорошие истории о стране.', format: 'Лонгрид, документалка', channel: 'Сайт, Дзен, медиапартнёры, YouTube', tone: 'Содержательный, журнальный', example: { label: '«Республика Саха в миниатюре»', to: '/story/saha-v-miniature' } },
  { title: 'Эксперты и образование', who: 'Преподаватели, исследователи, журналисты — ценят глубину и точность.', format: 'Интервью, подборка', channel: 'СМИ, образовательные платформы, библиотеки', tone: 'Экспертный, выверенный', example: { label: '«Культурный код против стереотипа»', to: '/story/alekseeva-intervyu' } },
]
const FUNNEL = [
  { icon: Megaphone, title: 'Охват', text: 'Короткие видео и яркие подборки в соцсетях знакомят с платформой.' },
  { icon: Users, title: 'Вовлечение', text: 'Лента и лонгриды удерживают: человек читает историю целиком.' },
  { icon: Heart, title: 'Лояльность', text: 'Подписка на авторов и народы, возвращение за новыми историями.' },
]

function Row({ k, v }) {
  return <div className="flex gap-2"><dt className="w-16 shrink-0 text-ink/45">{k}</dt><dd className="font-medium text-navy">{v}</dd></div>
}

function Audience() {
  return (
    <div className="space-y-12">
      <p className="max-w-2xl text-lg leading-relaxed text-ink/70">
        Одна история — разные входы. Чтобы охватить и молодёжь, и экспертов, мы упаковываем материал
        в разные форматы и ведём по своим каналам, не теряя этническую специфику.
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        {SEGMENTS.map((s) => (
          <div key={s.title} className="rounded-2xl bg-white p-6 shadow-card">
            <h3 className="font-display text-xl font-bold text-navy">{s.title}</h3>
            <p className="mt-2 text-sm text-ink/65">{s.who}</p>
            <dl className="mt-4 space-y-1.5 text-sm">
              <Row k="Формат" v={s.format} />
              <Row k="Канал" v={s.channel} />
              <Row k="Тон" v={s.tone} />
            </dl>
            <Link to={s.example.to} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:gap-2.5" style={{ transition: 'gap .2s' }}>
              Пример: {s.example.label} <ArrowRight size={15} />
            </Link>
          </div>
        ))}
      </div>
      <div>
        <h3 className="font-display text-2xl font-bold text-navy">Матрица «формат → сегмент → канал»</h3>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-navy/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-navy/5 text-xs uppercase tracking-wide text-ink/50">
              <tr><th className="px-5 py-3 font-semibold">Формат</th><th className="px-5 py-3 font-semibold">Сегмент</th><th className="px-5 py-3 font-semibold">Канал</th></tr>
            </thead>
            <tbody className="divide-y divide-navy/8">
              {[
                ['Короткое видео', 'Молодёжь 16–24', 'Shorts · Reels · VK Клипы'],
                ['Видео', 'Любознательные 25–45', 'YouTube · сайт'],
                ['Лонгрид', 'Любознательные 25–45', 'Сайт · Дзен · медиапартнёры'],
                ['Интервью', 'Эксперты, земляки', 'СМИ · Telegram-сообщества'],
                ['Подборка', 'Молодёжь, земляки', 'Соцсети · сайт'],
                ['Подкаст', 'Любознательные, эксперты', 'Подкаст-платформы'],
              ].map((r) => (
                <tr key={r[0]} className="bg-white">
                  <td className="px-5 py-3 font-semibold text-navy">{r[0]}</td>
                  <td className="px-5 py-3 text-ink/70">{r[1]}</td>
                  <td className="px-5 py-3 text-ink/70">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h3 className="font-display text-2xl font-bold text-navy">Путь аудитории</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {FUNNEL.map((f, i) => (
            <div key={f.title} className="rounded-2xl bg-cream-2/60 p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy text-cream"><f.icon size={18} /></span>
                <span className="font-display text-lg font-bold text-navy">{i + 1}. {f.title}</span>
              </div>
              <p className="mt-3 text-sm text-ink/65">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────────  Кабинет (страница)  ─────────────────────────── */

export default function Authors() {
  const location = useLocation()
  const [profile, setProfile] = useLocal(LS.profile, DEFAULT_PROFILE)
  const [content, setContent] = useLocal(LS.content, DEFAULT_CONTENT)
  const initial = TABS.some((t) => t.id === location.hash.slice(1)) ? location.hash.slice(1) : 'content'
  const [tab, setTab] = useState(initial)

  useEffect(() => {
    const h = location.hash.slice(1)
    if (TABS.some((t) => t.id === h)) setTab(h)
  }, [location.hash])

  const select = (id) => {
    setTab(id)
    try { window.history.replaceState(null, '', `#${id}`) } catch { /* ignore */ }
  }

  const addItem = (item) => setContent((p) => [item, ...p])

  return (
    <div className="wrap py-10">
      <header className="mb-6">
        <div className="eyebrow mb-2">Кабинет автора</div>
        <h1 className="font-display text-4xl font-extrabold text-navy sm:text-5xl">Студия</h1>
      </header>

      <ProfileHeader profile={profile} onEdit={() => select('profile')} />
      <StatTiles content={content} profile={profile} />

      <div className="no-scrollbar mb-9 mt-8 flex gap-2 overflow-x-auto border-b border-navy/10">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => select(t.id)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              tab === t.id ? 'border-teal text-teal' : 'border-transparent text-ink/55 hover:text-navy'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'content' && <MyContent content={content} setContent={setContent} onAdd={() => select('add')} />}
      {tab === 'add' && <UploadStudio onAdd={addItem} onDone={() => select('content')} />}
      {tab === 'profile' && <ProfileSettings profile={profile} setProfile={setProfile} />}
      {tab === 'guidelines' && <Guidelines />}
      {tab === 'audience' && <Audience />}
    </div>
  )
}
