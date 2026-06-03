import { describe, it, expect } from 'vitest';
import {
  MODES,
  MODE_IDS,
  getMode,
  buildQuestionList,
  type ModeId,
} from '../modes';

describe('MODES', () => {
  it('defines all three modes', () => {
    expect(MODE_IDS).toEqual(['syllable', 'word', 'sentence']);
    for (const id of MODE_IDS) {
      expect(MODES[id].id).toBe(id);
    }
  });

  it('each mode has a non-empty prompt source', () => {
    for (const id of MODE_IDS) {
      expect(MODES[id].prompts.length).toBeGreaterThan(0);
    }
  });

  it('word prompts carry meaning aids', () => {
    const word = MODES.word.prompts[0];
    expect(word.meaning?.ja).toBeTruthy();
  });

  it('syllable prompts are single characters', () => {
    for (const p of MODES.syllable.prompts) {
      expect([...p.text]).toHaveLength(1);
    }
  });
});

describe('getMode', () => {
  it('returns the config for the given id', () => {
    for (const id of MODE_IDS) {
      expect(getMode(id)).toBe(MODES[id]);
    }
  });
});

describe('buildQuestionList', () => {
  it('sequential mode keeps source order', () => {
    const mode = {
      id: 'sentence' as ModeId,
      prompts: [{ text: '안녕' }, { text: '감사' }, { text: '사랑' }],
      selection: 'sequential' as const,
      progress: { type: 'questionCount' as const, count: 2 },
    };
    const list = buildQuestionList(mode);
    expect(list).toHaveLength(2);
    expect(list.map((p) => p.text)).toEqual(['안녕', '감사']);
  });

  it('questionCount mode returns exactly count items', () => {
    const mode = {
      id: 'word' as ModeId,
      prompts: [{ text: '물' }, { text: '불' }, { text: '산' }],
      selection: 'random' as const,
      progress: { type: 'questionCount' as const, count: 2 },
    };
    const list = buildQuestionList(mode);
    expect(list).toHaveLength(2);
  });

  it('repeats the source to fill count when there are too few prompts', () => {
    const mode = {
      id: 'syllable' as ModeId,
      prompts: [{ text: '가' }, { text: '나' }],
      selection: 'sequential' as const,
      progress: { type: 'questionCount' as const, count: 5 },
    };
    const list = buildQuestionList(mode);
    expect(list.map((p) => p.text)).toEqual(['가', '나', '가', '나', '가']);
  });

  it('timeLimit mode returns the full source', () => {
    const mode = MODES.syllable; // timeLimit:60
    const list = buildQuestionList(mode);
    expect(list).toHaveLength(mode.prompts.length);
  });

  it('random selection is deterministic with an injected RNG', () => {
    const seq = [0.9, 0.1, 0.5, 0.3, 0.7];
    let i = 0;
    const rng = () => seq[i++ % seq.length];
    const a = buildQuestionList(MODES.word, rng);
    i = 0;
    const b = buildQuestionList(MODES.word, rng);
    expect(a.map((p) => p.text)).toEqual(b.map((p) => p.text));
  });

  it('returns a permutation of the source for timeLimit random mode', () => {
    const sorted = (arr: string[]) => [...arr].sort();
    const list = buildQuestionList(MODES.syllable, () => 0.42);
    expect(sorted(list.map((p) => p.text))).toEqual(
      sorted([...MODES.syllable.prompts].map((p) => p.text)),
    );
  });
});
