import { describe, it, expect } from 'vitest';
import {
  CHOSEONG,
  JUNGSEONG,
  JONGSEONG,
  composeSyllable,
  composeVowel,
  composeConsonant,
  decomposeVowel,
  decomposeConsonant,
  COMPOUND_VOWEL_TABLE,
  COMPOUND_CONSONANT_TABLE,
  DECOMPOSE_COMPOUND_VOWEL,
  DECOMPOSE_COMPOUND_CONSONANT,
} from '../jamoTables';

describe('CHOSEONG', () => {
  it('has 19 entries', () => {
    expect(CHOSEONG).toHaveLength(19);
  });

  it('starts with ㄱ and ends with ㅎ', () => {
    expect(CHOSEONG[0]).toBe('ㄱ');
    expect(CHOSEONG[18]).toBe('ㅎ');
  });
});

describe('JUNGSEONG', () => {
  it('has 21 entries', () => {
    expect(JUNGSEONG).toHaveLength(21);
  });

  it('starts with ㅏ and ends with ㅣ', () => {
    expect(JUNGSEONG[0]).toBe('ㅏ');
    expect(JUNGSEONG[20]).toBe('ㅣ');
  });
});

describe('JONGSEONG', () => {
  it('has 28 entries', () => {
    expect(JONGSEONG).toHaveLength(28);
  });

  it('index 0 is empty string (no final consonant)', () => {
    expect(JONGSEONG[0]).toBe('');
  });

  it('contains ㄳ (compound) and ㅄ (compound)', () => {
    expect(JONGSEONG).toContain('ㄳ');
    expect(JONGSEONG).toContain('ㅄ');
  });
});

describe('composeSyllable', () => {
  it('composes 가 (ㄱ+ㅏ+없음)', () => {
    // ㄱ = choseong index 0, ㅏ = jungseong index 0, no jongseong = index 0
    expect(composeSyllable(0, 0, 0)).toBe('가');
  });

  it('composes 나 (ㄴ+ㅏ)', () => {
    // ㄴ = choseong index 2, ㅏ = jungseong index 0
    expect(composeSyllable(2, 0, 0)).toBe('나');
  });

  it('composes 한 (ㅎ+ㅏ+ㄴ)', () => {
    // ㅎ = choseong index 18, ㅏ = jungseong index 0, ㄴ = jongseong index 4
    expect(composeSyllable(18, 0, 4)).toBe('한');
  });

  it('composes 글 (ㄱ+ㅡ+ㄹ)', () => {
    // ㄱ = choseong index 0, ㅡ = jungseong index 18, ㄹ = jongseong index 8
    expect(composeSyllable(0, 18, 8)).toBe('글');
  });

  it('composes 닭 (ㄷ+ㅏ+ㄺ) — jongseong with 겹받침', () => {
    // ㄷ = choseong index 3, ㅏ = jungseong index 0, ㄺ = jongseong index 9
    expect(composeSyllable(3, 0, 9)).toBe('닭');
  });

  it('covers the full syllable range (first and last)', () => {
    // 가 = U+AC00
    expect(composeSyllable(0, 0, 0)).toBe('가');
    // 힣 = U+D7A3 (last modern Hangul syllable: choseong 18, jungseong 20, jongseong 27)
    expect(composeSyllable(18, 20, 27)).toBe('힣');
  });
});

describe('composeVowel', () => {
  it('ㅗ+ㅏ → ㅘ', () => {
    expect(composeVowel('ㅗ', 'ㅏ')).toBe('ㅘ');
  });

  it('ㅗ+ㅐ → ㅙ', () => {
    expect(composeVowel('ㅗ', 'ㅐ')).toBe('ㅙ');
  });

  it('ㅗ+ㅣ → ㅚ', () => {
    expect(composeVowel('ㅗ', 'ㅣ')).toBe('ㅚ');
  });

  it('ㅜ+ㅓ → ㅝ', () => {
    expect(composeVowel('ㅜ', 'ㅓ')).toBe('ㅝ');
  });

  it('ㅜ+ㅔ → ㅞ', () => {
    expect(composeVowel('ㅜ', 'ㅔ')).toBe('ㅞ');
  });

  it('ㅜ+ㅣ → ㅟ', () => {
    expect(composeVowel('ㅜ', 'ㅣ')).toBe('ㅟ');
  });

  it('ㅡ+ㅣ → ㅢ', () => {
    expect(composeVowel('ㅡ', 'ㅣ')).toBe('ㅢ');
  });

  it('non-combinable pair returns undefined', () => {
    expect(composeVowel('ㅏ', 'ㅣ')).toBeUndefined();
    expect(composeVowel('ㅗ', 'ㅓ')).toBeUndefined();
  });
});

describe('composeConsonant', () => {
  it('ㄱ+ㅅ → ㄳ', () => {
    expect(composeConsonant('ㄱ', 'ㅅ')).toBe('ㄳ');
  });

  it('ㄴ+ㅈ → ㄵ', () => {
    expect(composeConsonant('ㄴ', 'ㅈ')).toBe('ㄵ');
  });

  it('ㄴ+ㅎ → ㄶ', () => {
    expect(composeConsonant('ㄴ', 'ㅎ')).toBe('ㄶ');
  });

  it('ㄹ+ㄱ → ㄺ', () => {
    expect(composeConsonant('ㄹ', 'ㄱ')).toBe('ㄺ');
  });

  it('ㄹ+ㅁ → ㄻ', () => {
    expect(composeConsonant('ㄹ', 'ㅁ')).toBe('ㄻ');
  });

  it('ㄹ+ㅂ → ㄼ', () => {
    expect(composeConsonant('ㄹ', 'ㅂ')).toBe('ㄼ');
  });

  it('ㄹ+ㅅ → ㄽ', () => {
    expect(composeConsonant('ㄹ', 'ㅅ')).toBe('ㄽ');
  });

  it('ㄹ+ㅌ → ㄾ', () => {
    expect(composeConsonant('ㄹ', 'ㅌ')).toBe('ㄾ');
  });

  it('ㄹ+ㅍ → ㄿ', () => {
    expect(composeConsonant('ㄹ', 'ㅍ')).toBe('ㄿ');
  });

  it('ㄹ+ㅎ → ㅀ', () => {
    expect(composeConsonant('ㄹ', 'ㅎ')).toBe('ㅀ');
  });

  it('ㅂ+ㅅ → ㅄ', () => {
    expect(composeConsonant('ㅂ', 'ㅅ')).toBe('ㅄ');
  });

  it('non-combinable pair returns undefined', () => {
    expect(composeConsonant('ㄱ', 'ㄴ')).toBeUndefined();
    expect(composeConsonant('ㄱ', 'ㄱ')).toBeUndefined();
  });
});

describe('decomposeVowel', () => {
  it('ㅘ → [ㅗ, ㅏ]', () => {
    expect(decomposeVowel('ㅘ')).toEqual(['ㅗ', 'ㅏ']);
  });

  it('ㅙ → [ㅗ, ㅐ]', () => {
    expect(decomposeVowel('ㅙ')).toEqual(['ㅗ', 'ㅐ']);
  });

  it('ㅚ → [ㅗ, ㅣ]', () => {
    expect(decomposeVowel('ㅚ')).toEqual(['ㅗ', 'ㅣ']);
  });

  it('ㅝ → [ㅜ, ㅓ]', () => {
    expect(decomposeVowel('ㅝ')).toEqual(['ㅜ', 'ㅓ']);
  });

  it('ㅞ → [ㅜ, ㅔ]', () => {
    expect(decomposeVowel('ㅞ')).toEqual(['ㅜ', 'ㅔ']);
  });

  it('ㅟ → [ㅜ, ㅣ]', () => {
    expect(decomposeVowel('ㅟ')).toEqual(['ㅜ', 'ㅣ']);
  });

  it('ㅢ → [ㅡ, ㅣ]', () => {
    expect(decomposeVowel('ㅢ')).toEqual(['ㅡ', 'ㅣ']);
  });

  it('simple vowel returns undefined', () => {
    expect(decomposeVowel('ㅏ')).toBeUndefined();
    expect(decomposeVowel('ㅣ')).toBeUndefined();
  });
});

describe('decomposeConsonant', () => {
  it('ㄳ → [ㄱ, ㅅ]', () => {
    expect(decomposeConsonant('ㄳ')).toEqual(['ㄱ', 'ㅅ']);
  });

  it('ㄺ → [ㄹ, ㄱ]', () => {
    expect(decomposeConsonant('ㄺ')).toEqual(['ㄹ', 'ㄱ']);
  });

  it('ㅄ → [ㅂ, ㅅ]', () => {
    expect(decomposeConsonant('ㅄ')).toEqual(['ㅂ', 'ㅅ']);
  });

  it('simple consonant returns undefined', () => {
    expect(decomposeConsonant('ㄱ')).toBeUndefined();
    expect(decomposeConsonant('ㄹ')).toBeUndefined();
  });
});

describe('bidirectional round-trip', () => {
  it('compound vowels: compose → decompose is identity', () => {
    for (const [key, compound] of Object.entries(COMPOUND_VOWEL_TABLE)) {
      const [base, combining] = key.split('+');
      const decomposed = decomposeVowel(compound);
      expect(decomposed).toEqual([base, combining]);
    }
  });

  it('compound vowels: decompose → compose is identity', () => {
    for (const [compound, parts] of Object.entries(DECOMPOSE_COMPOUND_VOWEL)) {
      const composed = composeVowel(parts[0], parts[1]);
      expect(composed).toBe(compound);
    }
  });

  it('compound consonants: compose → decompose is identity', () => {
    for (const [key, compound] of Object.entries(COMPOUND_CONSONANT_TABLE)) {
      const [first, second] = key.split('+');
      const decomposed = decomposeConsonant(compound);
      expect(decomposed).toEqual([first, second]);
    }
  });

  it('compound consonants: decompose → compose is identity', () => {
    for (const [compound, parts] of Object.entries(DECOMPOSE_COMPOUND_CONSONANT)) {
      const composed = composeConsonant(parts[0], parts[1]);
      expect(composed).toBe(compound);
    }
  });
});
