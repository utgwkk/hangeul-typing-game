import { useTranslation } from 'react-i18next'
import type { CharStatus } from '../core/game/engine'
import type { Prompt as PromptData } from '../data/types'

interface PromptProps {
  prompt: PromptData
  charStatuses: CharStatus[]
  /** Currently composing syllable text (may differ from target). */
  composing: string
}

const STATUS_CLASSES: Record<CharStatus, string> = {
  correct: 'text-green-500',
  composing: 'text-yellow-500 underline decoration-2 underline-offset-4',
  pending: 'text-gray-400',
  wrong: 'text-red-500',
}

export default function Prompt({ prompt, charStatuses, composing }: PromptProps) {
  const { t, i18n } = useTranslation()
  const promptChars = Array.from(prompt.text)
  const lang = i18n.language as 'ja' | 'ko'

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Character-by-character prompt display */}
      <div className="flex flex-wrap justify-center gap-0.5 text-4xl font-bold tracking-wide">
        {promptChars.map((char, i) => {
          const status = charStatuses[i] ?? 'pending'
          // Show composing character in place of the target character
          const displayChar = status === 'composing' && composing ? composing : char
          return (
            <span key={i} className={STATUS_CLASSES[status]}>
              {displayChar}
            </span>
          )
        })}
      </div>

      {/* Word/sentence learning aids */}
      {prompt.reading && (
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-600">{t('word.reading')}: </span>
          {prompt.reading}
        </p>
      )}
      {prompt.meaning && (
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-600">{t('word.meaning')}: </span>
          {prompt.meaning[lang] ?? prompt.meaning.ja}
        </p>
      )}
    </div>
  )
}
