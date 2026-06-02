/** 統計の内部状態。 */
export interface StatsState {
  /** 総打鍵数（正誤問わず）。 */
  totalKeystrokes: number;
  /** 正打鍵数。 */
  correctKeystrokes: number;
  /** 確定した音節数。 */
  confirmedSyllables: number;
  /** 確定した文字数（WPM の 5文字=1語換算に使用）。 */
  confirmedChars: number;
  /** 最初の打鍵時刻（ミリ秒）。未開始なら null。 */
  startedAt: number | null;
}

/** 任意の時点で取得できる統計スナップショット。 */
export interface StatsSnapshot {
  /** 타수 (CPM, 字母打/分)。 */
  cpm: number;
  /** WPM 参考値（확정음절 ÷ 5 語換算）。 */
  wpm: number;
  /** 正確度 0–100 (%)。打鍵がなければ 100。 */
  accuracy: number;
  /** 最初の打鍵からの経過ミリ秒。 */
  elapsedMs: number;
}

/** 初期状態を生成する。 */
export function createStats(): StatsState {
  return {
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    confirmedSyllables: 0,
    confirmedChars: 0,
    startedAt: null,
  };
}

/**
 * 打鍵を記録する。最初の打鍵で計測を開始する。
 *
 * @param state 現在の統計状態
 * @param correct この打鍵が正打鍵かどうか
 * @param now 現在時刻（ミリ秒）。省略時は `Date.now()`
 */
export function recordKeystroke(
  state: StatsState,
  correct: boolean,
  now: number = Date.now(),
): StatsState {
  return {
    ...state,
    totalKeystrokes: state.totalKeystrokes + 1,
    correctKeystrokes: state.correctKeystrokes + (correct ? 1 : 0),
    startedAt: state.startedAt ?? now,
  };
}

/**
 * 音節確定を記録する。
 *
 * @param state 現在の統計状態
 * @param syllableLength 確定した文字列の文字数（既定 1）
 */
export function recordSyllable(
  state: StatsState,
  syllableLength: number = 1,
): StatsState {
  return {
    ...state,
    confirmedSyllables: state.confirmedSyllables + 1,
    confirmedChars: state.confirmedChars + syllableLength,
  };
}

/**
 * 現時点の統計スナップショットを計算する。
 *
 * @param state 統計状態
 * @param now 現在時刻（ミリ秒）。省略時は `Date.now()`
 */
export function computeStats(
  state: StatsState,
  now: number = Date.now(),
): StatsSnapshot {
  const elapsedMs = state.startedAt != null ? Math.max(0, now - state.startedAt) : 0;
  const elapsedMin = elapsedMs / 60_000;

  const cpm =
    elapsedMin > 0 ? Math.round(state.totalKeystrokes / elapsedMin) : 0;

  // WPM: 確定文字数 / 5 語換算
  const wpm =
    elapsedMin > 0 ? Math.round(state.confirmedChars / 5 / elapsedMin) : 0;

  const accuracy =
    state.totalKeystrokes > 0
      ? Math.round((state.correctKeystrokes / state.totalKeystrokes) * 100)
      : 100;

  return { cpm, wpm, accuracy, elapsedMs };
}
