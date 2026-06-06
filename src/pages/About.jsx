import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { FORMATS } from '../lib/data'

const PRINCIPLES = [
  {
    n: '01',
    title: 'Не музей за стеклом',
    text: 'Культура — это не костюм напрокат и не фольклорный ансамбль на сцене. Мы показываем, как народы живут сегодня: в мегаполисах, на работе, на кухне и в соцсетях.',
  },
  {
    n: '02',
    title: 'Код, а не стереотип',
    text: 'Как говорит искусствовед Галина Алексеева, важно различать культурный код и клише. Мы опираемся на глубинные смыслы, а не на ярлыки «дикой экзотики».',
  },
  {
    n: '03',
    title: 'Аутентичные голоса',
    text: 'О народе рассказывает его представитель — от первого лица, на родном языке, со своим характером. Редакция помогает с формой, но не переписывает суть.',
  },
]

const FORMAT_DESC = {
  Лонгрид: 'Глубокие тексты-репортажи и очерки о жизни народа.',
  Интервью: 'Прямая речь героев и экспертов без причёсанных формулировок.',
  Подборка: 'Списки и гиды: приметы, инструменты, рецепты, слова.',
  Видео: 'Документальные дневники и портреты людей.',
  Короткое: 'Вертикальные ролики на минуту — для ленты и соцсетей.',
  Подкаст: 'Разговоры и аудиоистории на родных языках.',
}

export default function About() {
  return (
    <div className="pb-6">
      {/* Миссия */}
      <section className="wrap py-14 sm:py-20">
        <div className="eyebrow mb-4">О проекте</div>
        <h1 className="max-w-4xl font-display text-4xl font-extrabold leading-[1.08] text-navy sm:text-6xl">
          Платформа, где народы России говорят сами за себя
        </h1>
        <p className="mt-6 max-w-2xl text-xl leading-relaxed text-ink/70">
          «Голоса России» ищут баланс между аутентичностью и массовой привлекательностью. Мы не
          превращаем культуру в музейный экспонат и не растворяем её в безликом развлекательном
          контенте. Между этими крайностями — живые истории живых людей.
        </p>
      </section>

      {/* Принципы */}
      <section className="bg-navy py-16 text-cream">
        <div className="wrap">
          <div className="eyebrow text-clay">Принципы репрезентации</div>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Три правила, на которых всё держится</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <div key={p.n} className="rounded-2xl bg-cream/5 p-7 ring-1 ring-cream/10">
                <div className="font-display text-4xl font-extrabold text-clay">{p.n}</div>
                <h3 className="mt-3 font-display text-xl font-bold">{p.title}</h3>
                <p className="mt-3 text-cream/70">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Форматы */}
      <section className="wrap py-16">
        <div className="eyebrow">Форматы контента</div>
        <h2 className="mt-2 font-display text-3xl font-bold text-navy sm:text-4xl">Одна культура — много форм</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FORMATS.map((f) => (
            <div key={f.id} className="flex gap-4 rounded-2xl bg-white p-5 shadow-card">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal/10 text-teal">
                <f.Icon size={22} strokeWidth={1.9} aria-hidden />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-navy">{f.label}</h3>
                  {!f.active && <span className="chip bg-ink/10 text-ink/50">скоро</span>}
                </div>
                <p className="mt-1 text-sm text-ink/60">{FORMAT_DESC[f.id]}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — в студию авторов */}
      <section id="apply" className="wrap scroll-mt-24 pb-8">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-teal to-teal-dark p-8 text-cream sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="eyebrow text-cream/70">Стать автором</div>
              <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Расскажите свою историю</h2>
              <ul className="mt-6 space-y-3 text-cream/90">
                {[
                  'Говорите от первого лица — мы ценим личный опыт выше энциклопедии.',
                  'Конкретные детали важнее общих слов: имя бабушки, вкус блюда, слово на родном языке.',
                  'Никаких костюмов напрокат и клюквы — только то, чем живёте на самом деле.',
                  'Любой формат: текст, видео, аудио или короткий ролик.',
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <Check size={18} strokeWidth={2.6} className="mt-1 shrink-0 text-clay" aria-hidden />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); alert('Спасибо! Это демо-форма — заявка не отправляется.') }}
              className="space-y-3 rounded-2xl bg-cream p-6 text-ink"
            >
              <h3 className="font-display text-lg font-bold text-navy">Заявка автора</h3>
              <input required placeholder="Имя" className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm outline-none focus:border-teal" />
              <input required placeholder="Народ, который вы представляете" className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm outline-none focus:border-teal" />
              <input required type="email" placeholder="E-mail" className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm outline-none focus:border-teal" />
              <textarea placeholder="О чём хотите рассказать?" rows={3} className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm outline-none focus:border-teal" />
              <button type="submit" className="btn-primary w-full">Отправить заявку</button>
            </form>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-ink/50">
          Уже знаете, что хотите почитать? <Link to="/feed" className="font-semibold text-teal hover:underline">Откройте ленту историй</Link>
        </p>
      </section>
    </div>
  )
}
