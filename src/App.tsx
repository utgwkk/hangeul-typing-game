import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Language } from './i18n'

function App() {
  const { t, i18n } = useTranslation()
  const [language, setLanguage] = useState<Language>('ja')

  const toggleLanguage = () => {
    const next: Language = language === 'ja' ? 'ko' : 'ja'
    setLanguage(next)
    i18n.changeLanguage(next)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 gap-4">
      <h1 className="text-3xl font-bold text-gray-800">{t('menu.title')}</h1>
      <button
        onClick={toggleLanguage}
        className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
      >
        {t('menu.selectLanguage')}: {t(`language.${language}`)}
      </button>
    </div>
  )
}

export default App
