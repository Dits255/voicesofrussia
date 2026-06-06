import { useParams, Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import {
  getContent, getCulture, getArticleHtml,
  relatedContent, formatDate, cultureName, BYLINE_NOTE, authorsOf,
} from '../lib/data'
import { FormatBadge, AuthorAvatar } from '../components/ui'
import { ContentCard } from '../components/cards'
import ArticleFeedback from '../components/ArticleFeedback'
import NotFound from './NotFound'

function AuthorLinks({ item, size = 26, dark = false }) {
  const auts = authorsOf(item)
  if (!auts.length) return null
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {auts.map((a) => (
        <Link
          key={a.slug}
          to={`/author/${a.slug}`}
          className={`inline-flex items-center gap-2 ${dark ? 'hover:text-clay' : 'hover:text-teal'}`}
        >
          <AuthorAvatar author={a} size={size} />
          <span className={`font-semibold ${dark ? 'text-cream' : 'text-navy'}`}>{a.name}</span>
        </Link>
      ))}
    </div>
  )
}

function Related({ related }) {
  if (!related.length) return null
  return (
    <section className="wrap mt-16">
      <h2 className="mb-6 font-display text-2xl font-bold text-navy">Похожие истории</h2>
      <div className="grid gap-5 md:grid-cols-3">
        {related.map((r) => <ContentCard key={r.slug} item={r} />)}
      </div>
    </section>
  )
}

// === Видео-страница в духе YouTube: плеер сверху, под ним заголовок и описание ===
function VideoView({ item, culture, related }) {
  const isShort = item.format === 'Короткое'
  return (
    <div className="pb-6">
      <div className="wrap py-8 sm:py-10">
        <div className="mx-auto max-w-4xl">
          {/* Плеер: реальное видео, если задан item.videoSrc, иначе заглушка */}
          <div
            className={`relative mx-auto overflow-hidden rounded-2xl bg-black ${
              isShort ? 'aspect-[9/16] max-w-[340px]' : 'aspect-video w-full'
            }`}
          >
            {item.videoSrc ? (
              <video
                controls
                playsInline
                preload="metadata"
                poster={item.hero}
                className="h-full w-full bg-black object-contain"
              >
                <source src={item.videoSrc} />
                Ваш браузер не поддерживает видео.
              </video>
            ) : (
              <>
                <img src={item.hero} alt="" className="h-full w-full object-cover opacity-40" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="flex flex-col items-center gap-3 text-cream">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-cream/95 text-navy shadow-lg transition-transform hover:scale-105">
                      <Play size={26} fill="currentColor" className="ml-1" />
                    </span>
                    <span className="rounded-full bg-navy/70 px-3 py-1.5 text-sm font-medium backdrop-blur">
                      Видео скоро появится
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Заголовок */}
          <h1 className="mt-5 font-display text-2xl font-extrabold leading-tight text-navy sm:text-3xl">
            {item.title}
          </h1>
          {item.subtitle && <p className="mt-1.5 text-lg text-ink/60">{item.subtitle}</p>}

          {/* Мета-строка */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-navy/10 pb-4">
            <FormatBadge format={item.format} soon={item.isPlaceholder} />
            {culture && (
              <Link
                to={`/culture/${culture.slug}`}
                className="chip text-cream"
                style={{ backgroundColor: culture.accent }}
              >
                {culture.name}
              </Link>
            )}
            <span className="text-sm text-ink/55">
              {formatDate(item.date)}{item.duration ? ` · ${item.duration}` : ''}
            </span>
            {item.topics?.map((t) => (
              <span key={t} className="text-sm text-teal">#{t.toLowerCase()}</span>
            ))}
          </div>

          {/* Описание (как блок описания на YouTube) */}
          <div className="mt-4 rounded-2xl bg-cream-2/60 p-5 text-[15px] leading-relaxed text-ink/80">
            {authorsOf(item).length > 0 && (
              <div className="mb-3">
                <AuthorLinks item={item} size={24} />
                <p className="mt-1 text-sm text-ink/55">{BYLINE_NOTE}</p>
              </div>
            )}
            <p>{item.excerpt}</p>
            {!item.videoSrc && (
              <p className="mt-3 text-ink/55">
                Полноценный ролик появится на платформе позже. А пока — текстовые истории этого народа.
              </p>
            )}
            {culture && (
              <Link to={`/culture/${culture.slug}`} className="btn-navy mt-5">
                Истории народа «{cultureName(item.cultureSlug)}»
              </Link>
            )}
          </div>
        </div>
      </div>

      <ArticleFeedback slug={item.slug} />

      <Related related={related} />
    </div>
  )
}

export default function Story() {
  const { slug } = useParams()
  const item = getContent(slug)
  if (!item) return <NotFound />

  const culture = getCulture(item.cultureSlug)
  const related = relatedContent(item, 3)
  const isVideo = item.format === 'Видео' || item.format === 'Короткое'

  if (isVideo) return <VideoView item={item} culture={culture} related={related} />

  const html = getArticleHtml(slug)

  return (
    <article className="pb-10">
      {/* Шапка — на тёмном фоне, чтобы текст ниже фото оставался читаемым */}
      <header className="relative bg-navy text-cream">
        <div className="relative h-[44vh] min-h-[320px] w-full overflow-hidden sm:h-[56vh]">
          <img src={item.hero} alt={item.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-navy/10" />
        </div>
        <div className="wrap relative -mt-40 pb-12 sm:-mt-48">
          <div className="max-w-prose">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <FormatBadge format={item.format} soon={item.isPlaceholder} />
              {culture && (
                <Link
                  to={`/culture/${culture.slug}`}
                  className="chip text-cream"
                  style={{ backgroundColor: culture.accent }}
                >
                  {culture.name}
                </Link>
              )}
              {item.topics?.map((t) => (
                <span key={t} className="chip bg-cream/15 text-cream/90">{t}</span>
              ))}
            </div>
            <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-5xl">{item.title}</h1>
            {item.subtitle && <p className="mt-3 text-xl text-cream/80">{item.subtitle}</p>}
            <div className="mt-6 text-sm text-cream/70">
              <AuthorLinks item={item} size={28} dark />
              <div className="mt-2 text-cream/55">
                {authorsOf(item).length > 0 && `${BYLINE_NOTE} · `}
                {formatDate(item.date)} · {item.readingTime} мин чтения
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Тело */}
      <div className="wrap mt-10">
        <div className="article-body mx-auto max-w-prose" dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {/* Авторы материала */}
      {authorsOf(item).length > 0 && (
        <div className="wrap mt-12">
          <div className="mx-auto max-w-prose rounded-2xl bg-white p-6 shadow-card">
            <div className="eyebrow">{authorsOf(item).length > 1 ? 'Авторы материала' : 'Автор материала'}</div>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-8">
              {authorsOf(item).map((a) => (
                <Link key={a.slug} to={`/author/${a.slug}`} className="group flex items-center gap-3">
                  <AuthorAvatar author={a} size={48} />
                  <div>
                    <div className="font-display font-bold text-navy group-hover:text-teal">{a.name}</div>
                    <div className="text-xs text-ink/55">{a.role} · {a.followers} подписчиков</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <ArticleFeedback slug={item.slug} />

      <Related related={related} />
    </article>
  )
}
