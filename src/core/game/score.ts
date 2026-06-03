/** 1 音節あたりの基本ポイント。 */
const BASE_POINTS = 10;

/** コンボ倍率のしきい値。 */
const COMBO_TIER_MAX = 30;
const COMBO_TIER_SUPER = 20;
const COMBO_TIER_HIGH = 10;
const COMBO_TIER_MID = 5;

/** 速度ボーナス: CPM が 100 増えるごとに +5 pt。 */
const SPEED_BONUS_PER_100_CPM = 5;

/** スコア / コンボ / タイマーの内部状態。 */
export interface ScoreState {
  /** 累計スコア。 */
  score: number;
  /** 現在のコンボ数。 */
  combo: number;
  /** セッション中の最大コンボ数。 */
  maxCombo: number;
  /** 正解音節数。 */
  correctSyllables: number;
  /** ゲーム開始時刻（ミリ秒）。未開始なら null。 */
  startedAt: number | null;
  /** 制限時間（ミリ秒）。null ならカウントアップモード。 */
  timeLimitMs: number | null;
}

/** タイマー情報のスナップショット。 */
export interface TimerSnapshot {
  /** 開始からの経過ミリ秒。 */
  elapsedMs: number;
  /** 残り時間（ミリ秒）。カウントアップモードなら null。 */
  remainingMs: number | null;
  /** 制限時間を超過しているか（カウントアップモードは常に false）。 */
  isExpired: boolean;
}

/**
 * コンボ数から倍率を返す。
 * - combo >= 30: 3.0x
 * - combo >= 20: 2.5x
 * - combo >= 10: 2.0x
 * - combo >= 5:  1.5x
 * - それ以外:    1.0x
 */
export function comboMultiplier(combo: number): number {
  if (combo >= COMBO_TIER_MAX) return 3.0;
  if (combo >= COMBO_TIER_SUPER) return 2.5;
  if (combo >= COMBO_TIER_HIGH) return 2.0;
  if (combo >= COMBO_TIER_MID) return 1.5;
  return 1.0;
}

/**
 * CPM から速度ボーナスを計算する。
 * CPM が 100 増えるごとに 5 pt 加算（小数切り捨て）。
 */
export function speedBonus(cpm: number): number {
  return Math.floor(cpm / 100) * SPEED_BONUS_PER_100_CPM;
}

/**
 * 初期スコア状態を生成する。
 *
 * @param timeLimitSeconds 制限時間（秒）。省略 or undefined でカウントアップモード。
 */
export function createScore(timeLimitSeconds?: number): ScoreState {
  return {
    score: 0,
    combo: 0,
    maxCombo: 0,
    correctSyllables: 0,
    startedAt: null,
    timeLimitMs: timeLimitSeconds != null ? timeLimitSeconds * 1000 : null,
  };
}

/**
 * ゲームを開始（最初の入力時）する。startedAt がすでにセットされていれば何もしない。
 *
 * @param state 現在のスコア状態
 * @param now 現在時刻（ミリ秒）。省略時は `Date.now()`
 */
export function startTimer(
  state: ScoreState,
  now: number = Date.now(),
): ScoreState {
  if (state.startedAt != null) return state;
  return { ...state, startedAt: now };
}

/**
 * 正解音節を記録し、コンボ・スコアを更新する。
 *
 * @param state 現在のスコア状態
 * @param cpm 現在の CPM（速度ボーナス算出に使用、省略時は 0）
 * @param syllableCount 完了した問題の音節数（省略時は 1）
 */
export function recordCorrect(state: ScoreState, cpm: number = 0, syllableCount: number = 1): ScoreState {
  const newCombo = state.combo + 1;
  const multiplier = comboMultiplier(newCombo);
  const points = Math.round(BASE_POINTS * syllableCount * multiplier) + speedBonus(cpm);
  return {
    ...state,
    score: state.score + points,
    combo: newCombo,
    maxCombo: Math.max(state.maxCombo, newCombo),
    correctSyllables: state.correctSyllables + 1,
  };
}

/**
 * 不正解を記録し、コンボをリセットする。スコアは変化しない。
 */
export function recordMiss(state: ScoreState): ScoreState {
  return { ...state, combo: 0 };
}

/**
 * 現時点のタイマースナップショットを返す。
 *
 * @param state スコア状態
 * @param now 現在時刻（ミリ秒）。省略時は `Date.now()`
 */
export function getTimer(
  state: ScoreState,
  now: number = Date.now(),
): TimerSnapshot {
  const elapsedMs =
    state.startedAt != null ? Math.max(0, now - state.startedAt) : 0;

  if (state.timeLimitMs == null) {
    return { elapsedMs, remainingMs: null, isExpired: false };
  }

  const remainingMs = Math.max(0, state.timeLimitMs - elapsedMs);
  const isExpired = elapsedMs >= state.timeLimitMs;
  return { elapsedMs, remainingMs, isExpired };
}
