import { decomposeSyllable, type SyllableState } from './automaton';
import { jamoToKey } from './layout';
import { decomposeVowel, decomposeConsonant } from './jamoTables';

function keyChar({ code, shift }: { code: string; shift: boolean }): string {
  const letter = code.replace('Key', '').toLowerCase();
  return shift ? letter.toUpperCase() : letter;
}

function jamoToKeyStr(jamo: string): string {
  const key = jamoToKey(jamo);
  return key ? keyChar(key) : jamo;
}

function vowelToKeys(vowel: string): string {
  const parts = decomposeVowel(vowel);
  return parts ? parts.map(jamoToKeyStr).join('') : jamoToKeyStr(vowel);
}

function consonantToKeys(consonant: string): string {
  const parts = decomposeConsonant(consonant);
  return parts ? parts.map(jamoToKeyStr).join('') : jamoToKeyStr(consonant);
}

/** Convert a single Hangul syllable to the keyboard key sequence needed to type it.
 *  Non-Hangul characters are returned as-is. */
export function syllableToKeys(char: string): string {
  const syllable = decomposeSyllable(char);
  if (!syllable) return char;
  let result = '';
  if (syllable.cho) result += jamoToKeyStr(syllable.cho);
  if (syllable.jung) result += vowelToKeys(syllable.jung);
  if (syllable.jong) result += consonantToKeys(syllable.jong);
  return result;
}

/** Return how many keystrokes have been entered for the syllable currently being composed. */
export function countEnteredKeys(current: SyllableState): number {
  let count = 0;
  if (current.cho !== null) count += 1;
  if (current.jung !== null) {
    count += decomposeVowel(current.jung) ? 2 : 1;
  }
  if (current.jong !== null) {
    count += decomposeConsonant(current.jong) ? 2 : 1;
  }
  return count;
}
