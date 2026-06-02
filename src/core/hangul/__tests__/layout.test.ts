import { describe, expect, it } from 'vitest';
import { DUBEOLSIK_MAP, JAMO_TO_KEY, jamoToKey, keyToJamo } from '../layout';

describe('DUBEOLSIK_MAP', () => {
  it('maps representative consonant keys without shift', () => {
    expect(DUBEOLSIK_MAP['KeyQ'][0]).toBe('ㅂ');
    expect(DUBEOLSIK_MAP['KeyW'][0]).toBe('ㅈ');
    expect(DUBEOLSIK_MAP['KeyR'][0]).toBe('ㄱ');
    expect(DUBEOLSIK_MAP['KeyA'][0]).toBe('ㅁ');
    expect(DUBEOLSIK_MAP['KeyS'][0]).toBe('ㄴ');
    expect(DUBEOLSIK_MAP['KeyZ'][0]).toBe('ㅋ');
  });

  it('maps representative vowel keys without shift', () => {
    expect(DUBEOLSIK_MAP['KeyH'][0]).toBe('ㅗ');
    expect(DUBEOLSIK_MAP['KeyJ'][0]).toBe('ㅓ');
    expect(DUBEOLSIK_MAP['KeyK'][0]).toBe('ㅏ');
    expect(DUBEOLSIK_MAP['KeyL'][0]).toBe('ㅣ');
    expect(DUBEOLSIK_MAP['KeyN'][0]).toBe('ㅜ');
    expect(DUBEOLSIK_MAP['KeyM'][0]).toBe('ㅡ');
  });

  it('maps shift variants for double consonants', () => {
    expect(DUBEOLSIK_MAP['KeyQ'][1]).toBe('ㅃ');
    expect(DUBEOLSIK_MAP['KeyW'][1]).toBe('ㅉ');
    expect(DUBEOLSIK_MAP['KeyE'][1]).toBe('ㄸ');
    expect(DUBEOLSIK_MAP['KeyR'][1]).toBe('ㄲ');
    expect(DUBEOLSIK_MAP['KeyT'][1]).toBe('ㅆ');
  });

  it('maps shift variants for ㅒ and ㅖ', () => {
    expect(DUBEOLSIK_MAP['KeyO'][1]).toBe('ㅒ');
    expect(DUBEOLSIK_MAP['KeyP'][1]).toBe('ㅖ');
  });

  it('has null shift entry for keys without a shift variant', () => {
    expect(DUBEOLSIK_MAP['KeyA'][1]).toBeNull();
    expect(DUBEOLSIK_MAP['KeyH'][1]).toBeNull();
  });
});

describe('keyToJamo', () => {
  it('returns normal jamo when shift is false', () => {
    expect(keyToJamo('KeyQ', false)).toBe('ㅂ');
    expect(keyToJamo('KeyK', false)).toBe('ㅏ');
  });

  it('returns shifted jamo when shift is true', () => {
    expect(keyToJamo('KeyQ', true)).toBe('ㅃ');
    expect(keyToJamo('KeyO', true)).toBe('ㅒ');
    expect(keyToJamo('KeyP', true)).toBe('ㅖ');
  });

  it('returns undefined for shift on keys with no shift variant', () => {
    expect(keyToJamo('KeyA', true)).toBeUndefined();
    expect(keyToJamo('KeyH', true)).toBeUndefined();
  });

  it('returns undefined for unmapped codes', () => {
    expect(keyToJamo('KeyUnknown', false)).toBeUndefined();
    expect(keyToJamo('Digit1', false)).toBeUndefined();
  });
});

describe('jamoToKey', () => {
  it('returns code and shift=false for normal jamo', () => {
    expect(jamoToKey('ㅂ')).toEqual({ code: 'KeyQ', shift: false });
    expect(jamoToKey('ㅏ')).toEqual({ code: 'KeyK', shift: false });
    expect(jamoToKey('ㅗ')).toEqual({ code: 'KeyH', shift: false });
  });

  it('returns code and shift=true for shifted jamo', () => {
    expect(jamoToKey('ㅃ')).toEqual({ code: 'KeyQ', shift: true });
    expect(jamoToKey('ㄲ')).toEqual({ code: 'KeyR', shift: true });
    expect(jamoToKey('ㅒ')).toEqual({ code: 'KeyO', shift: true });
    expect(jamoToKey('ㅖ')).toEqual({ code: 'KeyP', shift: true });
  });

  it('returns undefined for unmapped jamo', () => {
    expect(jamoToKey('ㅘ')).toBeUndefined();
    expect(jamoToKey('ㄳ')).toBeUndefined();
    expect(jamoToKey('A')).toBeUndefined();
  });
});

describe('JAMO_TO_KEY completeness', () => {
  it('covers all 27 basic jamo (20 consonants + 7 vowels from normal keys) and 7 shifted jamo', () => {
    // All normal mappings should be present
    for (const [code, [normal]] of Object.entries(DUBEOLSIK_MAP)) {
      expect(JAMO_TO_KEY[normal]).toEqual({ code, shift: false });
    }
    // All shift mappings should be present
    for (const [code, [, shifted]] of Object.entries(DUBEOLSIK_MAP)) {
      if (shifted !== null) {
        expect(JAMO_TO_KEY[shifted]).toEqual({ code, shift: true });
      }
    }
  });
});
