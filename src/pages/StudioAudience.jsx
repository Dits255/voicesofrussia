import { Link } from 'react-router-dom'
import { Megaphone, Users, Heart, ArrowRight } from 'lucide-react'

const SEGMENTS = [
  {
    title: 'Молодёжь 16–24',
    who: 'Смотрят вертикальные видео, ловят тренды, ценят искренность и юмор.',
    format: 'Короткое видео',
    channel: 'Shorts, Reels, VK Клипы, TikTok',
    tone: 'Лёгкий, личный, с самоиронией',
    example: { label: '«Почему я говорю на якутском»', to: '/story/video-pochemu-ya-govoryu-na-yakutskom' },
  },
  {
    title: 'Земляки и диаспоры',
    who: 'Ищут своё — родной язык, традиции, события, ощущение общности.',
    format: 'Интервью, репортаж',
    channel: 'Telegram-сообщества, тематические паблики',
    tone: 'Тёплый, «свой для своих»',
    example: { label: '«Гостеприимство, садака и свадьба в юрте»', to: '/story/kazahi-sadaka-svadba' },
  },
  {
    title: 'Любознательные 25–45',
    who: 'Читают вдумчиво, любят контекст и хорошие истории о стране.',
    format: 'Лонгрид, документалка',
    channel: 'Сайт, Дзен, медиапартнёры, YouTube',
    tone: 'Содержательный, журнальный',
    example: { label: '«Республика Саха в миниатюре»', to: '/story/saha-v-miniature' },
  },
  {
    title: 'Эксперты и образование',
    who: 'Преподаватели, исследователи, журналисты — ценят глубину и точность.',
    format: 'Интервью, подборка',
    channel: 'СМИ, образовательные платформы, библиотеки',
    tone: 'Экспертный, выверенный',
    example: { label: '«Культурный код против стереотипа»', to: '/story/alekseeva-intervyu' },
  },
]

const FUNNEL = [
  { icon: Megaphone, title: 'Охват', text: 'Короткие видео и яркие подборки в соцсетях знакомят с платформой.' },
  { icon: Users, title: 'Вовлечение', text: 'Лента и лонгриды удерживают: человек читает историю целиком.' },
  { icon: Heart, title: 'Лояльность', text: 'Подписка на авторов и народы, возвращение за новыми историями.' },
]

function Row({ k, v }) {
  return (
    <div className="flex gap-2">
      <dt className="w-16 shrink-0 text-ink/45">{k}</dt>
      <dd className="font-medium text-navy">{v}</dd>
    </div>
  )
}

export default function StudioAudience() {
  return (
    <div className="wrap py-10">
      <div className="eyebrow mb-2">Советы</div>
      <h1 className="mb-10 font-display text-4xl font-extrabold text-navy sm:text-5xl">Аудитория</h1>

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
              <Link
                to={s.example.to}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:gap-2.5"
                style={{ transition: 'gap .2s' }}
              >
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
                <tr>
                  <th className="px-5 py-3 font-semibold">Формат</th>
                  <th className="px-5 py-3 font-semibold">Сегмент</th>
                  <th className="px-5 py-3 font-semibold">Канал</th>
                </tr>
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
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy text-cream">
                    <f.icon size={18} />
                  </span>
                  <span className="font-display text-lg font-bold text-navy">{i + 1}. {f.title}</span>
                </div>
                <p className="mt-3 text-sm text-ink/65">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
