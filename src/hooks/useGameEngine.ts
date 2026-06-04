// Game engine hook: unifies automaton, engine, stats, and score into one React-friendly API.
import { useState, useEffect, useCallback } from 'react'
import {
  createInitialState,
  inputJamo as automatonInputJamo,
  inputLiteral,
  backspace as automatonBackspace,
  commit as automatonCommit,
  renderSyllable,
  type AutomatonState,
  type SyllableState,
} from '../core/hangul/automaton'
import { keyToJamo } from '../core/hangul/layout'
import { computeNextKey, computeNextJamo } from './internal/computeNextKey'
import {
  createEngine,
  currentPrompt as engineCurrentPrompt,
  computeCharStatuses,
  isQuestionComplete,
  advanceQuestion,
  type EngineState,
  type CharStatus,
} from '../core/game/engine'
import {
  createStats,
  recordKeystroke,
  recordSyllable,
  computeStats,
  type StatsState,
  type StatsSnapshot,
} from '../core/game/stats'
import {
  createScore,
  startTimer as startScoreTimer,
  recordJamoCorrect,
  recordCorrect,
  recordMiss,
  extendTime,
  getTimer,
  type ScoreState,
  type TimerSnapshot,
} from '../core/game/score'
import { getMode, type ModeId, type ComboExtension } from '../core/game/modes'
import type { Prompt } from '../data/types'

export type GamePhase = 'idle' | 'playing' | 'finished'

interface GameState {
  phase: GamePhase
  engine: EngineState | null
  automaton: AutomatonState
  stats: StatsState
  score: ScoreState
  comboExtension: ComboExtension | null
  isWrong: boolean
}

const IDLE_STATE: GameState = {
  phase: 'idle',
  engine: null,
  automaton: createInitialState(),
  stats: createStats(),
  score: createScore(),
  comboExtension: null,
  isWrong: false,
}

export interface UseGameEngineReturn {
  phase: GamePhase
  currentPrompt: Prompt | null
  charStatuses: CharStatus[]
  committed: string
  composing: string
  statsSnapshot: StatsSnapshot
  timer: TimerSnapshot
  score: number
  combo: number
  maxCombo: number
  isWrong: boolean
  /** Key code of the next key to highlight on the virtual keyboard. */
  nextKeyCode: string | null
  nextKeyShift: boolean
  /** The syllable currently being composed (raw automaton state). */
  composingState: SyllableState
  start: (modeId: ModeId) => void
  reset: () => void
}

export function useGameEngine(): UseGameEngineReturn {
  const [gameState, setGameState] = useState<GameState>(IDLE_STATE)
  const [now, setNow] = useState(() => Date.now())

  // Tick timer every 100ms while playing to keep display fresh.
  useEffect(() => {
    if (gameState.phase !== 'playing') return
    const id = setInterval(() => {
      const current = Date.now()
      setNow(current)
      // Check timeLimit expiry.
      setGameState(prev => {
        if (prev.phase !== 'playing' || prev.engine?.progress.type !== 'timeLimit') return prev
        const timer = getTimer(prev.score, current)
        if (timer.isExpired) {
          return { ...prev, phase: 'finished' }
        }
        return prev
      })
    }, 100)
    return () => clearInterval(id)
  }, [gameState.phase])

  // Keyboard listener while playing.
  useEffect(() => {
    if (gameState.phase !== 'playing') return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const isBackspace = e.key === 'Backspace'
      const isSpace = e.key === ' '
      const jamo = isBackspace || isSpace ? null : keyToJamo(e.code, e.shiftKey)
      const isOtherLiteral = !isBackspace && !isSpace && !jamo && e.key.length === 1
      if (!isBackspace && !isSpace && !jamo && !isOtherLiteral) return

      e.preventDefault()

      setGameState(prev => {
        if (prev.phase !== 'playing' || !prev.engine) return prev

        const prompt = engineCurrentPrompt(prev.engine)
        if (!prompt) return prev

        if (isBackspace) {
          return { ...prev, automaton: automatonBackspace(prev.automaton), isWrong: false }
        }

        // Validate input against the next expected jamo/character.
        const committedLen = Array.from(prev.automaton.committed).length
        const promptChars = Array.from(prompt.text)
        const targetChar = committedLen < promptChars.length ? promptChars[committedLen] : null

        let inputIsCorrect: boolean
        if (jamo !== null) {
          if (targetChar && /[가-힣]/.test(targetChar)) {
            const expectedJamo = computeNextJamo(prompt, prev.automaton)
            // If expectedJamo is null (syllable complete, etc.) allow through as a safety valve.
            inputIsCorrect = expectedJamo === null || jamo === expectedJamo
          } else {
            // Target is non-Hangul but user pressed a jamo key.
            inputIsCorrect = false
          }
        } else {
          // Space or other literal: must match the target character exactly.
          inputIsCorrect = targetChar !== null && e.key === targetChar
        }

        const newStats = recordKeystroke(prev.stats, inputIsCorrect)
        let newScore = startScoreTimer(prev.score)

        if (!inputIsCorrect) {
          newScore = recordMiss(newScore)
          return { ...prev, stats: newStats, score: newScore, isWrong: true }
        }

        newScore = recordJamoCorrect(newScore)

        let newAutomaton: AutomatonState
        if (isSpace || isOtherLiteral) {
          newAutomaton = inputLiteral(prev.automaton, e.key)
        } else {
          newAutomaton = automatonInputJamo(prev.automaton, jamo!)
        }

        const newComposing = renderSyllable(newAutomaton.current)
        const newCommitted = newAutomaton.committed

        // Question complete?
        if (isQuestionComplete(prompt.text, newCommitted, newComposing)) {
          const committed = automatonCommit(newAutomaton)
          const snapshot = computeStats(newStats)
          const syllableCount = Array.from(prompt.text).length
          newScore = recordCorrect(newScore, snapshot.cpm, syllableCount)
          const ext = prev.comboExtension
          if (ext && newScore.combo % ext.interval === 0) {
            newScore = extendTime(newScore, ext.bonusSeconds)
          }
          const newStats2 = recordSyllable(newStats, syllableCount)
          const newEngine = advanceQuestion(prev.engine)

          const nextPhase: GamePhase = newEngine.finished ? 'finished' : 'playing'
          return {
            phase: nextPhase,
            engine: newEngine,
            automaton: nextPhase === 'playing' ? createInitialState() : committed,
            stats: newStats2,
            score: newScore,
            comboExtension: prev.comboExtension,
            isWrong: false,
          }
        }

        return { ...prev, automaton: newAutomaton, stats: newStats, score: newScore, isWrong: false }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState.phase])

  const start = useCallback((modeId: ModeId) => {
    const config = getMode(modeId)
    const timeLimitSeconds =
      config.progress.type === 'timeLimit' ? config.progress.seconds : undefined
    setGameState({
      phase: 'playing',
      engine: createEngine(config),
      automaton: createInitialState(),
      stats: createStats(),
      score: createScore(timeLimitSeconds),
      comboExtension: config.comboExtension,
      isWrong: false,
    })
    setNow(Date.now())
  }, [])

  const reset = useCallback(() => {
    setGameState(IDLE_STATE)
    setNow(Date.now())
  }, [])

  const { phase, engine, automaton, stats, score } = gameState
  const prompt = engine ? engineCurrentPrompt(engine) : null
  const composing = renderSyllable(automaton.current)
  const committed = automaton.committed

  const charStatuses: CharStatus[] = prompt
    ? computeCharStatuses(prompt.text, committed, composing)
    : []

  const isWrong = gameState.isWrong
  const { code: nextKeyCode, shift: nextKeyShift } = computeNextKey(prompt, automaton)
  const statsSnapshot = computeStats(stats, now)
  const timer = getTimer(score, now)

  return {
    phase,
    currentPrompt: prompt,
    charStatuses,
    committed,
    composing,
    statsSnapshot,
    timer,
    score: score.score,
    combo: score.combo,
    maxCombo: score.maxCombo,
    isWrong,
    nextKeyCode,
    nextKeyShift,
    composingState: automaton.current,
    start,
    reset,
  }
}
