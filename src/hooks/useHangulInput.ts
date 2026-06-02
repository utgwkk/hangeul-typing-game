// Korean (2벌식) IME input hook. Wraps automaton.ts + layout.ts for React.
import { useState, useEffect, useCallback } from 'react'
import {
  createInitialState,
  inputJamo as automatonInputJamo,
  inputLiteral,
  backspace as automatonBackspace,
  renderSyllable,
  type AutomatonState,
} from '../core/hangul/automaton'
import { keyToJamo } from '../core/hangul/layout'

export interface UseHangulInputOptions {
  /** When false, keyboard events are ignored. Defaults to true. */
  enabled?: boolean
}

export interface UseHangulInputReturn {
  /** Finalized (확정) text. */
  committed: string
  /** Currently composing syllable rendered as a string. */
  composing: string
  /** committed + composing */
  value: string
  /** Reset automaton to initial state. */
  reset: () => void
}

export function useHangulInput(options?: UseHangulInputOptions): UseHangulInputReturn {
  const enabled = options?.enabled ?? true
  const [state, setState] = useState<AutomatonState>(createInitialState)

  const reset = useCallback(() => {
    setState(createInitialState())
  }, [])

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key === 'Backspace') {
        e.preventDefault()
        setState(prev => automatonBackspace(prev))
        return
      }

      if (e.key === ' ') {
        e.preventDefault()
        setState(prev => inputLiteral(prev, ' '))
        return
      }

      const jamo = keyToJamo(e.code, e.shiftKey)
      if (jamo) {
        e.preventDefault()
        setState(prev => automatonInputJamo(prev, jamo))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled])

  const composing = renderSyllable(state.current)
  return {
    committed: state.committed,
    composing,
    value: state.committed + composing,
    reset,
  }
}
