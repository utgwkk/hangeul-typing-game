import { decomposeSyllable, type AutomatonState } from '../../core/hangul/automaton'
import { jamoToKey } from '../../core/hangul/layout'
import { decomposeVowel, decomposeConsonant } from '../../core/hangul/jamoTables'
import type { Prompt } from '../../data/types'

/**
 * Returns the next jamo the user should type, given the current prompt and
 * automaton state. Returns null for non-Hangul targets or when the syllable
 * is complete with no further input required.
 */
export function computeNextJamo(
  prompt: Prompt | null,
  automaton: AutomatonState,
): string | null {
  if (!prompt) return null

  const committed = automaton.committed
  const committedLen = Array.from(committed).length
  const promptChars = Array.from(prompt.text)

  if (committedLen >= promptChars.length) return null

  const targetChar = promptChars[committedLen]
  if (!/[가-힣]/.test(targetChar)) return null

  const targetSyllable = decomposeSyllable(targetChar)
  if (!targetSyllable) return null

  const cur = automaton.current

  if (cur.cho === null) {
    return targetSyllable.cho
  } else if (cur.jung === null) {
    // If jung is a compound vowel (e.g. ㅘ), show the first component (ㅗ).
    const vowelParts = decomposeVowel(targetSyllable.jung!)
    return vowelParts ? vowelParts[0] : targetSyllable.jung
  } else if (cur.jung !== targetSyllable.jung) {
    // Partway through typing a compound vowel — show the second component.
    const vowelParts = decomposeVowel(targetSyllable.jung!)
    if (vowelParts && vowelParts[0] === cur.jung) {
      return vowelParts[1]
    }
    return null
  } else if (cur.jong === null && targetSyllable.jong !== null) {
    // If jong is a compound consonant (e.g. ㄺ), show the first component (ㄹ).
    const jongParts = decomposeConsonant(targetSyllable.jong)
    return jongParts ? jongParts[0] : targetSyllable.jong
  } else if (cur.jong !== null && targetSyllable.jong !== null && cur.jong !== targetSyllable.jong) {
    const targetJongParts = decomposeConsonant(targetSyllable.jong)
    const curJongParts = decomposeConsonant(cur.jong)
    if (targetJongParts && targetJongParts[0] === cur.jong) {
      // cur.jong is the first component of a compound target jong — need the second.
      return targetJongParts[1]
    } else if (curJongParts && curJongParts[0] === targetSyllable.jong) {
      // cur.jong is a compound whose first component equals the target jong.
      // The second component will become the cho of the next syllable, so
      // we need the next syllable's jung (or its first component if compound).
      if (committedLen + 1 < promptChars.length) {
        const nextChar = promptChars[committedLen + 1]
        if (/[가-힣]/.test(nextChar)) {
          const nextSyllable = decomposeSyllable(nextChar)
          if (nextSyllable?.jung) {
            const nextVowelParts = decomposeVowel(nextSyllable.jung)
            return nextVowelParts ? nextVowelParts[0] : nextSyllable.jung
          }
        }
      }
    }
    return null
  } else if (committedLen + 1 < promptChars.length) {
    const nextChar = promptChars[committedLen + 1]
    if (/[가-힣]/.test(nextChar)) {
      const nextSyllable = decomposeSyllable(nextChar)
      if (nextSyllable) {
        if (cur.jong !== null && cur.jong === nextSyllable.cho) {
          if (cur.jong === targetSyllable.jong) {
            // The jong is confirmed (matches target) but coincides with the
            // next syllable's cho (e.g. 듣다, 안녕). Type it again to flush
            // the current syllable and start the next one.
            return cur.jong
          }
          // Tentative jong is actually the cho of the next syllable —
          // guide the user to type the jung so the jong rises (e.g. 가족).
          const vowelParts = decomposeVowel(nextSyllable.jung!)
          return vowelParts ? vowelParts[0] : nextSyllable.jung
        } else {
          return nextSyllable.cho ?? null
        }
      }
    }
  }

  return null
}

export function computeNextKey(
  prompt: Prompt | null,
  automaton: AutomatonState,
): { code: string | null; shift: boolean } {
  if (!prompt) return { code: null, shift: false }

  const committed = automaton.committed
  const committedLen = Array.from(committed).length
  const promptChars = Array.from(prompt.text)

  if (committedLen >= promptChars.length) return { code: null, shift: false }

  const targetChar = promptChars[committedLen]

  // Space / punctuation
  if (targetChar === ' ') return { code: 'Space', shift: false }
  if (!/[가-힣]/.test(targetChar)) return { code: null, shift: false }

  const nextJamo = computeNextJamo(prompt, automaton)
  if (!nextJamo) return { code: null, shift: false }
  const keyInfo = jamoToKey(nextJamo)
  if (!keyInfo) return { code: null, shift: false }
  return { code: keyInfo.code, shift: keyInfo.shift }
}
