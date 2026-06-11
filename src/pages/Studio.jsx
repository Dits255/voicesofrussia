import { Link } from 'react-router-dom'
import { Check, TrendingUp, MessageSquare, Layout } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const GUIDELINES = [
  'Говорите от первого лица — мы ценим личный опыт выше энциклопедии.',
  'Конкретные детали важнее общих слов: имя бабушки, вкус блюда, слово на родном языке.',
  'Никаких костюмов напрокат и клюквы — только то, чем живёте на самом деле.',
  'Любой формат: текст, видео, аудио или короткий ролик.',
]

const AUDIENCE_TIPS = [
  {
    icon: TrendingUp,
    title: 'Публикуйте регулярно',
    text: 'Алгоритм продвигает активных авторов — один материал в неделю уже заметно расширяет охват.',
  },
  {
    icon: MessageSquare,
    title: 'Отвечайте на комментарии',
    text: 'Диалог с читателями повышает вовлечённость и помогает алгоритму показывать материалы шире.',
  },
  {
    icon: Layout,
    title: 'Используйте все форматы',
    text: 'Текст, видео и подкаст расширяют аудиторию: разные люди воспринимают контент по-разному.',
  },
]

export default function Studio() {
  const { user } = useAuth()

  return (
    <div className="pb-10">
      {/* Шапка */}
      <div className="bg-gradient-to-br from-navy to-teal-dark py-12 text-cream">
        <div className="wrap">
          <div className="eyebrow mb-2 text-cream/55">Студия автора</div>
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">
            {user?.name ?? 'Автор платформы'}
          </h1>
          <p className="mt-1 text-cream/65">Автор платформы</p>
          <div className="mt-5 flex flex-wrap gap-6 text-sm">
            <span className="text-cream/60"><b className="font-semibold text-cream">0</b> публикаций</span>
            <span className="text-cream/60"><b className="font-semibold text-cream">—</b> просмотров</span>
            <span className="text-cream/60"><b className="font-semibold text-cream">1,2 тыс.</b> подписчиков</span>
          </div>
        </div>
      </div>

      <div className="wrap space-y-14 py-12">
        {/* Гайдлайны */}
        <section id="guidelines" className="scroll-mt-20">
          <div className="eyebrow mb-2">Редакционные принципы</div>
          <h2 className="mb-6 font-display text-2xl font-bold text-navy">Гайдлайны платформы</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {GUIDELINES.map((text, i) => (
              <div key={i} className="flex gap-3 rounded-xl border border-navy/10 bg-white p-5">
                <Check size={17} className="mt-0.5 shrink-0 text-clay" />
                <p className="text-sm leading-relaxed text-ink/75">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Привлечение аудитории */}
        <section id="audience" className="scroll-mt-20">
          <div className="eyebrow mb-2">Советы</div>
          <h2 className="mb-6 font-display text-2xl font-bold text-navy">Привлечение аудитории</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {AUDIENCE_TIPS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-xl border border-navy/10 bg-white p-6">
                <Icon size={22} className="mb-3 text-teal" />
                <h3 className="mb-2 font-semibold text-navy">{title}</h3>
                <p className="text-sm leading-relaxed text-ink/65">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Инструменты (заглушки) */}
        <section id="tools" className="scroll-mt-20">
          <div className="eyebrow mb-6">Инструменты</div>
          <div className="grid grid-cols-3 gap-4 opacity-40">
            {['Публикации', 'Аналитика', 'Редактор'].map((label) => (
              <div key={label} className="rounded-xl border border-navy/15 px-4 py-8 text-center">
                <p className="font-semibold text-navy">{label}</p>
                <p className="mt-1 text-xs text-ink/50">Скоро</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
