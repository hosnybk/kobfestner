import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import HTMLFlipBook from 'react-pageflip'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = pdfWorker

export default function CatalogFlipbook() {
  const { t, i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const title = searchParams.get('title') || t('catalogViewer.defaultTitle')
  const pdf = searchParams.get('pdf') || '/catalogs/Katalog_Eingangsturen-Despiro_DE.pdf'
  const [pages, setPages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBackgroundPreloading, setIsBackgroundPreloading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState({ done: 0, total: 0 })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'reader' | 'flipbook'>('reader')
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(1)
  const flipBookRef = useRef<{
    pageFlip: () => {
      flipNext: () => void
      flipPrev: () => void
      flip: (page: number) => void
    }
  } | null>(null)

  useEffect(() => {
    let isActive = true

    const renderPdfPages = async () => {
      try {
        setIsLoading(true)
        setIsBackgroundPreloading(false)
        setErrorMessage(null)
        setPages([])
        const loadingTask = getDocument(pdf)
        const loadedPdf = await loadingTask.promise
        const renderedPages: string[] = []
        if (isActive) setLoadingProgress({ done: 0, total: loadedPdf.numPages })

        const eagerPageCount = Math.min(2, loadedPdf.numPages)

        for (let pageIndex = 1; pageIndex <= eagerPageCount; pageIndex += 1) {
          const page = await loadedPdf.getPage(pageIndex)
          const viewport = page.getViewport({ scale: 1.35 })
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          if (!context) continue
          canvas.width = viewport.width
          canvas.height = viewport.height
          await page.render({ canvasContext: context, canvas, viewport }).promise
          renderedPages.push(canvas.toDataURL('image/jpeg', 0.92))
          if (isActive) {
            setPages([...renderedPages])
            setLoadingProgress({ done: pageIndex, total: loadedPdf.numPages })
          }
        }

        if (isActive) {
          setCurrentPage(1)
          setZoom(1)
          setIsLoading(false)
          if (eagerPageCount < loadedPdf.numPages) {
            setIsBackgroundPreloading(true)
          }
        }

        for (let pageIndex = eagerPageCount + 1; pageIndex <= loadedPdf.numPages; pageIndex += 1) {
          const page = await loadedPdf.getPage(pageIndex)
          const viewport = page.getViewport({ scale: 1.35 })
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          if (!context) continue
          canvas.width = viewport.width
          canvas.height = viewport.height
          await page.render({ canvasContext: context, canvas, viewport }).promise
          renderedPages.push(canvas.toDataURL('image/jpeg', 0.92))
          if (isActive) {
            setPages([...renderedPages])
            setLoadingProgress({ done: pageIndex, total: loadedPdf.numPages })
          }
          await new Promise<void>((resolve) => {
            window.setTimeout(() => resolve(), 0)
          })
        }

        if (isActive) {
          setIsBackgroundPreloading(false)
          setLoadingProgress({ done: loadedPdf.numPages, total: loadedPdf.numPages })
        }
      } catch {
        if (isActive) setErrorMessage(i18n.t('catalogViewer.error'))
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    renderPdfPages()
    return () => {
      isActive = false
    }
  }, [pdf, i18n, i18n.language])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        if (viewMode === 'flipbook') {
          flipBookRef.current?.pageFlip()?.flipNext()
          return
        }
        setCurrentPage((value) => Math.min(value + 1, pages.length))
      }
      if (event.key === 'ArrowLeft') {
        if (viewMode === 'flipbook') {
          flipBookRef.current?.pageFlip()?.flipPrev()
          return
        }
        setCurrentPage((value) => Math.max(value - 1, 1))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [pages.length, viewMode])

  const activeImage = pages[currentPage - 1]

  return (
    <div className="min-h-dvh bg-neutral-950 px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 rounded-2xl border border-neutral-700 bg-neutral-900/90 p-3 shadow-sm sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-lg font-semibold text-white sm:text-2xl">{title}</h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('reader')}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  viewMode === 'reader' ? 'bg-cyan-600 text-white' : 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700'
                }`}
              >
                {t('catalogViewer.modes.reader')}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('flipbook')}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  viewMode === 'flipbook' ? 'bg-cyan-600 text-white' : 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700'
                }`}
              >
                {t('catalogViewer.modes.flipbook')}
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-700 pt-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (viewMode === 'flipbook') {
                    flipBookRef.current?.pageFlip()?.flipPrev()
                    return
                  }
                  setCurrentPage((value) => Math.max(value - 1, 1))
                }}
                className="rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-100 transition hover:bg-neutral-700"
              >
                {'<'}
              </button>
              <span className="min-w-28 text-center text-sm text-neutral-200">
                {t('catalogViewer.page', { current: currentPage, total: Math.max(pages.length, 1) })}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (viewMode === 'flipbook') {
                    flipBookRef.current?.pageFlip()?.flipNext()
                    return
                  }
                  setCurrentPage((value) => Math.min(value + 1, pages.length))
                }}
                className="rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-100 transition hover:bg-neutral-700"
              >
                {'>'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((value) => Math.max(0.8, Number((value - 0.1).toFixed(1))))}
                className="rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-100 transition hover:bg-neutral-700"
              >
                -
              </button>
              <span className="w-14 text-center text-sm text-neutral-200">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom((value) => Math.min(2, Number((value + 0.1).toFixed(1))))}
                className="rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-100 transition hover:bg-neutral-700"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-3">
            <a
              href={pdf}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-100 transition hover:bg-neutral-700"
            >
              {t('catalogViewer.openPdf')}
            </a>
            {!isLoading && !errorMessage && isBackgroundPreloading && (
              <span className="ml-2 inline-flex rounded-lg border border-cyan-700 bg-cyan-900/30 px-3 py-2 text-sm font-medium text-cyan-100">
                {`${t('catalogViewer.loading')} (${loadingProgress.done}/${loadingProgress.total})`}
              </span>
            )}
          </div>
        </div>

        <div className="flex min-h-[80vh] items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-900 p-3 shadow-[0_30px_90px_rgba(0,0,0,0.55)] sm:p-6">
          {isLoading && (
            <p className="text-sm text-neutral-200">
              {loadingProgress.total > 0
                ? `${t('catalogViewer.loading')} (${loadingProgress.done}/${loadingProgress.total})`
                : t('catalogViewer.loading')}
            </p>
          )}
          {!isLoading && errorMessage && <p className="text-sm text-red-300">{errorMessage}</p>}

          {!isLoading && !errorMessage && pages.length > 0 && viewMode === 'reader' && (
            <div className="h-[78vh] w-full overflow-auto rounded-xl bg-neutral-800 p-3 sm:p-6">
              <div className="mx-auto w-fit rounded-md bg-white shadow-2xl" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
                {activeImage && <img src={activeImage} alt={`Page ${currentPage}`} className="h-auto max-w-full object-contain" />}
              </div>
            </div>
          )}

          {!isLoading && !errorMessage && pages.length > 0 && viewMode === 'flipbook' && (
            <div className="mx-auto max-w-5xl">
              <HTMLFlipBook
                ref={flipBookRef}
                style={{}}
                width={520}
                height={735}
                minWidth={280}
                maxWidth={1100}
                minHeight={420}
                maxHeight={820}
                startPage={Math.max(currentPage - 1, 0)}
                size="stretch"
                drawShadow
                startZIndex={0}
                autoSize
                maxShadowOpacity={0.4}
                showCover
                flippingTime={850}
                usePortrait
                mobileScrollSupport
                clickEventForward
                useMouseEvents
                swipeDistance={30}
                showPageCorners
                disableFlipByClick={false}
                className="mx-auto"
                onFlip={(event: { data: number }) => setCurrentPage(event.data + 1)}
              >
                {pages.map((pageImage, index) => (
                  <div key={`${pageImage}-${index}`} className="h-full w-full bg-white">
                    <img src={pageImage} alt={`Page ${index + 1}`} className="h-full w-full object-contain" />
                  </div>
                ))}
              </HTMLFlipBook>
            </div>
          )}
        </div>

        {!isLoading && !errorMessage && pages.length > 0 && (
          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto rounded-xl border border-neutral-700 bg-neutral-900 p-2">
            {pages.map((pageImage, index) => (
              <button
                key={`thumb-${index + 1}`}
                type="button"
                onClick={() => {
                  setCurrentPage(index + 1)
                  if (viewMode === 'flipbook') {
                    flipBookRef.current?.pageFlip()?.flip(index)
                  }
                }}
                className={`shrink-0 overflow-hidden rounded-md border-2 transition ${
                  currentPage === index + 1 ? 'border-cyan-500' : 'border-neutral-700 hover:border-neutral-500'
                }`}
              >
                <img src={pageImage} alt={t('catalogViewer.thumbnailAlt', { page: index + 1 })} className="h-20 w-14 object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
