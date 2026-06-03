import { useTranslation } from 'react-i18next'
import type { CharStatus } from '../core/game/engine'
import type { Prompt as PromptData } from '../data/types'
import type { SyllableState } from '../core/hangul/automaton'
import { syllableToKeys, countEnteredKeys } from '../core/hangul/keyboardGuide'

interface PromptProps {
  prompt: PromptData
  charStatuses: CharStatus[]
  /** Currently composing syllable text (may differ from target). */
  composing: string
  showKeyGuide?: boolean
  composingState?: SyllableState | null
}

interface KeyGuideProps {
  char: string
  status: CharStatus
  composingState?: SyllableState | null
}

function KeyGuide({ char, status, composingState }: KeyGuideProps) {
  const keys = syllableToKeys(char)
  if (status === 'correct') {
    return <span className="text-xs font-mono text-gray-300">{keys}</span>
  }
  if (status === 'composing' && composingState) {
    const entered = countEnteredKeys(composingState)
    return (
      <span className="text-xs font-mono">
        <span className="text-yellow-500">{keys.slice(0, entered)}</span>
        <span className="text-gray-400">{keys.slice(entered)}</span>
      </span>
    )
  }
  if (status === 'wrong') {
    return <span className="text-xs font-mono text-red-400">{keys}</span>
  }
  return <span className="text-xs font-mono text-gray-400">{keys}</span>
}

const STATUS_CLASSES: Record<CharStatus, string> = {
  correct: 'text-green-500',
  composing: 'text-yellow-500 underline decoration-2 underline-offset-4',
  pending: 'text-gray-400',
  wrong: 'text-red-500',
}

export default function Prompt({ prompt, charStatuses, composing, showKeyGuide, composingState }: PromptProps) {
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
            <div key={i} className="flex flex-col items-center">
              <span className={STATUS_CLASSES[status]}>
                {displayChar}
              </span>
              {showKeyGuide && (
                <KeyGuide
                  char={char}
                  status={status}
                  composingState={status === 'composing' ? composingState : null}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Word/sentence learning aids */}
      {prompt.meaning && (
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-600">{t('word.meaning')}: </span>
          {prompt.meaning[lang] ?? prompt.meaning.ja}
        </p>
      )}
    </div>
  )
}
