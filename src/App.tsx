import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Home from './pages/Home.tsx'
import About from './pages/About.tsx'
import Products from './pages/Products.tsx'
import Gallery from './pages/Gallery.tsx'
import Contact from './pages/Contact.tsx'
import CatalogFlipbook from './pages/CatalogFlipbook.tsx'
import AdminDashboard from './pages/AdminDashboard.tsx'
import Admin from './pages/Admin.tsx'
import logoKob from './assets/logo_KOB.svg'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './components/LanguageSwitcher.tsx'
import { AnimatePresence } from 'framer-motion'

function App() {
  const { t } = useTranslation()
  const phoneNumber = '+49 172 9813603'
  const phoneHref = 'tel:+491729813603'
  const location = useLocation()
  const isCatalogViewer = location.pathname === '/catalog-flipbook'
  const isAdminPage = location.pathname.startsWith('/admin')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 font-medium transition-colors ${
      isActive
        ? 'glass-chip text-cyan-700'
        : 'text-neutral-700 hover:glass-chip hover:text-neutral-900'
    }`

  return (
    <div className="min-h-dvh flex flex-col">
      {!isCatalogViewer && !isAdminPage && <header className="sticky top-0 z-50 border-b border-white/55 bg-white/55 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/45">
        <nav className="container flex items-center justify-between py-3 min-h-20">
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            <img src={logoKob} alt={t('brand')} className="h-12 w-auto sm:h-20 md:h-24" />
          </Link>

          <button
            type="button"
            aria-label={t('nav.menuToggle')}
            className="glass-surface md:hidden inline-flex h-12 w-12 items-center justify-center rounded-xl text-neutral-800 transition hover:-translate-y-0.5"
            onClick={() => setIsMobileMenuOpen((value) => !value)}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              {isMobileMenuOpen ? <path d="M6 6l12 12M18 6l-12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>

          <div className="hidden md:flex items-center gap-2 text-base lg:text-lg">
            <NavLink to="/" className={navLinkClass}>{t('nav.home')}</NavLink>
            <NavLink to="/about" className={navLinkClass}>{t('nav.about')}</NavLink>
            <NavLink to="/products" className={navLinkClass}>{t('nav.products')}</NavLink>
            <NavLink to="/gallery" className={navLinkClass}>{t('nav.gallery')}</NavLink>
            <NavLink to="/contact" className={navLinkClass}>{t('nav.contact')}</NavLink>
            <a
              href={phoneHref}
              title={`${t('nav.call')} ${phoneNumber}`}
              aria-label={`${t('nav.call')} ${phoneNumber}`}
              className="glass-chip inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-cyan-800 transition hover:-translate-y-0.5"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.62a2 2 0 0 1-.45 2.11L8 9.95a16 16 0 0 0 6 6l1.5-1.28a2 2 0 0 1 2.11-.45c.84.29 1.72.5 2.62.62A2 2 0 0 1 22 16.92z" />
              </svg>
              <span className="hidden lg:inline">{phoneNumber}</span>
            </a>
            <LanguageSwitcher />
          </div>
        </nav>

        {isMobileMenuOpen && (
          <div className="container md:hidden pb-4">
            <div className="glass-surface rounded-2xl p-3 shadow-lg flex flex-col gap-2 text-lg" onClick={() => setIsMobileMenuOpen(false)}>
              <NavLink to="/" className={navLinkClass}>{t('nav.home')}</NavLink>
              <NavLink to="/about" className={navLinkClass}>{t('nav.about')}</NavLink>
              <NavLink to="/products" className={navLinkClass}>{t('nav.products')}</NavLink>
              <NavLink to="/gallery" className={navLinkClass}>{t('nav.gallery')}</NavLink>
              <NavLink to="/contact" className={navLinkClass}>{t('nav.contact')}</NavLink>
              <a
                href={phoneHref}
                className="glass-chip inline-flex items-center gap-2 rounded-lg px-3 py-2 text-base font-semibold text-cyan-800"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.62a2 2 0 0 1-.45 2.11L8 9.95a16 16 0 0 0 6 6l1.5-1.28a2 2 0 0 1 2.11-.45c.84.29 1.72.5 2.62.62A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>{phoneNumber}</span>
              </a>
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </header>}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/catalog-flipbook" element={<CatalogFlipbook />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isCatalogViewer && !isAdminPage && <footer className="mt-10 border-t border-white/55 bg-white/45 backdrop-blur-md supports-[backdrop-filter]:bg-white/35">
        <div className="container py-10 sm:py-12">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200/70 pb-6">
            <h2 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-5xl">{t('footer.ctaTitle')}</h2>
            <Link
              to="/contact"
              className="glass-chip rounded-md px-5 py-3 text-sm font-semibold text-cyan-900 transition hover:bg-white/80"
            >
              {t('footer.ctaButton')}
            </Link>
          </div>

          <div className="grid gap-8 py-7 md:grid-cols-4 text-neutral-900">
            <div>
              <div className="flex items-center gap-2">
                <img src={logoKob} alt={t('brand')} className="h-10 w-auto" />
                <span className="text-lg font-semibold text-neutral-900">{t('brand')}</span>
              </div>
              <p className="mt-3 max-w-56 text-sm text-neutral-600">{t('footer.tagline')}</p>
              <div className="mt-4 flex items-center gap-2">
                <a href="#" aria-label="Facebook" className="glass-chip inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-800 hover:bg-white/80">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                    <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.19 8.44 9.94v-7.03H8.1v-2.9h2.34V9.41c0-2.31 1.37-3.58 3.47-3.58.99 0 2.03.18 2.03.18v2.24h-1.14c-1.12 0-1.47.7-1.47 1.41v1.69h2.5l-.4 2.9h-2.1V22c4.78-.75 8.44-4.92 8.44-9.94Z" />
                  </svg>
                </a>
                <a href="#" aria-label="Instagram" className="glass-chip inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-800 hover:bg-white/80">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                    <rect x="3" y="3" width="18" height="18" rx="4" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
                  </svg>
                </a>
                <a href="#" aria-label="LinkedIn" className="glass-chip inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-800 hover:bg-white/80">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                    <path d="M20.45 3H3.55A1.55 1.55 0 0 0 2 4.55v14.9C2 20.85 3.15 22 4.55 22h15.9c1.4 0 2.55-1.15 2.55-2.55V4.55C23 3.15 21.85 2 20.45 2ZM8.34 18.34H5.66V9.66h2.68v8.68ZM7 8.53A1.66 1.66 0 1 1 7 5.2a1.66 1.66 0 0 1 0 3.33Zm11.34 9.81h-2.67v-4.7c0-1.12-.02-2.56-1.56-2.56-1.56 0-1.8 1.22-1.8 2.48v4.78H8.64V9.66h2.56v1.18h.04c.36-.68 1.26-1.4 2.6-1.4 2.78 0 3.5 1.83 3.5 4.21v4.69Z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900">{t('footer.quickLinks')}</h3>
              <div className="mt-3 flex flex-col gap-2 text-sm text-neutral-700">
                <Link to="/" className="transition hover:text-neutral-900">{t('nav.home')}</Link>
                <Link to="/about" className="transition hover:text-neutral-900">{t('nav.about')}</Link>
                <Link to="/products" className="transition hover:text-neutral-900">{t('nav.products')}</Link>
                <Link to="/gallery" className="transition hover:text-neutral-900">{t('nav.gallery')}</Link>
                {import.meta.env.DEV && (
                  <Link to="/admin" className="transition hover:text-neutral-900">Admin</Link>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900">{t('nav.contact')}</h3>
              <div className="mt-3 space-y-2 text-sm text-neutral-700">
                <p>kontakt@kob-fenster.de</p>
                <p>+49 172 9813603</p>
                <p>Kranenstraße 19, 65375 Oestrich-Winkel</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900">{t('footer.latestNews')}</h3>
              <label className="mt-4 flex items-center gap-3 border-b border-neutral-300 pb-2">
                <input
                  type="email"
                  placeholder={t('footer.emailPlaceholder')}
                  className="w-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
                />
                <span aria-hidden className="text-lg leading-none">→</span>
              </label>
            </div>
          </div>

          <div className="border-t border-neutral-200/70 pt-5 text-center text-sm text-neutral-700">
            <span>Copyright © {new Date().getFullYear()} KOB Fenster. </span>
            <span>{t('footer.madeByPrefix')} Reflect IT </span>
            <span aria-hidden className="align-middle text-pink-500">♥</span>
            <span> {t('footer.madeBySuffix')}</span>
          </div>
        </div>
      </footer>}
    </div>
  )
}

export default App
