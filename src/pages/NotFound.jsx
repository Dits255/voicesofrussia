import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="wrap grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <div className="font-display text-7xl font-extrabold text-navy/15">404</div>
        <h1 className="mt-4 font-display text-3xl font-bold text-navy">Такой страницы нет</h1>
        <p className="mt-3 text-ink/60">Возможно, история переехала или ещё не опубликована.</p>
        <div className="mt-7 flex justify-center gap-3">
          <Link to="/" className="btn-navy">На главную</Link>
          <Link to="/feed" className="btn-ghost">В ленту</Link>
        </div>
      </div>
    </div>
  )
}
