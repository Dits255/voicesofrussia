import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  content, cultures, featuredContent, sortByDate, cultureName, bylineFor,
} from '../lib/data'
import { VoiceCard, ContentCard, CultureCard } from '../components/cards'
import { SectionHeader, FormatBadge } from '../components/ui'

function Hero() {
  const lead = featuredContent()[0]
  return (
    <section className="relative overflow-hidden">
      <div className="wrap grid items-center gap-10 pb-10 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:pb-16 lg:pt-16">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <div className="eyebrow mb-4">Мультимедийная платформа народов России</div>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] text-navy sm:text-5xl lg:text-6xl">
              Живые истории<br />живых людей
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink/70">
              Не музей за стеклом и не безликий вирусный контент. Представители народов России
              рассказывают о себе сами — на родном языке, со своим характером и без клише.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/feed" className="btn-navy">Смотреть ленту</Link>
              <Link to="/about#apply" className="btn-ghost">Рассказать свою историю</Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-ink/55">
              <span><b className="text-navy">{cultures.length}</b> народов</span>
              <span><b className="text-navy">{content.filter((c) => c.hasBody).length}</b> историй</span>
              <span><b className="text-navy">5</b> форматов</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Link to={`/story/${lead.slug}`} className="group relative block overflow-hidden rounded-2xl shadow-card-hover">
            <div className="aspect-[4/5] w-full sm:aspect-[16/12] lg:aspect-[4/5]">
              <img src={lead.hero} alt={lead.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/40 to-transparent" />
            <div className="absolute left-5 top-5"><FormatBadge format={lead.format} /></div>
            <div className="absolute inset-x-0 bottom-0 p-6 text-cream">
              <span className="eyebrow text-clay">Сегодня на платформе</span>
              <h2 className="mt-2 font-display text-2xl font-bold leading-tight sm:text-3xl">{lead.title}</h2>
              <p className="mt-1 text-cream/75">{lead.subtitle}</p>
              <div className="mt-4 text-sm text-cream/80">
                {cultureName(lead.cultureSlug)}{bylineFor(lead) ? ` · ${bylineFor(lead)}` : ''}
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function Voices() {
  const voices = [...featuredContent(), ...content.filter((c) => c.hasBody && !c.featured)].slice(0, 8)
  return (
    <section className="wrap py-14">
      <SectionHeader
        eyebrow="Голоса"
        title="Истории, рассказанные изнутри"
        subtitle="За каждой — конкретный народ и реальные люди."
        action={{ to: '/feed', label: 'Все истории' }}
      />
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {voices.map((v) => <VoiceCard key={v.slug} item={v} />)}
      </div>
    </section>
  )
}

function Peoples() {
  return (
    <section className="py-14">
      <div className="wrap">
        <SectionHeader
          eyebrow="Народы"
          title="Девять народов — девять миров"
          subtitle="От тайги Сихотэ-Алиня до буддийских степей Калмыкии."
        />
      </div>
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-5 pb-3 sm:px-8 lg:px-12">
        {cultures.map((c) => <CultureCard key={c.slug} culture={c} />)}
        <Link
          to="/feed"
          className="grid w-[60vw] shrink-0 place-items-center rounded-2xl border-2 border-dashed border-navy/20 text-center text-navy/60 hover:border-teal hover:text-teal sm:w-[200px]"
        >
          <span className="px-6">Вся лента историй →</span>
        </Link>
      </div>
    </section>
  )
}

function ReadNow() {
  const items = sortByDate(content.filter((c) => c.hasBody)).slice(0, 3)
  return (
    <section className="wrap py-14">
      <SectionHeader
        eyebrow="Читать сейчас"
        title="Свежие истории"
        action={{ to: '/feed', label: 'В ленту' }}
      />
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((i) => <ContentCard key={i.slug} item={i} />)}
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="wrap py-16">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal to-teal-dark px-7 py-12 text-cream sm:px-12 sm:py-16">
        <div className="relative max-w-2xl">
          <div className="eyebrow text-cream/70">Ты автор?</div>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
            Расскажи свою историю
          </h2>
          <p className="mt-4 text-lg text-cream/85">
            Если ты — представитель своего народа и хочешь показать его настоящим: без костюмов
            напрокат и без клюквы. Мы помогаем с форматом, съёмкой и текстом.
          </p>
          <Link to="/about#apply" className="btn mt-7 bg-cream text-navy hover:-translate-y-0.5">
            Подать заявку
          </Link>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-cream/10" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-clay/30" />
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <Voices />
      <Peoples />
      <ReadNow />
      <CTA />
    </>
  )
}
