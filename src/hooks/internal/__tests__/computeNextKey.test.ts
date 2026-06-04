import { describe, it, expect } from 'vitest'
import { computeNextKey, computeNextJamo } from '../computeNextKey'
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

  describe('초성が종성に一時格納される場合のルックアヘッド (issue #33)', () => {
    it('가족: 갖 state (jong=ㅈ is tentative cho of 족) → show ㅗ (KeyH)', () => {
      // Typed ㄱ+ㅏ+ㅈ; IME tentatively stores ㅈ as jong of 가.
      // 족's cho=ㅈ is already typed; next key is 족's jung=ㅗ.
      expect(computeNextKey(prompt('가족'), makeAutomaton('', 'ㄱ', 'ㅏ', 'ㅈ'))).toEqual({
        code: 'KeyH',
        shift: false,
      })
    })

    it('시간: 식 state (jong=ㄱ is tentative cho of 간) → show ㅏ (KeyK)', () => {
      // Typed ㅅ+ㅣ+ㄱ; IME tentatively stores ㄱ as jong of 시.
      // 간's cho=ㄱ is already typed; next key is 간's jung=ㅏ.
      expect(computeNextKey(prompt('시간'), makeAutomaton('', 'ㅅ', 'ㅣ', 'ㄱ'))).toEqual({
        code: 'KeyK',
        shift: false,
      })
    })

    it('여행: 옇 state (jong=ㅎ is tentative cho of 행) → show ㅐ (KeyO)', () => {
      // Typed ㅇ+ㅕ+ㅎ; IME tentatively stores ㅎ as jong of 여.
      // 행's cho=ㅎ is already typed; next key is 행's jung=ㅐ.
      expect(computeNextKey(prompt('여행'), makeAutomaton('', 'ㅇ', 'ㅕ', 'ㅎ'))).toEqual({
        code: 'KeyO',
        shift: false,
      })
    })

    it("안녕: 안 state with tentative jong=ㄴ matching 녕's cho → show ㅕ (KeyU)", () => {
      // Typed ㅇ+ㅏ+ㄴ; IME tentatively stores ㄴ as jong of 안.
      // 녕's cho=ㄴ is already typed; next key is 녕's jung=ㅕ.
      expect(computeNextKey(prompt('안녕'), makeAutomaton('', 'ㅇ', 'ㅏ', 'ㄴ'))).toEqual({
        code: 'KeyU',
        shift: false,
      })
    })

    it('컴퓨터: 컴픁 state (committed=컴, jong=ㅌ is tentative cho of 터) → show ㅓ (KeyJ)', () => {
      // Typed 컴 committed, then ㅍ+ㅠ+ㅌ; IME tentatively stores ㅌ as jong of 퓨.
      // 터's cho=ㅌ is already typed; next key is 터's jung=ㅓ.
      expect(computeNextKey(prompt('컴퓨터'), makeAutomaton('컴', 'ㅍ', 'ㅠ', 'ㅌ'))).toEqual({
        code: 'KeyJ',
        shift: false,
      })
    })
  })
})

describe('computeNextJamo', () => {
  it('returns null when prompt is null', () => {
    expect(computeNextJamo(null, createInitialState())).toBeNull()
  })

  it('returns null when committed length equals prompt length', () => {
    expect(computeNextJamo(prompt('가'), makeAutomaton('가', null, null, null))).toBeNull()
  })

  it('returns null for non-Hangul target (space)', () => {
    expect(computeNextJamo(prompt('한 국'), makeAutomaton('한', null, null, null))).toBeNull()
  })

  it('returns cho for fresh syllable (가 → ㄱ)', () => {
    expect(computeNextJamo(prompt('가'), createInitialState())).toBe('ㄱ')
  })

  it('returns jung for simple vowel (가, cho typed → ㅏ)', () => {
    expect(computeNextJamo(prompt('가'), makeAutomaton('', 'ㄱ', null, null))).toBe('ㅏ')
  })

  it('returns first component of compound vowel (봐, cho typed → ㅗ)', () => {
    expect(computeNextJamo(prompt('봐'), makeAutomaton('', 'ㅂ', null, null))).toBe('ㅗ')
  })

  it('returns second component of compound vowel (봐, jung=ㅗ → ㅏ)', () => {
    expect(computeNextJamo(prompt('봐'), makeAutomaton('', 'ㅂ', 'ㅗ', null))).toBe('ㅏ')
  })

  it('returns simple jong (한, jung typed → ㄴ)', () => {
    expect(computeNextJamo(prompt('한'), makeAutomaton('', 'ㅎ', 'ㅏ', null))).toBe('ㄴ')
  })

  it('returns first component of compound jong (닭, jung typed → ㄹ)', () => {
    expect(computeNextJamo(prompt('닭'), makeAutomaton('', 'ㄷ', 'ㅏ', null))).toBe('ㄹ')
  })

  it('returns second component of compound jong (닭, jong=ㄹ → ㄱ)', () => {
    expect(computeNextJamo(prompt('닭'), makeAutomaton('', 'ㄷ', 'ㅏ', 'ㄹ'))).toBe('ㄱ')
  })

  it('returns next syllable cho when current syllable is complete (가나, fully typed 가 → ㄴ)', () => {
    expect(computeNextJamo(prompt('가나'), makeAutomaton('', 'ㄱ', 'ㅏ', null))).toBe('ㄴ')
  })

  it('returns jung of next syllable when tentative jong matches its cho (가족, jong=ㅈ → ㅗ)', () => {
    expect(computeNextJamo(prompt('가족'), makeAutomaton('', 'ㄱ', 'ㅏ', 'ㅈ'))).toBe('ㅗ')
  })

  it('returns null when current syllable is the last and fully typed (가, fully typed)', () => {
    expect(computeNextJamo(prompt('가'), makeAutomaton('', 'ㄱ', 'ㅏ', null))).toBeNull()
  })
})
