// 입력 오토마톤 (input automaton)
// Assembles a stream of jamo (자모) into Hangul syllables, mimicking the
// behaviour of a Korean (2벌식) IME. Pure, React-independent module driven by
// the `useHangulInput` hook.

import {
  CHOSEONG,
  JUNGSEONG,
  JONGSEONG,
  composeSyllable,
  composeVowel,
  composeConsonant,
  decomposeVowel,
  decomposeConsonant,
} from './jamoTables';

/** A syllable being composed. `null` means the slot is empty. */
export interface SyllableState {
  cho: string | null;
  jung: string | null;
  jong: string | null;
}

/** Full automaton state: finalized text plus the syllable in composition. */
export interface AutomatonState {
  /** Finalized (확정) text. */
  committed: string;
  /** The single syllable currently being assembled. */
  current: SyllableState;
}

const EMPTY_SYLLABLE: SyllableState = { cho: null, jung: null, jong: null };

/** Create a fresh, empty automaton state. */
export function createInitialState(): AutomatonState {
  return { committed: '', current: { ...EMPTY_SYLLABLE } };
}

/** True if the jamo is a vowel (중성). */
export function isVowel(jamo: string): boolean {
  return (JUNGSEONG as readonly string[]).includes(jamo);
}

/** True if the jamo is a consonant usable as 초성. */
export function isConsonant(jamo: string): boolean {
  return (CHOSEONG as readonly string[]).includes(jamo);
}

/** True if the jamo can be used as a 종성 (final consonant). */
function canBeJongseong(jamo: string): boolean {
  return (JONGSEONG as readonly string[]).includes(jamo);
}

function isEmpty(s: SyllableState): boolean {
  return s.cho === null && s.jung === null && s.jong === null;
}

/** Render one syllable state to a string (full block, or partial jamo). */
export function renderSyllable(s: SyllableState): string {
  if (isEmpty(s)) return '';
  if (s.cho !== null && s.jung !== null) {
    const ci = (CHOSEONG as readonly string[]).indexOf(s.cho);
    const vi = (JUNGSEONG as readonly string[]).indexOf(s.jung);
    const ji = s.jong !== null ? (JONGSEONG as readonly string[]).indexOf(s.jong) : 0;
    if (ci >= 0 && vi >= 0 && ji >= 0) {
      return composeSyllable(ci, vi, ji);
    }
  }
  // Partial composition (lone 초성, lone 중성, …): just concatenate.
  return (s.cho ?? '') + (s.jung ?? '') + (s.jong ?? '');
}

/** Decompose a precomposed Hangul syllable into its jamo, or null if not one. */
export function decomposeSyllable(ch: string): SyllableState | null {
  const code = ch.codePointAt(0);
  if (code === undefined || code < 0xac00 || code > 0xd7a3) return null;
  const index = code - 0xac00;
  const ji = index % 28;
  const vi = Math.floor(index / 28) % 21;
  const ci = Math.floor(index / 588);
  return {
    cho: CHOSEONG[ci],
    jung: JUNGSEONG[vi],
    jong: ji === 0 ? null : JONGSEONG[ji],
  };
}

/** The full rendered value: committed text plus the syllable in composition. */
export function getValue(state: AutomatonState): string {
  return state.committed + renderSyllable(state.current);
}

function withCurrent(
  state: AutomatonState,
  current: SyllableState,
): AutomatonState {
  return { committed: state.committed, current };
}

/** Push the current syllable into committed text and start a new syllable. */
function flushWith(
  state: AutomatonState,
  next: SyllableState,
): AutomatonState {
  return {
    committed: state.committed + renderSyllable(state.current),
    current: next,
  };
}

/** Finalize any in-progress syllable into committed text. */
export function commit(state: AutomatonState): AutomatonState {
  if (isEmpty(state.current)) return state;
  return {
    committed: state.committed + renderSyllable(state.current),
    current: { ...EMPTY_SYLLABLE },
  };
}

/** Append an arbitrary literal (e.g. space or punctuation), flushing first. */
export function inputLiteral(
  state: AutomatonState,
  literal: string,
): AutomatonState {
  const flushed = commit(state);
  return {
    committed: flushed.committed + literal,
    current: { ...EMPTY_SYLLABLE },
  };
}

function inputVowel(state: AutomatonState, vowel: string): AutomatonState {
  const cur = state.current;

  // A final consonant exists → raise it to the 초성 of a new syllable.
  if (cur.jong !== null) {
    const parts = decomposeConsonant(cur.jong);
    if (parts) {
      // 겹받침: only the second component is raised.
      const [first, second] = parts;
      const finished: SyllableState = { cho: cur.cho, jung: cur.jung, jong: first };
      return {
        committed: state.committed + renderSyllable(finished),
        current: { cho: second, jung: vowel, jong: null },
      };
    }
    const raised = cur.jong;
    const finished: SyllableState = { cho: cur.cho, jung: cur.jung, jong: null };
    return {
      committed: state.committed + renderSyllable(finished),
      current: { cho: raised, jung: vowel, jong: null },
    };
  }

  // No 종성. Try to combine with an existing 중성 (복합모음).
  if (cur.jung !== null) {
    const compound = composeVowel(cur.jung, vowel);
    if (compound) {
      return withCurrent(state, { ...cur, jung: compound });
    }
    // Not combinable → start a fresh syllable holding only this vowel.
    return flushWith(state, { cho: null, jung: vowel, jong: null });
  }

  // 초성 only, or empty → attach the vowel as 중성.
  return withCurrent(state, { ...cur, jung: vowel });
}

function inputConsonant(
  state: AutomatonState,
  consonant: string,
): AutomatonState {
  const cur = state.current;

  // Already has a 종성 → try forming a 겹받침.
  if (cur.jong !== null) {
    const compound = composeConsonant(cur.jong, consonant);
    if (compound) {
      return withCurrent(state, { ...cur, jong: compound });
    }
    return flushWith(state, { cho: consonant, jung: null, jong: null });
  }

  // Has a 중성 → attach as 종성 if the consonant is a valid final.
  if (cur.jung !== null) {
    if (canBeJongseong(consonant)) {
      return withCurrent(state, { ...cur, jong: consonant });
    }
    return flushWith(state, { cho: consonant, jung: null, jong: null });
  }

  // Has a lone 초성 (two consonants in a row) → start a new syllable.
  if (cur.cho !== null) {
    return flushWith(state, { cho: consonant, jung: null, jong: null });
  }

  // Empty → this consonant becomes the 초성.
  return withCurrent(state, { ...cur, cho: consonant });
}

/** Feed a single jamo into the automaton. */
export function inputJamo(state: AutomatonState, jamo: string): AutomatonState {
  if (isVowel(jamo)) return inputVowel(state, jamo);
  if (isConsonant(jamo)) return inputConsonant(state, jamo);
  // Unknown character: treat as a literal.
  return inputLiteral(state, jamo);
}

/** Convenience: feed a sequence of jamo. */
export function inputJamos(
  state: AutomatonState,
  jamos: readonly string[],
): AutomatonState {
  return jamos.reduce(inputJamo, state);
}

/** Delete one jamo unit, IME-style (partial decomposition). */
export function backspace(state: AutomatonState): AutomatonState {
  const cur = state.current;

  if (cur.jong !== null) {
    const parts = decomposeConsonant(cur.jong);
    return withCurrent(state, { ...cur, jong: parts ? parts[0] : null });
  }

  if (cur.jung !== null) {
    const parts = decomposeVowel(cur.jung);
    return withCurrent(state, { ...cur, jung: parts ? parts[0] : null });
  }

  if (cur.cho !== null) {
    return withCurrent(state, { ...cur, cho: null });
  }

  // Current syllable is empty → pull the last committed character back in.
  if (state.committed.length > 0) {
    const chars = Array.from(state.committed);
    const last = chars[chars.length - 1];
    const head = chars.slice(0, -1).join('');
    const decomposed = decomposeSyllable(last);
    if (decomposed) {
      // Re-open the syllable and remove its last jamo.
      return backspace({ committed: head, current: decomposed });
    }
    // Plain character (space, punctuation, lone jamo): just drop it.
    return { committed: head, current: { ...EMPTY_SYLLABLE } };
  }

  return state;
}
