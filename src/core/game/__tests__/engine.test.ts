import { describe, it, expect } from 'vitest';
import {
  createEngine,
  currentPrompt,
  computeCharStatuses,
  isQuestionComplete,
  hasWrongInput,
  advanceQuestion,
} from '../engine';
import type { ModeConfig } from '../modes';

// Minimal fixed prompts for deterministic tests.
const FIXED_PROMPTS = [{ text: '가' }, { text: '나' }, { text: '다' }] as const;

const countMode = (count: number): ModeConfig => ({
  id: 'syllable',
  prompts: FIXED_PROMPTS,
  selection: 'sequential',
  progress: { type: 'questionCount', count },
  comboExtension: null,
});

const timeLimitMode = (seconds: number): ModeConfig => ({
  id: 'syllable',
  prompts: FIXED_PROMPTS,
  selection: 'sequential',
  progress: { type: 'timeLimit', seconds },
  comboExtension: null,
});

// ─── createEngine ────────────────────────────────────────────────────────────

describe('createEngine', () => {
  it('initializes with questionIndex 0 and not finished', () => {
    const state = createEngine(countMode(3));
    expect(state.questionIndex).toBe(0);
    expect(state.finished).toBe(false);
  });

  it('finishes immediately when there are no prompts', () => {
    const mode: ModeConfig = {
      id: 'syllable',
      prompts: [],
      selection: 'sequential',
      progress: { type: 'questionCount', count: 5 },
      comboExtension: null,
    };
    expect(createEngine(mode).finished).toBe(true);
  });

  it('builds the correct number of questions for questionCount mode', () => {
    const state = createEngine(countMode(3));
    expect(state.questions.length).toBe(3);
  });

  it('returns all prompts for timeLimit mode', () => {
    const state = createEngine(timeLimitMode(60));
    expect(state.questions.length).toBe(FIXED_PROMPTS.length);
  });
});

// ─── currentPrompt ───────────────────────────────────────────────────────────

describe('currentPrompt', () => {
  it('returns the first prompt initially', () => {
    const state = createEngine(countMode(3));
    expect(currentPrompt(state)?.text).toBe('가');
  });

  it('returns the prompt at the current index', () => {
    let state = createEngine(countMode(3));
    state = advanceQuestion(state);
    expect(currentPrompt(state)?.text).toBe('나');
  });

  it('returns null when finished', () => {
    const mode: ModeConfig = {
      id: 'syllable',
      prompts: [],
      selection: 'sequential',
      progress: { type: 'questionCount', count: 5 },
      comboExtension: null,
    };
    expect(currentPrompt(createEngine(mode))).toBeNull();
  });
});

// ─── computeCharStatuses ─────────────────────────────────────────────────────

describe('computeCharStatuses', () => {
  it('marks all chars pending with no input', () => {
    expect(computeCharStatuses('한글', '', '')).toEqual(['pending', 'pending']);
  });

  it('marks correctly committed char as correct', () => {
    expect(computeCharStatuses('한글', '한', '')).toEqual(['correct', 'pending']);
  });

  it('marks wrongly committed char as wrong', () => {
    expect(computeCharStatuses('한글', '봐', '')).toEqual(['wrong', 'pending']);
  });

  it('marks composing position as composing', () => {
    expect(computeCharStatuses('한글', '', '하')).toEqual(['composing', 'pending']);
  });

  it('marks composing after committed correct chars', () => {
    expect(computeCharStatuses('한글', '한', '그')).toEqual(['correct', 'composing']);
  });

  it('marks all chars correct when fully committed', () => {
    expect(computeCharStatuses('한글', '한글', '')).toEqual(['correct', 'correct']);
  });

  it('handles single-char prompt with composing', () => {
    expect(computeCharStatuses('가', '', '가')).toEqual(['composing']);
  });

  it('works with multi-character prompt including spaces', () => {
    expect(computeCharStatuses('안 녕', '안 ', '녀')).toEqual([
      'correct',
      'correct',
      'composing',
    ]);
  });
});

// ─── isQuestionComplete ───────────────────────────────────────────────────────

describe('isQuestionComplete', () => {
  it('returns false with no input', () => {
    expect(isQuestionComplete('한글', '', '')).toBe(false);
  });

  it('returns true when committed matches prompt exactly', () => {
    expect(isQuestionComplete('한글', '한글', '')).toBe(true);
  });

  it('returns true when committed + composing equals prompt', () => {
    // Last syllable still composing but renders correctly
    expect(isQuestionComplete('한글', '한', '글')).toBe(true);
  });

  it('returns false when input is partial', () => {
    expect(isQuestionComplete('한글', '한', '')).toBe(false);
  });

  it('returns false when input overshoots', () => {
    expect(isQuestionComplete('한', '한글', '')).toBe(false);
  });

  it('returns false when committed is wrong', () => {
    expect(isQuestionComplete('한글', '봐', '')).toBe(false);
  });
});

// ─── hasWrongInput ────────────────────────────────────────────────────────────

describe('hasWrongInput', () => {
  it('returns false with no committed input', () => {
    expect(hasWrongInput('한글', '')).toBe(false);
  });

  it('returns false when committed chars are all correct', () => {
    expect(hasWrongInput('한글', '한')).toBe(false);
  });

  it('returns true when a committed char is wrong', () => {
    expect(hasWrongInput('한글', '봐')).toBe(true);
  });

  it('returns true when committed overshoots the prompt', () => {
    expect(hasWrongInput('한', '한글')).toBe(true);
  });

  it('returns false for fully correct committed text', () => {
    expect(hasWrongInput('한글', '한글')).toBe(false);
  });
});

// ─── advanceQuestion ─────────────────────────────────────────────────────────

describe('advanceQuestion', () => {
  it('advances to the next question', () => {
    const state = createEngine(countMode(3));
    const next = advanceQuestion(state);
    expect(next.questionIndex).toBe(1);
    expect(next.finished).toBe(false);
  });

  it('marks finished after the last question in questionCount mode', () => {
    let state = createEngine(countMode(3));
    state = advanceQuestion(state); // 0 → 1
    state = advanceQuestion(state); // 1 → 2
    state = advanceQuestion(state); // 2 → 3 (finished)
    expect(state.finished).toBe(true);
  });

  it('currentPrompt returns null once finished', () => {
    let state = createEngine(countMode(1));
    state = advanceQuestion(state);
    expect(currentPrompt(state)).toBeNull();
  });

  it('does not advance further when already finished', () => {
    let state = createEngine(countMode(1));
    state = advanceQuestion(state); // finished
    const stuck = advanceQuestion(state);
    expect(stuck.questionIndex).toBe(state.questionIndex);
    expect(stuck.finished).toBe(true);
  });

  it('cycles back to 0 after the last question in timeLimit mode', () => {
    const state = createEngine(timeLimitMode(60));
    const total = state.questions.length;
    let s = state;
    for (let i = 0; i < total; i++) {
      s = advanceQuestion(s);
    }
    expect(s.questionIndex).toBe(0);
    expect(s.finished).toBe(false);
  });

  it('never finishes in timeLimit mode', () => {
    let state = createEngine(timeLimitMode(60));
    for (let i = 0; i < 100; i++) {
      state = advanceQuestion(state);
    }
    expect(state.finished).toBe(false);
  });
});
