import MotionPage from '../components/MotionPage'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { fetchCategories, fetchGallery } from '../lib/api'

export default function Gallery() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategory = (searchParams.get('category') || '').toLowerCase()
  const [projects, setProjects] = useState<Array<{ id: number; category: string; image: string }>>([])
  const [visibleCount, setVisibleCount] = useState(9)
  const [categories, setCategories] = useState<string[]>([])
  useEffect(() => {
    let alive = true

    const refresh = async () => {
      try {
        const [items, cats] = await Promise.all([fetchGallery(), fetchCategories()])
        if (!alive) return
        setProjects(items || [])
        if (cats?.length) setCategories(cats)
      } catch {
        void 0
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh()
    }

    refresh()

    let ch: BroadcastChannel | null = null
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        ch = new BroadcastChannel('kobfenster-updates')
        ch.onmessage = () => refresh()
      }
    } catch {
      ch = null
    }

    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', onVisibility)
    const id = window.setInterval(refresh, 60_000)

    return () => {
      alive = false
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', onVisibility)
      window.clearInterval(id)
      try {
        ch?.close()
      } catch {
        void 0
      }
    }
  }, [])
  const activeCategory = categories.includes(selectedCategory) ? selectedCategory : 'all'
  const filteredProjects = useMemo(() => projects.filter((project) => activeCategory === 'all' || project.category === activeCategory), [projects, activeCategory])
  const visibleProjects = filteredProjects.slice(0, visibleCount)

  const selectCategory = (category: string) => {
    setVisibleCount(9)
    if (category === 'all') {
      setSearchParams({})
      return
    }
    setSearchParams({ category })
  }

  return (
    <MotionPage>
      <div className="container py-10 sm:py-14 space-y-8">
        <section className="glass-surface-strong rounded-3xl p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">{t('galleryPage.badge')}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">{t('galleryPage.title')}</h1>
          <p className="mt-3 max-w-3xl text-neutral-700">{t('galleryPage.subtitle')}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {(['all', ...categories] as string[]).map((category) => (
              <button
                key={category}
                type="button"
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  activeCategory === category
                    ? 'border-cyan-300 bg-cyan-600 text-white'
                    : 'glass-chip text-neutral-700 hover:bg-white/70'
                }`}
                onClick={() => selectCategory(category)}
              >
                {t(`galleryPage.filters.${category}`) || t(`catalog.filters.${category}`) || category}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {visibleProjects.map((project) => (
            <article key={project.id} className="glass-surface group overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-lg">
              <img
                src={project.image}
                alt={t(`galleryPage.items.${project.id}.title`) || project.category}
                className="h-52 w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = '/vite.svg'
                }}
              />
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">{t(`galleryPage.items.${project.id}.city`) || project.category}</p>
                <h2 className="mt-1 text-lg font-semibold text-neutral-900">{t(`galleryPage.items.${project.id}.title`) || t(`catalog.filters.${project.category}`) || project.category}</h2>
                <p className="mt-2 text-sm text-neutral-700">{t(`galleryPage.items.${project.id}.description`) || ''}</p>
              </div>
            </article>
          ))}
        </section>
        {filteredProjects.length === 0 && (
          <p className="text-center text-neutral-600">{t('galleryPage.noProjects')}</p>
        )}
        {visibleCount < filteredProjects.length && (
          <div className="text-center">
            <button
              className="glass-chip rounded-lg px-5 py-2 text-sm font-semibold"
              onClick={() => setVisibleCount((n) => n + 9)}
            >
              {t('galleryPage.loadMore')}
            </button>
          </div>
        )}

        <section className="glass-surface rounded-2xl p-6 text-center">
          <h3 className="text-2xl font-semibold text-neutral-900">{t('galleryPage.cta.title')}</h3>
          <p className="mt-2 text-neutral-700">{t('galleryPage.cta.subtitle')}</p>
          <a href="/contact" className="mt-4 inline-flex rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700">
            {t('galleryPage.cta.button')}
          </a>
        </section>
      </div>
    </MotionPage>
  )
}
