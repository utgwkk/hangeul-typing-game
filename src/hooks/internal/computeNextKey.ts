import { decomposeSyllable, type AutomatonState } from '../../core/hangul/automaton'
import { jamoToKey } from '../../core/hangul/layout'
import { decomposeVowel, decomposeConsonant } from '../../core/hangul/jamoTables'
import type { Prompt } from '../../data/types'

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

  const targetSyllable = decomposeSyllable(targetChar)
  if (!targetSyllable) return { code: null, shift: false }

  const cur = automaton.current
  let nextJamo: string | null = null

  if (cur.cho === null) {
    nextJamo = targetSyllable.cho
  } else if (cur.jung === null) {
    // If jung is a compound vowel (e.g. ㅘ), show the first component (ㅗ).
    const vowelParts = decomposeVowel(targetSyllable.jung!)
    nextJamo = vowelParts ? vowelParts[0] : targetSyllable.jung
  } else if (cur.jung !== targetSyllable.jung) {
    // Partway through typing a compound vowel — show the second component.
    const vowelParts = decomposeVowel(targetSyllable.jung!)
    if (vowelParts && vowelParts[0] === cur.jung) {
      nextJamo = vowelParts[1]
    }
  } else if (cur.jong === null && targetSyllable.jong !== null) {
    // If jong is a compound consonant (e.g. ㄺ), show the first component (ㄹ).
    const jongParts = decomposeConsonant(targetSyllable.jong)
    nextJamo = jongParts ? jongParts[0] : targetSyllable.jong
  } else if (cur.jong !== null && targetSyllable.jong !== null && cur.jong !== targetSyllable.jong) {
    const targetJongParts = decomposeConsonant(targetSyllable.jong)
    const curJongParts = decomposeConsonant(cur.jong)
    if (targetJongParts && targetJongParts[0] === cur.jong) {
      // cur.jong is the first component of a compound target jong — need the second.
      nextJamo = targetJongParts[1]
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
            nextJamo = nextVowelParts ? nextVowelParts[0] : nextSyllable.jung
          }
        }
      }
    }
  } else if (committedLen + 1 < promptChars.length) {
    const nextChar = promptChars[committedLen + 1]
    if (/[가-힣]/.test(nextChar)) {
      const nextSyllable = decomposeSyllable(nextChar)
      nextJamo = nextSyllable?.cho ?? null
    }
  }

  if (!nextJamo) return { code: null, shift: false }
  const keyInfo = jamoToKey(nextJamo)
  if (!keyInfo) return { code: null, shift: false }
  return { code: keyInfo.code, shift: keyInfo.shift }
}
