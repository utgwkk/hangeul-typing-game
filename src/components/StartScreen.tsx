import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MODE_IDS } from '../core/game/modes'
import type { ModeId } from '../core/game/modes'
import type { Language } from '../i18n'

interface StartScreenProps {
  onStart: (modeId: ModeId) => void
  language: Language
  onToggleLanguage: () => void
}

export default function StartScreen({ onStart, language, onToggleLanguage }: StartScreenProps) {
  const { t } = useTranslation()
  const [selectedMode, setSelectedMode] = useState<ModeId>('syllable')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 gap-6 p-4">
      <h1 className="text-3xl font-bold text-gray-800">{t('menu.title')}</h1>

      <button
        onClick={onToggleLanguage}
        className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm"
      >
        {t('menu.selectLanguage')}: {t(`language.${language}`)}
      </button>

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-gray-600">{t('menu.selectMode')}</p>
        <div className="flex gap-3">
          {MODE_IDS.map(modeId => (
            <button
              key={modeId}
              onClick={() => setSelectedMode(modeId)}
              className={`flex flex-col items-center px-5 py-4 rounded-xl border-2 transition-colors w-28 ${
                selectedMode === modeId
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
              }`}
            >
              <span className="font-bold text-base">{t(`mode.${modeId}`)}</span>
              <span className="text-xs mt-1 text-center leading-tight">
                {t(`mode.${modeId}Desc`)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onStart(selectedMode)}
        className="px-8 py-3 rounded-lg bg-green-500 text-white font-bold text-lg hover:bg-green-600 transition-colors"
      >
        {t('menu.start')}
      </button>
    </div>
  )
}
