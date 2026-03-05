import { useTranslation } from 'react-i18next'
import deFlag from '../assets/flags/de.svg'
import gbFlag from '../assets/flags/gb.svg'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const languages = [
    { code: 'de', flag: deFlag, label: 'DE' },
    { code: 'en', flag: gbFlag, label: 'EN' }
  ] as const

  return (
    <div className="flex items-center gap-2">
      {languages.map((language) => {
        const isActive = i18n.language.startsWith(language.code)
        return (
          <button
            key={language.code}
            type="button"
            aria-label={language.label}
            title={language.label}
            className={`group relative h-10 w-10 sm:h-11 sm:w-11 overflow-hidden rounded-full transition ${
              isActive ? 'ring-2 ring-neutral-900' : 'hover:ring-2 hover:ring-neutral-400'
            }`}
            onClick={() => i18n.changeLanguage(language.code)}
          >
            <img src={language.flag} alt={language.label} className="h-full w-full object-cover" />
            <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-neutral-900 px-1.5 py-0.5 text-[11px] text-white opacity-0 transition group-hover:opacity-100">
              {language.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
