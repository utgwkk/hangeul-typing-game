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

interface GameScreenProps {
  currentPrompt: PromptData | null
  charStatuses: CharStatus[]
  composing: string
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
        />
      )}

      <Keyboard
        highlightCode={nextKeyCode}
        highlightShift={nextKeyShift}
        isWrong={isWrong}
        isShift={isShift}
      />
    </div>
  )
}
