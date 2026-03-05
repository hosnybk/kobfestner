import MotionPage from '../components/MotionPage'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import logoKob from '../assets/logo_KOB.svg'
import contactServicesData from '../data/contactServices.json'

export default function Contact() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language.startsWith('en') ? 'en' : 'de'
  const services = contactServicesData as Array<{
    id: 'fenster' | 'tueren' | 'rolllaeden' | 'raffstore'
    title: { de: string; en: string }
    description: { de: string; en: string }
    tags: { de: string[]; en: string[] }
  }>
  const [openService, setOpenService] = useState<(typeof services)[number]['id']>('fenster')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <MotionPage>
      <div className="container py-10 sm:py-14 space-y-8">
        <section className="glass-surface-strong rounded-3xl p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">{t('contact.badge')}</p>
          <div className="mt-4 grid gap-7 lg:grid-cols-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">{t('contact.title')}</h1>
              <p className="mt-3 text-neutral-700">{t('contact.subtitle')}</p>

              <div className="glass-surface mt-6 divide-y divide-neutral-200 rounded-xl">
                {services.map((service) => {
                  const isOpen = openService === service.id
                  return (
                    <div key={service.id} className="p-4">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between text-left"
                        onClick={() => setOpenService(service.id)}
                      >
                        <span className="font-semibold text-neutral-900">{service.title[locale]}</span>
                        <span className="text-cyan-600">{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && (
                        <div className="mt-3">
                          <p className="text-sm text-neutral-700">{service.description[locale]}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {service.tags[locale].map((tag) => (
                              <span key={`${service.id}-${tag}`} className="glass-chip rounded-full px-2.5 py-1 text-xs font-medium text-neutral-700">{tag}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="glass-surface rounded-2xl p-5">
              <img src={logoKob} alt={t('brand')} className="h-24 w-auto sm:h-28" />
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.15em] text-neutral-500">{t('contact.quickContact.title')}</p>
              <div className="mt-3 space-y-2 text-neutral-800">
                <p>{t('contact.quickContact.phone')}</p>
                <p>{t('contact.quickContact.email')}</p>
                <p>{t('contact.quickContact.address')}</p>
                <p>{t('contact.quickContact.hours')}</p>
              </div>
              <a
                href="https://maps.google.com/?q=Kranenstra%C3%9Fe+19,+65375+Oestrich-Winkel,+Germany"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                {t('contact.quickContact.mapButton')}
              </a>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="glass-surface rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-neutral-900">{t('contact.formTitle')}</h2>
            <p className="mt-2 text-neutral-700">{t('contact.formSubtitle')}</p>
            <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <input type="text" placeholder={t('contact.form.firstName')} className="glass-input rounded-lg px-3 py-2 text-sm outline-none ring-cyan-500 focus:ring-2" />
                <input type="text" placeholder={t('contact.form.lastName')} className="glass-input rounded-lg px-3 py-2 text-sm outline-none ring-cyan-500 focus:ring-2" />
              </div>
              <input type="email" placeholder={t('contact.form.email')} className="glass-input w-full rounded-lg px-3 py-2 text-sm outline-none ring-cyan-500 focus:ring-2" />
              <input type="tel" placeholder={t('contact.form.phone')} className="glass-input w-full rounded-lg px-3 py-2 text-sm outline-none ring-cyan-500 focus:ring-2" />
              <select className="glass-input w-full rounded-lg px-3 py-2 text-sm outline-none ring-cyan-500 focus:ring-2">
                <option value="">{t('contact.form.service')}</option>
                {services.map((service) => (
                  <option key={`option-${service.id}`} value={service.id}>{service.title[locale]}</option>
                ))}
              </select>
              <textarea placeholder={t('contact.form.message')} rows={4} className="glass-input w-full rounded-lg px-3 py-2 text-sm outline-none ring-cyan-500 focus:ring-2" />
              <button type="submit" className="rounded-xl bg-cyan-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700">
                {t('contact.form.submit')}
              </button>
            </form>
          </article>

          <article className="glass-surface overflow-hidden rounded-2xl">
            <iframe
              title={t('contact.mapTitle')}
              src="https://www.google.com/maps?q=Kranenstra%C3%9Fe+19,+65375+Oestrich-Winkel,+Germany&output=embed"
              className="h-full min-h-80 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </article>
        </section>
      </div>
    </MotionPage>
  )
}
