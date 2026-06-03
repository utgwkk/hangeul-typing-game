import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Prompt from './Prompt'
import StatsBar from './StatsBar'
import Keyboard from './Keyboard'
import { getMode } from '../core/game/modes'
import type { ModeId } from '../core/game/modes'
import type { CharStatus } from '../core/game/engine'
import type { StatsSnapshot } from '../core/game/stats'
import type { TimerSnapshot } from '../core/game/score'
import type { Prompt as PromptData } from '../data/types'
import type { SyllableState } from '../core/hangul/automaton'

interface GameScreenProps {
  currentPrompt: PromptData | null
  charStatuses: CharStatus[]
  composing: string
  composingState: SyllableState
  statsSnapshot: StatsSnapshot
  timer: TimerSnapshot
  score: number
  combo: number
  isWrong: boolean
  nextKeyCode: string | null
  nextKeyShift: boolean
  selectedMode: ModeId
}

export default function GameScreen({
  currentPrompt,
  charStatuses,
  composing,
  composingState,
  statsSnapshot,
  timer,
  score,
  combo,
  isWrong,
  nextKeyCode,
  nextKeyShift,
  selectedMode,
}: GameScreenProps) {
  const { t } = useTranslation()
  const [isShift, setIsShift] = useState(false)
  const [showKeyGuide, setShowKeyGuide] = useState(() =>
    localStorage.getItem('keyGuide') === 'true'
  )

  const toggleKeyGuide = () => {
    setShowKeyGuide(prev => {
      localStorage.setItem('keyGuide', String(!prev))
      return !prev
    })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => setIsShift(e.shiftKey)
    const handleKeyUp = (e: KeyboardEvent) => setIsShift(e.shiftKey)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const hasTimeLimit = getMode(selectedMode).progress.type === 'timeLimit'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 gap-6 p-4">
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded">
        {t('error.imeWarning')}
      </p>

      <StatsBar
        stats={statsSnapshot}
        timer={timer}
        score={score}
        combo={combo}
        hasTimeLimit={hasTimeLimit}
      />

      {currentPrompt && (
        <Prompt
          prompt={currentPrompt}
          charStatuses={charStatuses}
          composing={composing}
          showKeyGuide={showKeyGuide}
          composingState={composingState}
        />
      )}

      <Keyboard
        highlightCode={nextKeyCode}
        highlightShift={nextKeyShift}
        isWrong={isWrong}
        isShift={isShift}
      />

      <button
        onClick={toggleKeyGuide}
        className={`text-xs px-3 py-1 rounded border transition-colors ${
          showKeyGuide
            ? 'bg-blue-100 text-blue-700 border-blue-300'
            : 'bg-gray-100 text-gray-500 border-gray-300'
        }`}
      >
        {t('keyGuide.toggle')}
      </button>
    </div>
  )
}
