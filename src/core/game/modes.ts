import type { Prompt } from '../../data/types';
import { SYLLABLES } from '../../data/syllables';
import { WORDS } from '../../data/words';
import { SENTENCES } from '../../data/sentences';

/** 練習モードの識別子（音節 / 単語 / 文章）。 */
export type ModeId = 'syllable' | 'word' | 'sentence';

/** お題の取り出し方: ランダム or 順番。 */
export type SelectionStrategy = 'random' | 'sequential';

/** 進行の終了条件: 問題数 or 制限時間。 */
export type ProgressCondition =
  | { type: 'questionCount'; count: number }
  | { type: 'timeLimit'; seconds: number };

/** コンボによる制限時間延長の設定。 */
export interface ComboExtension {
  /** 何コンボごとに延長するか。 */
  interval: number;
  /** 延長する秒数。 */
  bonusSeconds: number;
}

/** 1 つの練習モードの設定。 */
export interface ModeConfig {
  /** モード識別子。i18n キー (`mode.<id>`) とも対応する。 */
  id: ModeId;
  /** 出題ソース（正規化済みの Prompt 配列）。 */
  prompts: readonly Prompt[];
  /** お題の取り出し方。 */
  selection: SelectionStrategy;
  /** 進行の終了条件。 */
  progress: ProgressCondition;
  /** コンボによる制限時間延長の設定。null なら延長なし。 */
  comboExtension: ComboExtension | null;
}

const SYLLABLE_PROMPTS: readonly Prompt[] = SYLLABLES.map((text) => ({ text }));

const WORD_PROMPTS: readonly Prompt[] = WORDS.map((w) => ({
  text: w.hangul,
  meaning: w.meaning,
}));

const SENTENCE_PROMPTS: readonly Prompt[] = SENTENCES.map((s) => ({
  text: s.hangul,
  meaning: s.meaning,
}));

/** 各モードの設定定義。 */
export const MODES: Readonly<Record<ModeId, ModeConfig>> = {
  syllable: {
    id: 'syllable',
    prompts: SYLLABLE_PROMPTS,
    selection: 'random',
    progress: { type: 'timeLimit', seconds: 60 },
    comboExtension: { interval: 10, bonusSeconds: 3 },
  },
  word: {
    id: 'word',
    prompts: WORD_PROMPTS,
    selection: 'random',
    progress: { type: 'timeLimit', seconds: 60 },
    comboExtension: { interval: 5, bonusSeconds: 5 },
  },
  sentence: {
    id: 'sentence',
    prompts: SENTENCE_PROMPTS,
    selection: 'random',
    progress: { type: 'timeLimit', seconds: 60 },
    comboExtension: { interval: 3, bonusSeconds: 8 },
  },
};

/** モード識別子の一覧（UI のモード選択などで使用）。 */
export const MODE_IDS: readonly ModeId[] = ['syllable', 'word', 'sentence'];

/** 識別子からモード設定を取得する。 */
export function getMode(id: ModeId): ModeConfig {
  return MODES[id];
}

/** Fisher–Yates シャッフル（元配列は変更しない）。 */
function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * モード設定から実際の出題リストを生成する。
 *
 * - `selection === 'random'` ならシャッフルし、`'sequential'` なら定義順を保つ。
 * - `progress.type === 'questionCount'` のとき、出題数が `count` に満たなければ
 *   ソースを繰り返して `count` 件ぶん埋める。
 * - `progress.type === 'timeLimit'` のときは全件を返す（時間切れまでエンジンが循環利用する）。
 *
 * @param mode 対象モード設定
 * @param random 乱数生成器（テスト用に注入可能、既定は `Math.random`）
 */
export function buildQuestionList(
  mode: ModeConfig,
  random: () => number = Math.random,
): Prompt[] {
  const ordered =
    mode.selection === 'random' ? shuffle(mode.prompts, random) : [...mode.prompts];

  if (mode.progress.type === 'questionCount') {
    const { count } = mode.progress;
    if (ordered.length === 0) return [];
    const result: Prompt[] = [];
    while (result.length < count) {
      result.push(...ordered);
    }
    return result.slice(0, count);
  }

  return ordered;
}
