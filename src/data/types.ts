import type { Language } from '../i18n';

/**
 * A piece of text localized per UI language.
 * `ja` is always present (primary learning language for v1);
 * other languages are optional and may be hidden when absent
 * (e.g. a Korean sentence needs no Korean "meaning").
 */
export type LocalizedText = { ja: string } & Partial<Record<Language, string>>;

/**
 * A single word prompt with learning aids.
 * - `hangul`: the text the player types
 * - `meaning`: localized gloss (shown according to UI language)
 */
export interface WordEntry {
  hangul: string;
  meaning: LocalizedText;
}

/**
 * A single sentence prompt (may contain spaces / punctuation).
 * `meaning` is the translation; it is optional and typically hidden
 * when the UI language matches the sentence language (Korean).
 */
export interface SentenceEntry {
  hangul: string;
  meaning?: LocalizedText;
}

/**
 * A normalized prompt consumed by the game engine, regardless of mode.
 * `text` is what the player must type; the rest are optional aids.
 */
export interface Prompt {
  text: string;
  meaning?: LocalizedText;
}
