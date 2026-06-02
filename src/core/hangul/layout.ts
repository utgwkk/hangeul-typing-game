/**
 * 2벌식 (Dubeolsik) key mapping.
 * Uses KeyboardEvent.code (physical key positions), independent of OS layout.
 *
 * Each entry: [normalJamo, shiftJamo | null]
 */
export const DUBEOLSIK_MAP: Readonly<Record<string, [string, string | null]>> = {
  KeyQ: ['ㅂ', 'ㅃ'],
  KeyW: ['ㅈ', 'ㅉ'],
  KeyE: ['ㄷ', 'ㄸ'],
  KeyR: ['ㄱ', 'ㄲ'],
  KeyT: ['ㅅ', 'ㅆ'],
  KeyY: ['ㅛ', null],
  KeyU: ['ㅕ', null],
  KeyI: ['ㅑ', null],
  KeyO: ['ㅐ', 'ㅒ'],
  KeyP: ['ㅔ', 'ㅖ'],
  KeyA: ['ㅁ', null],
  KeyS: ['ㄴ', null],
  KeyD: ['ㅇ', null],
  KeyF: ['ㄹ', null],
  KeyG: ['ㅎ', null],
  KeyH: ['ㅗ', null],
  KeyJ: ['ㅓ', null],
  KeyK: ['ㅏ', null],
  KeyL: ['ㅣ', null],
  KeyZ: ['ㅋ', null],
  KeyX: ['ㅌ', null],
  KeyC: ['ㅊ', null],
  KeyV: ['ㅍ', null],
  KeyB: ['ㅠ', null],
  KeyN: ['ㅜ', null],
  KeyM: ['ㅡ', null],
};

/** Map from jamo to { code, shift } for reverse lookup (virtual keyboard highlight). */
export const JAMO_TO_KEY: Readonly<Record<string, { code: string; shift: boolean }>> = (() => {
  const result: Record<string, { code: string; shift: boolean }> = {};
  for (const [code, [normal, shifted]] of Object.entries(DUBEOLSIK_MAP)) {
    result[normal] = { code, shift: false };
    if (shifted !== null) {
      result[shifted] = { code, shift: true };
    }
  }
  return result;
})();

/** Return the jamo for a given physical key code and shift state, or undefined if not mapped. */
export function keyToJamo(code: string, shift: boolean): string | undefined {
  const entry = DUBEOLSIK_MAP[code];
  if (!entry) return undefined;
  const [normal, shifted] = entry;
  return shift ? (shifted ?? undefined) : normal;
}

/** Return the physical key and shift state for a given jamo, or undefined if not mapped. */
export function jamoToKey(jamo: string): { code: string; shift: boolean } | undefined {
  return JAMO_TO_KEY[jamo];
}
