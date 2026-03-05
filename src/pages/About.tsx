import MotionPage from '../components/MotionPage'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import aboutImage1 from '../assets/about/about-1.png'
import aboutImage2 from '../assets/about/about-2.webp'
import aboutImage3 from '../assets/about/about-3.webp'
import aboutImage4 from '../assets/about/about-4.webp'
import serviceImage from '../assets/services/service-img.png'

export default function About() {
  const { t, i18n } = useTranslation()
  const highlights = ['quality', 'custom', 'delivery'] as const
  const stats = ['experience', 'projects', 'rating'] as const
  const tabs = ['withUs', 'technology', 'newProducts'] as const
  const serviceItems = [
    { id: 'custom', side: 'left' },
    { id: 'door', side: 'left' },
    { id: 'energy', side: 'left' },
    { id: 'repair', side: 'right' },
    { id: 'consulting', side: 'right' },
    { id: 'commercial', side: 'right' }
  ] as const
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('withUs')
  const aboutImages = [aboutImage1, aboutImage2, aboutImage3, aboutImage4]
  const [activeAboutImageIndex, setActiveAboutImageIndex] = useState(0)
  const statsRef = useRef<HTMLDivElement | null>(null)
  const [startStatsAnimation, setStartStatsAnimation] = useState(false)
  const [animatedStats, setAnimatedStats] = useState({
    experience: 0,
    projects: 0,
    rating: 0
  })
  const isEnglish = i18n.language.startsWith('en')

  useEffect(() => {
    const node = statsRef.current
    if (!node || startStatsAnimation) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartStatsAnimation(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [startStatsAnimation])

  useEffect(() => {
    if (!startStatsAnimation) return
    const duration = 1300
    const startTime = performance.now()
    let frameId = 0

    const animate = (now: number) => {
      const rawProgress = Math.min((now - startTime) / duration, 1)
      const easedProgress = 1 - (1 - rawProgress) ** 3
      setAnimatedStats({
        experience: 10 * easedProgress,
        projects: 300 * easedProgress,
        rating: 4.9 * easedProgress
      })
      if (rawProgress < 1) frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [startStatsAnimation])

  const formatStatValue = (stat: (typeof stats)[number]) => {
    if (stat === 'experience') {
      return `${Math.round(animatedStats.experience)}+ ${isEnglish ? 'Years' : 'Jahre'}`
    }
    if (stat === 'projects') {
      return `${Math.round(animatedStats.projects)}+`
    }
    return `${animatedStats.rating.toFixed(1)}/5`
  }

  return (
    <MotionPage>
      <div className="container py-10 sm:py-14 space-y-8">
        <section className="glass-surface-strong rounded-2xl p-4 sm:p-6 lg:p-7">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="glass-surface rounded-xl p-4 sm:p-5">
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">{t('about.hero.title')}</h1>
              <p className="mt-2 text-neutral-700">{t('about.hero.subtitle')}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {highlights.map((item) => (
                  <span key={item} className="glass-chip rounded-full px-3 py-1 text-sm font-medium text-neutral-800">
                    {t(`about.hero.highlights.${item}`)}
                  </span>
                ))}
              </div>
              <div ref={statsRef} className="mt-4 grid gap-3 sm:grid-cols-3">
                {stats.map((item) => (
                  <article key={item} className="glass-surface rounded-xl p-3">
                    <p className="text-2xl font-bold text-cyan-600">{formatStatValue(item)}</p>
                    <p className="text-sm text-neutral-700">{t(`about.hero.stats.${item}.label`)}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="glass-surface rounded-xl p-3 shadow-sm">
              <img src={aboutImages[activeAboutImageIndex]} alt={t('about.hero.title')} className="h-64 w-full rounded-lg object-cover sm:h-72" />
              <div className="mt-3 grid grid-cols-4 gap-2">
                {aboutImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={`overflow-hidden rounded-md border-2 transition ${
                      activeAboutImageIndex === index ? 'border-cyan-500' : 'border-cyan-200 hover:border-cyan-300'
                    }`}
                    onClick={() => setActiveAboutImageIndex(index)}
                  >
                    <img src={image} alt={`${t('about.hero.title')} ${index + 1}`} className="h-16 w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="glass-surface-strong rounded-3xl p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">{t('about.services.badge')}</p>
              <h2 className="mt-2 max-w-xl text-3xl font-bold tracking-tight text-neutral-900">{t('about.services.title')}</h2>
            </div>
            <p className="max-w-md text-sm text-neutral-700 sm:text-base">{t('about.services.subtitle')}</p>
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px_minmax(0,1fr)] lg:items-center">
            <div className="space-y-3">
              {serviceItems.filter((item) => item.side === 'left').map((item) => (
                <article key={item.id} className="glass-surface flex items-start gap-3 rounded-xl p-3 sm:p-4">
                  <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-700">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <rect x="4" y="5" width="16" height="14" rx="1.5" />
                      <path d="M12 5v14M4 12h16" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900">{t(`about.services.items.${item.id}.title`)}</h3>
                    <p className="mt-1 text-sm text-neutral-700">{t(`about.services.items.${item.id}.description`)}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mx-auto max-w-xs">
              <img src={serviceImage} alt={t('about.services.title')} className="h-auto w-full object-contain drop-shadow-[0_20px_40px_rgba(2,132,199,0.2)]" />
            </div>

            <div className="space-y-3">
              {serviceItems.filter((item) => item.side === 'right').map((item) => (
                <article key={item.id} className="glass-surface flex items-start gap-3 rounded-xl p-3 sm:p-4">
                  <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-700">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <rect x="4" y="5" width="16" height="14" rx="1.5" />
                      <path d="M8 5v14M16 5v14" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900">{t(`about.services.items.${item.id}.title`)}</h3>
                    <p className="mt-1 text-sm text-neutral-700">{t(`about.services.items.${item.id}.description`)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">{t('about.story.title')}</h2>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`rounded-md border px-3 py-1 text-sm font-medium transition ${activeTab === tab ? 'border-cyan-300 bg-cyan-500 text-white' : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'}`}
                onClick={() => setActiveTab(tab)}
              >
                {t(`about.story.tabs.${tab}`)}
              </button>
            ))}
          </div>
          <article className="glass-surface rounded-xl p-5">
            <h3 className="text-xl font-semibold text-neutral-900">{t(`about.story.content.${activeTab}.title`)}</h3>
            <p className="mt-2 text-neutral-700">{t(`about.story.content.${activeTab}.text`)}</p>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="glass-surface rounded-xl p-5">
            <h3 className="text-2xl font-semibold text-neutral-900">{t('about.cards.mission.title')}</h3>
            <p className="mt-2 text-neutral-700">{t('about.cards.mission.text')}</p>
          </article>
          <article className="glass-surface rounded-xl p-5">
            <h3 className="text-2xl font-semibold text-neutral-900">{t('about.cards.values.title')}</h3>
            <p className="mt-2 text-neutral-700">{t('about.cards.values.text')}</p>
          </article>
          <article className="glass-surface rounded-xl p-5">
            <h3 className="text-2xl font-semibold text-neutral-900">{t('about.cards.why.title')}</h3>
            <ul className="mt-2 list-disc pl-5 text-neutral-700 space-y-1">
              <li>{t('about.cards.why.items.0')}</li>
              <li>{t('about.cards.why.items.1')}</li>
              <li>{t('about.cards.why.items.2')}</li>
            </ul>
          </article>
        </section>
      </div>
    </MotionPage>
  )
}
