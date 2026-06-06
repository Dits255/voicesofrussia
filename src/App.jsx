import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './pages/Home'
import Feed from './pages/Feed'
import Cultures from './pages/Cultures'
import Culture from './pages/Culture'
import Story from './pages/Story'
import Author from './pages/Author'
import Authors from './pages/Authors'
import About from './pages/About'
import NotFound from './pages/NotFound'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [pathname, hash])
  return null
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
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <ScrollToTop />
      <Nav />
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page><Home /></Page>} />
            <Route path="/feed" element={<Page><Feed /></Page>} />
            <Route path="/cultures" element={<Page><Cultures /></Page>} />
            <Route path="/culture/:slug" element={<Page><Culture /></Page>} />
            <Route path="/story/:slug" element={<Page><Story /></Page>} />
            <Route path="/author/:slug" element={<Page><Author /></Page>} />
            <Route path="/authors" element={<Page><Authors /></Page>} />
            <Route path="/about" element={<Page><About /></Page>} />
            <Route path="*" element={<Page><NotFound /></Page>} />
          </Routes>
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  )
}
