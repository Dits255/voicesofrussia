import { Check, X } from 'lucide-react'
import { FORMATS } from '../lib/data'

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

export default function StudioGuidelines() {
  return (
    <div className="wrap py-10">
      <div className="eyebrow mb-2">Редакционные принципы</div>
      <h1 className="mb-10 font-display text-4xl font-extrabold text-navy sm:text-5xl">Гайдлайны</h1>

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
                <li key={t} className="flex gap-3 text-sm text-ink/75">
                  <Check size={18} className="mt-0.5 shrink-0 text-teal" strokeWidth={2.6} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-clay/25 bg-clay/5 p-6">
            <h3 className="font-display text-xl font-bold text-navy">Не берём</h3>
            <ul className="mt-4 space-y-3">
              {DONT.map((t) => (
                <li key={t} className="flex gap-3 text-sm text-ink/75">
                  <X size={18} className="mt-0.5 shrink-0 text-clay" strokeWidth={2.6} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h3 className="font-display text-2xl font-bold text-navy">Требования по форматам</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {FORMATS.filter((f) => f.active).map((f) => (
              <div key={f.id} className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-card">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal/10 text-teal">
                  <f.Icon size={18} strokeWidth={1.9} />
                </span>
                <div>
                  <div className="font-semibold text-navy">{f.label}</div>
                  <div className="text-sm text-ink/60">{SPECS[f.id]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-navy p-7 text-cream sm:p-9">
          <h3 className="font-display text-xl font-bold">Чек-лист перед отправкой</h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {CHECKLIST.map((t) => (
              <li key={t} className="flex gap-3 text-cream/85">
                <Check size={18} className="mt-0.5 shrink-0 text-clay" strokeWidth={2.6} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
