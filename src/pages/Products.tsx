import MotionPage from '../components/MotionPage'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { catalogProducts as fallbackProducts, type CatalogProduct } from '../data/catalogProducts'
import { pdfCatalogs } from '../data/pdfCatalogs'
import { fetchProducts, fetchCategories } from '../lib/api'

const demoImage = '/vite.svg'

export default function Products() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategory = (searchParams.get('category') || '').toLowerCase()
  const [categories, setCategories] = useState<string[]>(['fenster', 'tueren', 'rolllaeden', 'raffstore'])
  const activeCategory = categories.includes(selectedCategory) ? selectedCategory : 'all'
  const [page, setPage] = useState(1)
  const [isCatalogAutoScrollPaused, setIsCatalogAutoScrollPaused] = useState(false)
  const itemsPerPage = 6
  const catalogSliderRef = useRef<HTMLDivElement | null>(null)

  const [allProducts, setAllProducts] = useState<CatalogProduct[]>(fallbackProducts.map((p) => ({ ...p, image: demoImage })))
  useEffect(() => {
    let alive = true

    const refresh = async () => {
      try {
        const [cats, items] = await Promise.all([fetchCategories(), fetchProducts()])
        if (!alive) return
        if (Array.isArray(cats) && cats.length) setCategories(cats)
        setAllProducts(items)
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
  const filteredProducts = useMemo(
    () => allProducts.filter((product) => activeCategory === 'all' || product.category === activeCategory),
    [activeCategory, allProducts]
  )
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage))
  const currentPageItems = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const [activeProduct, setActiveProduct] = useState<CatalogProduct | null>(null)

  const selectCategory = (category: string) => {
    setPage(1)
    if (category === 'all') {
      setSearchParams({})
      return
    }
    setSearchParams({ category })
  }

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return
    setPage(nextPage)
  }

  const openCatalogViewer = (title: string, pdf: string) => {
    const params = new URLSearchParams({
      title,
      pdf
    })
    window.open(`/catalog-flipbook?${params.toString()}`, '_blank', 'noopener,noreferrer')
  }

  const slideCatalogs = (direction: 'left' | 'right') => {
    if (!catalogSliderRef.current) return
    const step = 220
    catalogSliderRef.current.scrollBy({
      left: direction === 'right' ? step : -step,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    const slider = catalogSliderRef.current
    if (!slider || isCatalogAutoScrollPaused) return

    const intervalId = window.setInterval(() => {
      const nearEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 6
      if (nearEnd) {
        slider.scrollTo({ left: 0, behavior: 'smooth' })
        return
      }
      slider.scrollBy({ left: 180, behavior: 'smooth' })
    }, 2200)

    return () => window.clearInterval(intervalId)
  }, [isCatalogAutoScrollPaused])

  return (
    <MotionPage>
      <div className="container py-10 sm:py-14 space-y-8">
        <section className="glass-surface-strong rounded-3xl p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">{t('catalog.badge')}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">{t('catalog.title')}</h1>
          <p className="mt-3 max-w-3xl text-neutral-700">{t('catalog.subtitle')}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => (
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
                {t(`catalog.filters.${category}`) || category}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">{t('catalog.cataloguesTitle')}</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => slideCatalogs('left')}
                className="glass-chip inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-700 transition hover:bg-white/70"
              >
                {'<'}
              </button>
              <button
                type="button"
                onClick={() => slideCatalogs('right')}
                className="glass-chip inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-700 transition hover:bg-white/70"
              >
                {'>'}
              </button>
            </div>
          </div>
          <div
            ref={catalogSliderRef}
            className="no-scrollbar flex gap-3 overflow-x-auto pb-2"
            onMouseEnter={() => setIsCatalogAutoScrollPaused(true)}
            onMouseLeave={() => setIsCatalogAutoScrollPaused(false)}
          >
            {pdfCatalogs.map((catalog) => (
              <button
                key={catalog.id}
                type="button"
                className="glass-surface group w-44 shrink-0 overflow-hidden rounded-xl text-left transition hover:-translate-y-1 hover:shadow-lg"
                onClick={() => openCatalogViewer(catalog.title, catalog.pdf)}
              >
                <div className="relative">
                  <img
                    src={catalog.cover}
                    alt={catalog.title}
                    className="h-28 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = '/vite.svg'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/35 via-transparent to-transparent" />
                </div>
                <div className="p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-600">{t('catalog.pdfTag')}</p>
                  <h3 className="mt-1 text-sm font-semibold text-neutral-900">{catalog.title}</h3>
                  <p className="mt-1 min-h-8 text-xs text-neutral-700">{catalog.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {currentPageItems.map((product) => (
            <article
              key={product.id}
              className="group relative glass-surface overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-lg"
              role="button"
              tabIndex={0}
              onClick={() => setActiveProduct(product)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setActiveProduct(product)
                }
              }}
            >
              <img
                src={product.image}
                alt={`${t(`catalog.filters.${product.category}`)} ${product.model}`}
                className="h-40 w-full object-cover bg-neutral-950/90"
                onError={(event) => {
                  event.currentTarget.src = '/vite.svg'
                }}
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-neutral-900">{t('catalog.model')} {product.model}</h2>
                <div className="mt-2 space-y-1 text-sm text-neutral-700">
                  <p><span className="font-medium text-neutral-900">{t('catalog.specs.color')}:</span> {product.color}</p>
                  <p><span className="font-medium text-neutral-900">{t('catalog.specs.glazing')}:</span> {product.glazing}</p>
                  <p><span className="font-medium text-neutral-900">{t('catalog.specs.application')}:</span> {product.application}</p>
                  <p><span className="font-medium text-neutral-900">{t('catalog.specs.handle')}:</span> {product.handle}</p>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-neutral-950/75 via-neutral-950/0 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <div className="w-full p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="glass-chip pointer-events-auto inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-900">
                      <span>{t('catalog.model')} {product.model}</span>
                      <span className="mx-1">•</span>
                      <span>{product.application}</span>
                      <span className="mx-1">•</span>
                      <span>{product.glazing}</span>
                    </div>
                    <button
                      type="button"
                      className="glass-chip pointer-events-auto rounded-xl px-3 py-2 text-xs font-semibold text-neutral-900 hover:bg-white/80"
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveProduct(product)
                      }}
                    >
                      {t('catalog.viewDatasheet')}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="flex items-center justify-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
          >
            {'<'}
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
                pageNumber === page ? 'bg-cyan-600 text-white' : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
              }`}
              onClick={() => goToPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
          >
            {'>'}
          </button>
        </section>

        {activeProduct && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setActiveProduct(null)}>
            <article
              className="glass-surface max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`${t('catalog.model')} ${activeProduct.model}`}
            >
              <div className="flex items-center justify-between border-b border-white/70 px-4 py-3">
                <h3 className="text-lg font-semibold text-neutral-900">{t('catalog.model')} {activeProduct.model}</h3>
                <button type="button" className="glass-chip rounded-lg px-3 py-1 text-sm font-semibold" onClick={() => setActiveProduct(null)}>
                  Close
                </button>
              </div>
              <div className="grid gap-0 md:grid-cols-2">
                <div className="bg-neutral-950/90 p-3 md:p-4">
                  <img
                    src={activeProduct.image}
                    alt={`${t(`catalog.filters.${activeProduct.category}`)} ${activeProduct.model}`}
                    className="h-80 w-full rounded-lg object-cover"
                  />
                </div>
                <div className="space-y-3 p-4">
                  <div className="rounded-xl bg-white/70 p-3">
                    <p className="text-sm text-neutral-700">
                      <span className="font-medium text-neutral-900">{t('catalog.specs.color')}:</span> {activeProduct.color}
                    </p>
                    <p className="text-sm text-neutral-700">
                      <span className="font-medium text-neutral-900">{t('catalog.specs.glazing')}:</span> {activeProduct.glazing}
                    </p>
                    <p className="text-sm text-neutral-700">
                      <span className="font-medium text-neutral-900">{t('catalog.specs.application')}:</span> {activeProduct.application}
                    </p>
                    <p className="text-sm text-neutral-700">
                      <span className="font-medium text-neutral-900">{t('catalog.specs.handle')}:</span> {activeProduct.handle}
                    </p>
                  </div>
                  {activeProduct.datasheet ? (
                    <div className="rounded-xl bg-white/70 p-3">
                      <img src={activeProduct.datasheet} alt="Datasheet" className="h-64 w-full rounded-lg object-contain" />
                    </div>
                  ) : (
                    <div className="rounded-xl bg-white/70 p-3 text-sm text-neutral-700">
                      <p>Datasheet not available. Contact us for a detailed technical sheet.</p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          </div>
        )}
      </div>
    </MotionPage>
  )
}
