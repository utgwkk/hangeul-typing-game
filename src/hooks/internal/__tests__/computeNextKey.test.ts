import { describe, it, expect } from 'vitest'
import { computeNextKey } from '../computeNextKey'
import { createInitialState, type AutomatonState } from '../../../core/hangul/automaton'
import type { Prompt } from '../../../data/types'

function makeAutomaton(
  committed: string,
  cho: string | null,
  jung: string | null,
  jong: string | null,
): AutomatonState {
  return { committed, current: { cho, jung, jong } }
}

function prompt(text: string): Prompt {
  return { text }
}

describe('computeNextKey', () => {
  describe('null and boundary inputs', () => {
    it('returns null/false when prompt is null', () => {
      expect(computeNextKey(null, createInitialState())).toEqual({ code: null, shift: false })
    })

    it('returns null/false when committed length equals prompt length', () => {
      expect(computeNextKey(prompt('가'), makeAutomaton('가', null, null, null))).toEqual({
        code: null,
        shift: false,
      })
    })

    it('returns null/false when committed length exceeds prompt length', () => {
      expect(computeNextKey(prompt('가'), makeAutomaton('가나', null, null, null))).toEqual({
        code: null,
        shift: false,
      })
    })
  })

  describe('space and non-Hangul', () => {
    it('returns Space/false for a space character', () => {
      // committed='한', next char is space
      expect(computeNextKey(prompt('한 국'), makeAutomaton('한', null, null, null))).toEqual({
        code: 'Space',
        shift: false,
      })
    })

    it('returns null/false for non-Hangul non-space ASCII', () => {
      expect(computeNextKey(prompt('ABC'), makeAutomaton('', null, null, null))).toEqual({
        code: null,
        shift: false,
      })
    })
  })

  describe('초성 (cho) phase', () => {
    it('returns the cho key for a fresh syllable (가 → ㄱ → KeyR)', () => {
      expect(computeNextKey(prompt('가'), createInitialState())).toEqual({
        code: 'KeyR',
        shift: false,
      })
    })

    it('returns the cho key for a tensed consonant requiring shift (까 → ㄲ → KeyR+shift)', () => {
      expect(computeNextKey(prompt('까'), createInitialState())).toEqual({
        code: 'KeyR',
        shift: true,
      })
    })
  })

  describe('중성 (jung) phase — simple vowel', () => {
    it('returns the jung key for a simple vowel (가, cho typed → ㅏ → KeyK)', () => {
      expect(computeNextKey(prompt('가'), makeAutomaton('', 'ㄱ', null, null))).toEqual({
        code: 'KeyK',
        shift: false,
      })
    })
  })

  describe('중성 (jung) phase — compound vowel', () => {
    it('returns the first component of a compound vowel when jung is null (봐 → ㅗ → KeyH)', () => {
      expect(computeNextKey(prompt('봐'), makeAutomaton('', 'ㅂ', null, null))).toEqual({
        code: 'KeyH',
        shift: false,
      })
    })

    it('returns the second component when the first is already typed (봐, jung=ㅗ → ㅏ → KeyK)', () => {
      expect(computeNextKey(prompt('봐'), makeAutomaton('', 'ㅂ', 'ㅗ', null))).toEqual({
        code: 'KeyK',
        shift: false,
      })
    })

    it('returns null when cur.jung does not match the first component of the compound vowel', () => {
      // target jung = ㅘ (ㅗ+ㅏ), but cur.jung = ㅜ — mismatch
      expect(computeNextKey(prompt('봐'), makeAutomaton('', 'ㅂ', 'ㅜ', null))).toEqual({
        code: null,
        shift: false,
      })
    })
  })

  describe('종성 (jong) phase — simple jong', () => {
    it('returns the jong key for a simple final consonant (한, jung typed → ㄴ → KeyS)', () => {
      expect(computeNextKey(prompt('한'), makeAutomaton('', 'ㅎ', 'ㅏ', null))).toEqual({
        code: 'KeyS',
        shift: false,
      })
    })
  })

  describe('종성 (jong) phase — compound jong', () => {
    it('returns the first component of a compound jong (닭, jong=null → ㄹ → KeyF)', () => {
      // 닭 = ㄷ+ㅏ+ㄺ, ㄺ decomposes to [ㄹ, ㄱ]
      expect(computeNextKey(prompt('닭'), makeAutomaton('', 'ㄷ', 'ㅏ', null))).toEqual({
        code: 'KeyF',
        shift: false,
      })
    })

    it('returns the second component when the first is already typed (닭, jong=ㄹ → ㄱ → KeyR)', () => {
      expect(computeNextKey(prompt('닭'), makeAutomaton('', 'ㄷ', 'ㅏ', 'ㄹ'))).toEqual({
        code: 'KeyR',
        shift: false,
      })
    })
  })

  describe('종성 선읽기 (compound jong lookahead)', () => {
    it('uses lookahead to return the next syllable jung when cur.jong overshoots target (달가, jong=ㄺ)', () => {
      // 달 has jong=ㄹ; automaton has tentatively placed ㄺ (cur.jong=ㄺ).
      // curJongParts[0]=ㄹ === targetSyllable.jong=ㄹ → look ahead to 가 → jung=ㅏ → KeyK
      expect(computeNextKey(prompt('달가'), makeAutomaton('', 'ㄷ', 'ㅏ', 'ㄺ'))).toEqual({
        code: 'KeyK',
        shift: false,
      })
    })

    it('returns null when lookahead runs off the end of the prompt (달, jong=ㄺ)', () => {
      expect(computeNextKey(prompt('달'), makeAutomaton('', 'ㄷ', 'ㅏ', 'ㄺ'))).toEqual({
        code: null,
        shift: false,
      })
    })
  })

  describe('次syllable cho (current syllable complete)', () => {
    it('returns next syllable cho when current syllable is complete and has no jong (가나 → ㄴ → KeyS)', () => {
      // 가 is fully typed (cho=ㄱ, jung=ㅏ, jong=null), so advance to 나's cho
      expect(computeNextKey(prompt('가나'), makeAutomaton('', 'ㄱ', 'ㅏ', null))).toEqual({
        code: 'KeyS',
        shift: false,
      })
    })

    it('returns null when the current syllable is the last in the prompt (가, fully typed state)', () => {
      expect(computeNextKey(prompt('가'), makeAutomaton('', 'ㄱ', 'ㅏ', null))).toEqual({
        code: null,
        shift: false,
      })
    })
  })
})
