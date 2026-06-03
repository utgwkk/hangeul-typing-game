import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ja from './locales/ja.json'
import ko from './locales/ko.json'

export type Language = 'ja' | 'ko'

export const SUPPORTED_LANGUAGES: Language[] = ['ja', 'ko']
export const DEFAULT_LANGUAGE: Language = 'ja'

function getInitialLanguage(): Language {
  const param = new URLSearchParams(window.location.search).get('lang')
  if (param === 'ja' || param === 'ko') return param
  return DEFAULT_LANGUAGE
}

const initialLanguage = getInitialLanguage()
document.documentElement.lang = initialLanguage

i18n.use(initReactI18next).init({
  resources: {
    ja: { translation: ja },
    ko: { translation: ko },
  },
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
