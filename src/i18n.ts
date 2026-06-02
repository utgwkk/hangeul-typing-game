import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ja from './locales/ja.json'
import ko from './locales/ko.json'

export type Language = 'ja' | 'ko'

export const DEFAULT_LANGUAGE: Language = 'ja'

i18n.use(initReactI18next).init({
  resources: {
    ja: { translation: ja },
    ko: { translation: ko },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
