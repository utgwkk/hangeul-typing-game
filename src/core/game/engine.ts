// ゲームエンジン: お題の出題・判定・進行管理
// Pure, React-independent module driven by the `useGameEngine` hook.

import type { Prompt } from '../../data/types';
import type { ModeConfig, ProgressCondition } from './modes';
import { buildQuestionList } from './modes';

/** Display status of each character in the active prompt. */
export type CharStatus = 'correct' | 'composing' | 'pending' | 'wrong';

export interface EngineState {
  /** All questions for this session (already ordered/shuffled). */
  questions: readonly Prompt[];
  /** Index of the active question. */
  questionIndex: number;
  /** Progress condition carried from the mode config. */
  progress: ProgressCondition;
  /** True when the session is complete (questionCount mode only). */
  finished: boolean;
}

/** Create a new engine state from a mode config. */
export function createEngine(
  config: ModeConfig,
  random: () => number = Math.random,
): EngineState {
  const questions = buildQuestionList(config, random);
  return {
    questions,
    questionIndex: 0,
    progress: config.progress,
    finished: questions.length === 0,
  };
}

/** Returns the active prompt, or null when the session is finished. */
export function currentPrompt(state: EngineState): Prompt | null {
  if (state.finished || state.questionIndex >= state.questions.length) return null;
  return state.questions[state.questionIndex];
}

/**
 * Compute the display status of each Unicode character in the prompt.
 *
 * @param promptText Target string (e.g. "한글")
 * @param committed  Characters confirmed by the automaton
 * @param composing  Currently composing syllable rendered as a string (e.g. "그")
 */
export function computeCharStatuses(
  promptText: string,
  committed: string,
  composing: string,
): CharStatus[] {
  const promptChars = Array.from(promptText);
  const committedChars = Array.from(committed);

  return promptChars.map((promptChar, i) => {
    if (i < committedChars.length) {
      return committedChars[i] === promptChar ? 'correct' : 'wrong';
    }
    if (i === committedChars.length && composing !== '') {
      return 'composing';
    }
    return 'pending';
  });
}

/**
 * Whether the automaton's current output matches the prompt exactly.
 * Checked against `committed + composing` so that a composing syllable
 * that already renders to the last prompt character counts as complete
 * (the caller should commit the automaton state before advancing).
 */
export function isQuestionComplete(
  promptText: string,
  committed: string,
  composing: string,
): boolean {
  return committed + composing === promptText;
}

/**
 * Whether any committed character diverges from the prompt.
 * Used to trigger wrong-input feedback (e.g. red flash on the virtual keyboard).
 */
export function hasWrongInput(promptText: string, committed: string): boolean {
  const promptChars = Array.from(promptText);
  const committedChars = Array.from(committed);
  if (committedChars.length > promptChars.length) return true;
  return committedChars.some((c, i) => c !== promptChars[i]);
}

/**
 * Advance to the next question and return the updated state.
 *
 * - questionCount mode: increments the index; sets `finished` when the last
 *   question has been answered.
 * - timeLimit mode: wraps around so the session runs until the external timer fires.
 */
export function advanceQuestion(state: EngineState): EngineState {
  if (state.finished) return state;
  const nextIndex = state.questionIndex + 1;

  if (state.progress.type === 'questionCount') {
    const finished = nextIndex >= state.questions.length;
    return { ...state, questionIndex: nextIndex, finished };
  }

  // timeLimit: cycle indefinitely
  const wrappedIndex =
    state.questions.length > 0 ? nextIndex % state.questions.length : 0;
  return { ...state, questionIndex: wrappedIndex };
}
