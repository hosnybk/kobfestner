import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import MotionPage from '../components/MotionPage'
import bgHero from '../assets/home/bg_hero.jpg'
import testimonialsData from '../data/testimonials.json'
import homeContentData from '../data/homeContent.json'

export default function Home() {
  const { t, i18n } = useTranslation()
  const [heroParallaxY, setHeroParallaxY] = useState(0)
  type HomeCategoryKey = 'fenster' | 'tueren' | 'rolllaeden' | 'raffstore'
  const homeContent = homeContentData as {
    categories: HomeCategoryKey[]
    categoryImages: Record<HomeCategoryKey, string>
    showcase: string[]
  }
  const categories = homeContent.categories.map((key) => ({ key, image: homeContent.categoryImages[key] }))
  const showcaseImages = homeContent.showcase
  const locale = i18n.language.startsWith('en') ? 'en' : 'de'
  const testimonials = testimonialsData as Array<{ id: string; author: string; quote: { de: string; en: string } }>
  const getAuthorInitials = (author: string) =>
    author
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase()
  const iconTiles = [
    {
      id: 'fenster',
      label: t('home.categories.items.fenster.title'),
      href: '/products?category=fenster',
      icon: (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="16" rx="1.5" />
          <path d="M12 4v16M7.5 12h1M15.5 12h1" />
        </svg>
      )
    },
    {
      id: 'tueren',
      label: t('home.categories.items.tueren.title'),
      href: '/products?category=tueren',
      icon: (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 20V4h12v16M9 20h8" />
          <circle cx="14" cy="12" r="0.8" />
        </svg>
      )
    },
    {
      id: 'rolllaeden',
      label: t('home.categories.items.rolllaeden.title'),
      href: '/products?category=rolllaeden',
      icon: (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="5" width="16" height="14" rx="1.5" />
          <path d="M4 8h16M4 11h16M4 14h16M4 17h16" />
        </svg>
      )
    },
    {
      id: 'raffstore',
      label: t('home.categories.items.raffstore.title'),
      href: '/products?category=raffstore',
      icon: (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="5" y="4.5" width="14" height="15" rx="1.5" />
          <path d="M7 8h10M7 11h10M7 14h10M7 17h10" />
        </svg>
      )
    },
    {
      id: 'radiator',
      label: t('home.icons.radiator'),
      href: '/products',
      icon: (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="6" width="16" height="12" rx="1.5" />
          <path d="M8 8v8M11 8v8M14 8v8M17 8v8" />
        </svg>
      )
    },
    {
      id: 'double-window',
      label: t('home.icons.panorama'),
      href: '/products?category=fenster',
      icon: (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="M8.5 5v14M15.5 5v14M12 5v14" />
        </svg>
      )
    },
    {
      id: 'automation',
      label: t('home.icons.smartHome'),
      href: '/products',
      icon: (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="6" y="4.5" width="12" height="15" rx="1.5" />
          <path d="M12 9.5h.01M9.5 14.5h5" />
          <path d="M8.5 7.5l1 1M15.5 7.5l-1 1" />
        </svg>
      )
    },
    {
      id: 'blinds',
      label: t('home.icons.store'),
      href: '/products?category=rolllaeden',
      icon: (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 5h16M4 9h16M4 13h12M4 17h8" />
          <path d="M20 5v12" />
        </svg>
      )
    }
  ]

  useEffect(() => {
    const onScroll = () => {
      const nextValue = Math.min(window.scrollY * 0.2, 64)
      setHeroParallaxY(nextValue)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <MotionPage>
      <section className="relative overflow-hidden border-b border-neutral-200">
        <img
          src={bgHero}
          alt={t('home.hero.title')}
          className="absolute inset-0 h-[115%] w-full object-cover will-change-transform"
          style={{ transform: `translateY(-${heroParallaxY}px)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-white/65" />
        <div className="container relative py-16 sm:py-20 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                {t('home.hero.title')}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-neutral-700 sm:text-lg">
                {t('home.hero.subtitle')}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/products" className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-700 sm:text-base">
                  {t('home.hero.catalogButton')}
                </Link>
                <Link to="/contact" className="rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-neutral-100 sm:text-base">
                  {t('home.hero.quoteButton')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-10 sm:py-14 lg:py-16 space-y-14">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="py-1"
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {iconTiles.map((tile, index) => (
              <motion.article
                key={tile.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="group relative overflow-hidden rounded-sm border border-cyan-900 bg-cyan-800 text-white shadow-sm"
              >
                <Link to={tile.href} className="relative block">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-700 via-cyan-800 to-cyan-900" />
                  <motion.div
                    animate={{ y: [0, -2, 0], opacity: [0.9, 1, 0.9] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.1 }}
                    className="relative flex aspect-[5/3] w-full items-center justify-center"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded border border-white/25 bg-cyan-900/20">
                      {tile.icon}
                    </div>
                  </motion.div>
                  <p className="relative border-t border-cyan-500/50 bg-cyan-950/35 px-2 py-1.5 text-center text-[11px] font-semibold tracking-wide text-cyan-50">
                    {tile.label}
                  </p>
                  <span className="pointer-events-none absolute inset-x-2 top-2 rounded bg-black/45 px-1.5 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100">
                    {t('home.icons.hoverCatalog')}
                  </span>
                </Link>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <section className="space-y-5">
          <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">{t('home.categories.title')}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <article key={category.key} className="glass-surface group overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-lg">
                <img
                  src={category.image}
                  alt={t(`home.categories.items.${category.key}.title`)}
                  className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  onError={(event) => {
                    event.currentTarget.src = '/vite.svg'
                  }}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-neutral-900">{t(`home.categories.items.${category.key}.title`)}</h3>
                  <div className="mt-3 flex gap-2">
                    <Link to={`/products?category=${category.key}`} className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-700">
                      {t('home.categories.catalogLink')}
                    </Link>
                    <Link to={`/gallery?category=${category.key}`} className="glass-chip rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-800 transition hover:bg-white/70">
                      {t('home.categories.galleryLink')}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">{t('home.testimonials.title')}</h2>
            <div className="glass-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">G</span>
              <span className="text-xs font-semibold text-neutral-700">{t('home.testimonials.googleLabel')}</span>
              <span className="text-xs font-semibold tracking-wider text-amber-500">★★★★★</span>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.id} className="glass-surface rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700">
                      {getAuthorInitials(item.author)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{item.author}</p>
                      <p className="text-xs text-neutral-500">{t('home.testimonials.verified')}</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-blue-600">{t('home.testimonials.googleLabel')}</p>
                </div>
                <p className="mt-3 text-sm tracking-wide text-amber-500">★★★★★</p>
                <p className="mt-2 text-neutral-700">{item.quote[locale]}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-surface-strong rounded-3xl p-7 ring-1 ring-white/70 sm:p-10">
          <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">{t('home.cta.title')}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="glass-chip rounded-xl p-4">
              <p className="text-sm font-semibold text-neutral-500">{t('home.cta.addressLabel')}</p>
              <p className="mt-1 text-neutral-900">{t('home.cta.addressValue')}</p>
            </div>
            <div className="glass-chip rounded-xl p-4">
              <p className="text-sm font-semibold text-neutral-500">{t('home.cta.mailLabel')}</p>
              <a href="mailto:kontakt@kob-fenster.de" className="mt-1 inline-block text-neutral-900 hover:text-blue-700">
                kontakt@kob-fenster.de
              </a>
            </div>
            <div className="glass-chip rounded-xl p-4">
              <p className="text-sm font-semibold text-neutral-500">{t('home.cta.socialLabel')}</p>
              <div className="mt-1 flex gap-4 text-neutral-900">
                <a href="#" className="hover:text-blue-700">Facebook</a>
                <a href="#" className="hover:text-blue-700">Instagram</a>
                <a href="#" className="hover:text-blue-700">LinkedIn</a>
              </div>
            </div>
            <div className="glass-chip rounded-xl p-4">
              <p className="text-sm font-semibold text-neutral-500">{t('home.cta.hoursLabel')}</p>
              <p className="mt-1 text-neutral-900">{t('home.cta.hoursValue')}</p>
            </div>
          </div>
          <div className="glass-surface mt-6 overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between bg-neutral-50 px-4 py-3">
              <p className="text-sm font-semibold text-neutral-700">{t('home.map.title')}</p>
              <a
                href="https://maps.google.com/?q=Kranenstra%C3%9Fe+19,+65375+Oestrich-Winkel,+Germany"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-blue-700 hover:text-blue-800"
              >
                {t('home.map.openButton')}
              </a>
            </div>
            <iframe
              title={t('home.map.title')}
              src="https://www.google.com/maps?q=Kranenstra%C3%9Fe+19,+65375+Oestrich-Winkel,+Germany&output=embed"
              className="h-80 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">{t('home.showcase.title')}</h3>
              <Link to="/gallery" className="text-sm font-semibold text-cyan-700 hover:text-cyan-800">
                {t('home.showcase.button')}
              </Link>
            </div>
            <p className="mb-4 text-sm text-neutral-600">{t('home.showcase.subtitle')}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {showcaseImages.map((image, index) => (
                <Link key={`${image}-${index}`} to="/gallery" className="glass-surface overflow-hidden rounded-lg">
                  <img
                    src={image}
                    alt={t('home.showcase.title')}
                    className="h-24 w-full object-cover transition duration-300 hover:scale-105 sm:h-28"
                    onError={(event) => {
                      event.currentTarget.src = '/vite.svg'
                    }}
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </MotionPage>
  )
}
