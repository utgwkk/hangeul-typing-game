import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  inputJamo,
  inputJamos,
  inputLiteral,
  backspace,
  commit,
  getValue,
  renderSyllable,
  decomposeSyllable,
  isVowel,
  isConsonant,
} from '../automaton';

/** Type a string of jamo from scratch and return the rendered value. */
function type(jamos: string): string {
  return getValue(inputJamos(createInitialState(), Array.from(jamos)));
}

describe('isVowel / isConsonant', () => {
  it('classifies vowels', () => {
    expect(isVowel('ㅏ')).toBe(true);
    expect(isVowel('ㄱ')).toBe(false);
  });

  it('classifies consonants', () => {
    expect(isConsonant('ㄱ')).toBe(true);
    expect(isConsonant('ㅏ')).toBe(false);
  });
});

describe('basic composition', () => {
  it('composes 가 (ㄱ+ㅏ)', () => {
    expect(type('ㄱㅏ')).toBe('가');
  });

  it('composes 한 (ㅎ+ㅏ+ㄴ)', () => {
    expect(type('ㅎㅏㄴ')).toBe('한');
  });

  it('composes 한글 (ㅎㅏㄴㄱㅡㄹ)', () => {
    expect(type('ㅎㅏㄴㄱㅡㄹ')).toBe('한글');
  });

  it('renders a lone 초성', () => {
    expect(type('ㄱ')).toBe('ㄱ');
  });

  it('renders a lone 중성', () => {
    expect(type('ㅏ')).toBe('ㅏ');
  });
});

describe('종성 → 초성 raising (繰り上がり)', () => {
  it('간 + ㅏ → 가나', () => {
    expect(type('ㄱㅏㄴㅏ')).toBe('가나');
  });

  it('keeps 받침 when followed by a consonant that cannot combine', () => {
    // ㅎㅏㄴ + ㄱ → 한 + ㄱ(초성) → ㅡ → ㄹ = 한글
    expect(type('ㅎㅏㄴㄱ')).toBe('한ㄱ');
  });

  it('겹받침: only the second jamo is raised by a following vowel', () => {
    // 닭 (ㄷㅏㄺ) + ㅏ → 달 + 가 = 달가
    expect(type('ㄷㅏㄹㄱㅏ')).toBe('달가');
  });
});

describe('겹받침 (compound final consonant)', () => {
  it('composes 닭 (ㄷ+ㅏ+ㄹ+ㄱ → ㄺ)', () => {
    expect(type('ㄷㅏㄹㄱ')).toBe('닭');
  });

  it('composes 값 (ㄱ+ㅏ+ㅂ+ㅅ → ㅄ)', () => {
    expect(type('ㄱㅏㅂㅅ')).toBe('값');
  });

  it('starts a new syllable when 받침 cannot combine', () => {
    // 한 (ㅎㅏㄴ) + ㄷ → ㄷ cannot combine with ㄴ → "한ㄷ"
    expect(type('ㅎㅏㄴㄷ')).toBe('한ㄷ');
  });
});

describe('복합모음 (compound vowel)', () => {
  it('composes ㅚ from ㅗ+ㅣ → 괴', () => {
    expect(type('ㄱㅗㅣ')).toBe('괴');
  });

  it('composes 과 (ㄱ+ㅘ)', () => {
    expect(type('ㄱㅗㅏ')).toBe('과');
  });

  it('lone 복합모음 ㅚ', () => {
    expect(type('ㅗㅣ')).toBe('ㅚ');
  });

  it('non-combinable vowels start a new syllable', () => {
    // ㅏ + ㅓ do not combine
    expect(type('ㅏㅓ')).toBe('ㅏㅓ');
  });
});

describe('backspace (IME-style decomposition)', () => {
  it('removes a 종성 first', () => {
    let s = inputJamos(createInitialState(), Array.from('ㅎㅏㄴ'));
    s = backspace(s);
    expect(getValue(s)).toBe('하');
  });

  it('decomposes a 겹받침 to its first component', () => {
    let s = inputJamos(createInitialState(), Array.from('ㄷㅏㄹㄱ')); // 닭
    s = backspace(s);
    expect(getValue(s)).toBe('달');
  });

  it('decomposes a 복합모음 to its base', () => {
    let s = inputJamos(createInitialState(), Array.from('ㄱㅗㅣ')); // 괴
    s = backspace(s);
    expect(getValue(s)).toBe('고');
  });

  it('removes a lone 초성, leaving nothing', () => {
    let s = inputJamo(createInitialState(), 'ㄱ');
    s = backspace(s);
    expect(getValue(s)).toBe('');
  });

  it('reopens the last committed syllable', () => {
    let s = inputJamos(createInitialState(), Array.from('ㄱㅏㄴㅏ')); // 가나
    s = backspace(s); // remove ㅏ of 나 → 가ㄴ
    expect(getValue(s)).toBe('가ㄴ');
    s = backspace(s); // remove ㄴ → 가
    expect(getValue(s)).toBe('가');
  });

  it('does nothing on empty state', () => {
    const s = backspace(createInitialState());
    expect(getValue(s)).toBe('');
  });
});

describe('commit / inputLiteral', () => {
  it('commit finalizes the in-progress syllable', () => {
    let s = inputJamos(createInitialState(), Array.from('ㄱㅏ'));
    s = commit(s);
    expect(s.committed).toBe('가');
    expect(getValue(s)).toBe('가');
  });

  it('inputLiteral inserts a space and finalizes', () => {
    let s = inputJamos(createInitialState(), Array.from('ㄱㅏ'));
    s = inputLiteral(s, ' ');
    s = inputJamos(s, Array.from('ㄴㅏ'));
    expect(getValue(s)).toBe('가 나');
  });

  it('backspace can delete a committed literal', () => {
    let s = inputJamos(createInitialState(), Array.from('ㄱㅏ'));
    s = inputLiteral(s, ' ');
    s = backspace(s);
    expect(getValue(s)).toBe('가');
  });
});

describe('helpers', () => {
  it('renderSyllable handles partial states', () => {
    expect(renderSyllable({ cho: 'ㄱ', jung: null, jong: null })).toBe('ㄱ');
    expect(renderSyllable({ cho: null, jung: 'ㅏ', jong: null })).toBe('ㅏ');
    expect(renderSyllable({ cho: 'ㄱ', jung: 'ㅏ', jong: 'ㄴ' })).toBe('간');
  });

  it('decomposeSyllable round-trips a syllable', () => {
    expect(decomposeSyllable('한')).toEqual({ cho: 'ㅎ', jung: 'ㅏ', jong: 'ㄴ' });
    expect(decomposeSyllable('가')).toEqual({ cho: 'ㄱ', jung: 'ㅏ', jong: null });
  });

  it('decomposeSyllable returns null for non-syllables', () => {
    expect(decomposeSyllable('ㄱ')).toBeNull();
    expect(decomposeSyllable('a')).toBeNull();
  });
});
