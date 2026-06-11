# Голоса России

Фронтенд мультимедийной платформы, где представители народов России рассказывают о себе сами.

## Запуск

```bash
npm install
npm run convert   # .docx из папки «статьи» -> HTML + картинки (уже выполнено)
npm run dev       # http://localhost:5173
npm run build     # прод-сборка в dist/
```

## Структура

- `статьи/` — исходные .docx (не трогаются)
- `scripts/convert-articles.mjs` — конвертация docx → `src/content/<slug>/index.html` + `public/articles/<slug>/` (картинки) + `meta.json`
- `src/data/` — mock-данные: `cultures.json` (9 народов), `authors.json` (6 авторов), `content.json` (12 статей + 3 видео-плейсхолдера)
- `src/lib/data.js` — доступ к данным, таксономии форматов/тем, загрузка тел статей
- `src/components/` — Nav, Footer, карточки (VoiceCard / ContentCard / CultureCard), ui
- `src/pages/` — Home, Feed, Culture, Author, Story, About, NotFound

## Контент

Сейчас реальный контент — 12 текстовых статей. Видео — **фейковые плейсхолдеры**
(`isPlaceholder: true` в `content.json`, помечены бейджем «скоро»). 

Палитра: navy `#1A3A5C` · cream `#FAF8F4` · teal `#028090` · clay `#E07A5F`.
Шрифты: Unbounded (заголовки) + Geist (текст).
