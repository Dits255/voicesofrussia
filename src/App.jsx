import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import Nav from './components/Nav'
import Footer from './components/Footer'

const Home = lazy(() => import('./pages/Home'))
const Home2 = lazy(() => import('./pages/Home2'))
const Feed = lazy(() => import('./pages/Feed'))
const Cultures = lazy(() => import('./pages/Cultures'))
const Culture = lazy(() => import('./pages/Culture'))
const Story = lazy(() => import('./pages/Story'))
const Author = lazy(() => import('./pages/Author'))
const Authors = lazy(() => import('./pages/Authors'))
const About = lazy(() => import('./pages/About'))
const Subscriptions = lazy(() => import('./pages/Subscriptions'))
const Bookmarks = lazy(() => import('./pages/Bookmarks'))
const History = lazy(() => import('./pages/History'))
const Notifications = lazy(() => import('./pages/Notifications'))
const StudioAnalytics = lazy(() => import('./pages/StudioAnalytics'))
const StudioGuidelines = lazy(() => import('./pages/StudioGuidelines'))
const StudioAudience = lazy(() => import('./pages/StudioAudience'))
const NotFound = lazy(() => import('./pages/NotFound'))

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      const t = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 380)
      return () => clearTimeout(t)
    }
    window.scrollTo({ top: 0 })
  }, [pathname, hash])
  return null
}

// Скелетон, пока подгружается чанк страницы
function PageFallback() {
  return (
    <div className="wrap py-10">
      <div className="skeleton mb-3 h-4 w-28 rounded-full" />
      <div className="skeleton mb-10 h-11 w-72 max-w-full rounded-xl" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[16/10] rounded-xl" />
            <div className="skeleton mt-3 h-4 w-3/4 rounded-full" />
            <div className="skeleton mt-2 h-4 w-1/2 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

function Page({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  )
}

export default function App() {
  const location = useLocation()
  return (
    <AuthProvider>
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <ScrollToTop />
      <Nav />
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <Suspense key={location.pathname} fallback={<PageFallback />}>
            <Routes location={location}>
              <Route path="/" element={<Page><Home2 /></Page>} />
              <Route path="/home2" element={<Page><Home /></Page>} />
              <Route path="/feed" element={<Page><Feed /></Page>} />
              <Route path="/cultures" element={<Page><Cultures /></Page>} />
              <Route path="/culture/:slug" element={<Page><Culture /></Page>} />
              <Route path="/story/:slug" element={<Page><Story /></Page>} />
              <Route path="/author/:slug" element={<Page><Author /></Page>} />
              <Route path="/authors" element={<Page><Authors /></Page>} />
              <Route path="/about" element={<Page><About /></Page>} />
              <Route path="/subscriptions" element={<Page><Subscriptions /></Page>} />
              <Route path="/bookmarks" element={<Page><Bookmarks /></Page>} />
              <Route path="/history" element={<Page><History /></Page>} />
              <Route path="/notifications" element={<Page><Notifications /></Page>} />
              <Route path="/studio" element={<Page><Authors /></Page>} />
              <Route path="/studio/analytics" element={<Page><StudioAnalytics /></Page>} />
              <Route path="/studio/guidelines" element={<Page><StudioGuidelines /></Page>} />
              <Route path="/studio/audience" element={<Page><StudioAudience /></Page>} />
              <Route path="*" element={<Page><NotFound /></Page>} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </div>
      <Footer />
    </div>
    </AuthProvider>
  )
}
