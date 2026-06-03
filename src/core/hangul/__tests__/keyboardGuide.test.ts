import { describe, it, expect } from 'vitest';
import { syllableToKeys, countEnteredKeys } from '../keyboardGuide';

describe('syllableToKeys', () => {
  it('単純な音節: 안 → dks', () => {
    expect(syllableToKeys('안')).toBe('dks');
  });

  it('単純な音節: 녕 → sud', () => {
    expect(syllableToKeys('녕')).toBe('sud');
  });

  it('単語連結: 안녕 の各文字', () => {
    expect(['안', '녕'].map(syllableToKeys).join('')).toBe('dkssud');
  });

  it('激音（ㅃ）: 빠 → Qk（大文字）', () => {
    expect(syllableToKeys('빠')).toBe('Qk');
  });

  it('激音確認: 아빠 の各文字', () => {
    expect(['아', '빠'].map(syllableToKeys).join('')).toBe('dkQk');
  });

  it('複合母音: 봐（ㅂ+ㅘ→ㅗ+ㅏ）', () => {
    expect(syllableToKeys('봐')).toBe('qhk');
  });

  it('終声あり: 밥 → qkq', () => {
    expect(syllableToKeys('밥')).toBe('qkq');
  });

  it('スペースは⎵を返す', () => {
    expect(syllableToKeys(' ')).toBe('⎵');
  });

  it('激音 ㄸ: 떡 → Ejr', () => {
    expect(syllableToKeys('떡')).toBe('Ejr');
  });

  it('겹받침（複合終声）: 닭（ㄷ+ㅏ+ㄺ）→ ekfr', () => {
    // ㄺ = ㄹ(f) + ㄱ(r)
    expect(syllableToKeys('닭')).toBe('ekfr');
  });
});

describe('countEnteredKeys', () => {
  it('空状態は0', () => {
    expect(countEnteredKeys({ cho: null, jung: null, jong: null })).toBe(0);
  });

  it('초성のみ: {cho: ㅇ} → 1', () => {
    expect(countEnteredKeys({ cho: 'ㅇ', jung: null, jong: null })).toBe(1);
  });

  it('초성+중성: {cho: ㅇ, jung: ㅏ} → 2', () => {
    expect(countEnteredKeys({ cho: 'ㅇ', jung: 'ㅏ', jong: null })).toBe(2);
  });

  it('초성+단순중성+종성: {cho: ㄴ, jung: ㅕ, jong: ㅇ} → 3', () => {
    expect(countEnteredKeys({ cho: 'ㄴ', jung: 'ㅕ', jong: 'ㅇ' })).toBe(3);
  });

  it('복합모음（ㅘ）は2打鍵: {cho: ㅂ, jung: ㅘ} → 3', () => {
    // ㅘ = ㅗ(h) + ㅏ(k) = 2打鍵
    expect(countEnteredKeys({ cho: 'ㅂ', jung: 'ㅘ', jong: null })).toBe(3);
  });

  it('겹받침（ㄺ）は2打鍵: {cho: ㄷ, jung: ㅏ, jong: ㄺ} → 4', () => {
    // ㄺ = ㄹ(f) + ㄱ(r) = 2打鍵
    expect(countEnteredKeys({ cho: 'ㄷ', jung: 'ㅏ', jong: 'ㄺ' })).toBe(4);
  });
});
