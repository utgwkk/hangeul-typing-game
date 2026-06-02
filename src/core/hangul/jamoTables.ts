// 초성 (initial consonants) — 19 entries
export const CHOSEONG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
  'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const;

// 중성 (vowels) — 21 entries
export const JUNGSEONG = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ',
  'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ',
  'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ',
  'ㅡ', 'ㅢ', 'ㅣ',
] as const;

// 종성 (final consonants) — 28 entries; index 0 = no final consonant
export const JONGSEONG = [
  '',
  'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ',
  'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ',
  'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ',
  'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const;

export type Choseong = (typeof CHOSEONG)[number];
export type Jungseong = (typeof JUNGSEONG)[number];
export type Jongseong = (typeof JONGSEONG)[number];

/**
 * Compose a Hangul syllable block from indices.
 * Formula: 0xAC00 + (초성 × 588) + (중성 × 28) + 종성
 */
export function composeSyllable(
  choseongIndex: number,
  jungseongIndex: number,
  jongseongIndex: number,
): string {
  return String.fromCodePoint(
    0xac00 + choseongIndex * 588 + jungseongIndex * 28 + jongseongIndex,
  );
}

// 복합모음 (compound vowel) composition table: "base+combining" → compound
export const COMPOUND_VOWEL_TABLE: Readonly<Record<string, Jungseong>> = {
  'ㅗ+ㅏ': 'ㅘ',
  'ㅗ+ㅐ': 'ㅙ',
  'ㅗ+ㅣ': 'ㅚ',
  'ㅜ+ㅓ': 'ㅝ',
  'ㅜ+ㅔ': 'ㅞ',
  'ㅜ+ㅣ': 'ㅟ',
  'ㅡ+ㅣ': 'ㅢ',
};

// 겹받침 (compound final consonant) composition table: "first+second" → compound
export const COMPOUND_CONSONANT_TABLE: Readonly<Record<string, Jongseong>> = {
  'ㄱ+ㅅ': 'ㄳ',
  'ㄴ+ㅈ': 'ㄵ',
  'ㄴ+ㅎ': 'ㄶ',
  'ㄹ+ㄱ': 'ㄺ',
  'ㄹ+ㅁ': 'ㄻ',
  'ㄹ+ㅂ': 'ㄼ',
  'ㄹ+ㅅ': 'ㄽ',
  'ㄹ+ㅌ': 'ㄾ',
  'ㄹ+ㅍ': 'ㄿ',
  'ㄹ+ㅎ': 'ㅀ',
  'ㅂ+ㅅ': 'ㅄ',
};

// 복합모음 decomposition: compound vowel → [base, combining]
export const DECOMPOSE_COMPOUND_VOWEL: Readonly<Record<string, [Jungseong, Jungseong]>> = {
  'ㅘ': ['ㅗ', 'ㅏ'],
  'ㅙ': ['ㅗ', 'ㅐ'],
  'ㅚ': ['ㅗ', 'ㅣ'],
  'ㅝ': ['ㅜ', 'ㅓ'],
  'ㅞ': ['ㅜ', 'ㅔ'],
  'ㅟ': ['ㅜ', 'ㅣ'],
  'ㅢ': ['ㅡ', 'ㅣ'],
};

// 겹받침 decomposition: compound consonant → [first, second]
export const DECOMPOSE_COMPOUND_CONSONANT: Readonly<Record<string, [Jongseong, Jongseong]>> = {
  'ㄳ': ['ㄱ', 'ㅅ'],
  'ㄵ': ['ㄴ', 'ㅈ'],
  'ㄶ': ['ㄴ', 'ㅎ'],
  'ㄺ': ['ㄹ', 'ㄱ'],
  'ㄻ': ['ㄹ', 'ㅁ'],
  'ㄼ': ['ㄹ', 'ㅂ'],
  'ㄽ': ['ㄹ', 'ㅅ'],
  'ㄾ': ['ㄹ', 'ㅌ'],
  'ㄿ': ['ㄹ', 'ㅍ'],
  'ㅀ': ['ㄹ', 'ㅎ'],
  'ㅄ': ['ㅂ', 'ㅅ'],
};

/** Combine two vowels into a compound vowel, or return undefined if not combinable. */
export function composeVowel(base: string, combining: string): Jungseong | undefined {
  return COMPOUND_VOWEL_TABLE[`${base}+${combining}`];
}

/** Combine two consonants into a compound final consonant, or return undefined if not combinable. */
export function composeConsonant(first: string, second: string): Jongseong | undefined {
  return COMPOUND_CONSONANT_TABLE[`${first}+${second}`];
}

/** Decompose a compound vowel into its two components, or return undefined if not compound. */
export function decomposeVowel(vowel: string): [Jungseong, Jungseong] | undefined {
  return DECOMPOSE_COMPOUND_VOWEL[vowel];
}

/** Decompose a compound final consonant into its two components, or return undefined if not compound. */
export function decomposeConsonant(consonant: string): [Jongseong, Jongseong] | undefined {
  return DECOMPOSE_COMPOUND_CONSONANT[consonant];
}
