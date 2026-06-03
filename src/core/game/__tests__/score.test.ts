import { describe, it, expect } from 'vitest';
import {
  createScore,
  startTimer,
  recordCorrect,
  recordMiss,
  getTimer,
  comboMultiplier,
  speedBonus,
} from '../score';

describe('comboMultiplier', () => {
  it('returns 1.0 for combo < 5', () => {
    expect(comboMultiplier(1)).toBe(1.0);
    expect(comboMultiplier(4)).toBe(1.0);
  });

  it('returns 1.5 for combo 5–9', () => {
    expect(comboMultiplier(5)).toBe(1.5);
    expect(comboMultiplier(9)).toBe(1.5);
  });

  it('returns 2.0 for combo 10–19', () => {
    expect(comboMultiplier(10)).toBe(2.0);
    expect(comboMultiplier(19)).toBe(2.0);
  });

  it('returns 2.5 for combo 20–29', () => {
    expect(comboMultiplier(20)).toBe(2.5);
    expect(comboMultiplier(29)).toBe(2.5);
  });

  it('returns 3.0 for combo >= 30', () => {
    expect(comboMultiplier(30)).toBe(3.0);
    expect(comboMultiplier(99)).toBe(3.0);
  });
});

describe('speedBonus', () => {
  it('returns 0 for CPM < 100', () => {
    expect(speedBonus(0)).toBe(0);
    expect(speedBonus(99)).toBe(0);
  });

  it('returns 5 for CPM 100–199', () => {
    expect(speedBonus(100)).toBe(5);
    expect(speedBonus(199)).toBe(5);
  });

  it('returns 10 for CPM 200–299', () => {
    expect(speedBonus(200)).toBe(10);
  });
});

describe('createScore', () => {
  it('initialises with zeroed state', () => {
    const s = createScore();
    expect(s.score).toBe(0);
    expect(s.combo).toBe(0);
    expect(s.maxCombo).toBe(0);
    expect(s.correctSyllables).toBe(0);
    expect(s.startedAt).toBeNull();
    expect(s.timeLimitMs).toBeNull();
  });

  it('sets timeLimitMs when timeLimitSeconds is given', () => {
    const s = createScore(60);
    expect(s.timeLimitMs).toBe(60_000);
  });
});

describe('startTimer', () => {
  it('sets startedAt on first call', () => {
    const s = startTimer(createScore(), 5000);
    expect(s.startedAt).toBe(5000);
  });

  it('does not change startedAt on subsequent calls', () => {
    const s = startTimer(startTimer(createScore(), 5000), 9000);
    expect(s.startedAt).toBe(5000);
  });
});

describe('recordCorrect', () => {
  it('increments score by BASE_POINTS (10) × 1.0 combo when combo < 5', () => {
    let s = createScore();
    s = recordCorrect(s, 0); // combo becomes 1, multiplier 1.0, no speed bonus
    expect(s.score).toBe(10);
    expect(s.combo).toBe(1);
    expect(s.correctSyllables).toBe(1);
  });

  it('applies 1.5x multiplier at combo 5', () => {
    let s = createScore();
    for (let i = 0; i < 4; i++) s = recordCorrect(s, 0);
    s = recordCorrect(s, 0); // combo becomes 5 → 1.5x → round(10*1.5) = 15
    expect(s.combo).toBe(5);
    expect(s.score).toBe(10 * 4 + 15);
  });

  it('applies 2.0x multiplier at combo 10', () => {
    let s = createScore();
    for (let i = 0; i < 9; i++) s = recordCorrect(s, 0);
    s = recordCorrect(s, 0); // combo 10 → 2.0x → 20
    expect(s.combo).toBe(10);
    // combo 1-4  → 10 each (4×10=40)
    // combo 5-9  → 15 each (5×15=75)
    // combo 10   → 20
    expect(s.score).toBe(40 + 75 + 20);
  });

  it('scales points by syllableCount', () => {
    let s = createScore();
    s = recordCorrect(s, 0, 3); // combo 1, 1.0x, 3 syllables → 30
    expect(s.score).toBe(30);
  });

  it('combines syllableCount and combo multiplier', () => {
    let s = createScore();
    for (let i = 0; i < 4; i++) s = recordCorrect(s, 0, 1);
    s = recordCorrect(s, 0, 4); // combo 5, 1.5x, 4 syllables → round(10*4*1.5)=60
    expect(s.combo).toBe(5);
    expect(s.score).toBe(40 + 60);
  });

  it('updates maxCombo', () => {
    let s = createScore();
    s = recordCorrect(s);
    s = recordCorrect(s);
    s = recordMiss(s);
    s = recordCorrect(s);
    expect(s.combo).toBe(1);
    expect(s.maxCombo).toBe(2);
  });

  it('adds speed bonus based on CPM', () => {
    let s = createScore();
    s = recordCorrect(s, 200); // 10*1.0 + speedBonus(200)=10 → 20
    expect(s.score).toBe(20);
  });
});

describe('recordMiss', () => {
  it('resets combo to 0', () => {
    let s = createScore();
    s = recordCorrect(s);
    s = recordCorrect(s);
    s = recordMiss(s);
    expect(s.combo).toBe(0);
  });

  it('does not change score', () => {
    let s = createScore();
    s = recordCorrect(s); // score = 10
    const scoreBefore = s.score;
    s = recordMiss(s);
    expect(s.score).toBe(scoreBefore);
  });
});

describe('getTimer', () => {
  it('returns elapsedMs=0 before game starts', () => {
    const snap = getTimer(createScore(), 9000);
    expect(snap.elapsedMs).toBe(0);
  });

  it('count-up mode: remainingMs is null and isExpired is false', () => {
    let s = createScore(); // no time limit
    s = startTimer(s, 1000);
    const snap = getTimer(s, 5000);
    expect(snap.elapsedMs).toBe(4000);
    expect(snap.remainingMs).toBeNull();
    expect(snap.isExpired).toBe(false);
  });

  it('time-limit mode: returns correct remainingMs', () => {
    let s = createScore(60); // 60-second limit
    s = startTimer(s, 0);
    const snap = getTimer(s, 20_000);
    expect(snap.elapsedMs).toBe(20_000);
    expect(snap.remainingMs).toBe(40_000);
    expect(snap.isExpired).toBe(false);
  });

  it('time-limit mode: isExpired when time runs out', () => {
    let s = createScore(60);
    s = startTimer(s, 0);
    const snap = getTimer(s, 60_001);
    expect(snap.isExpired).toBe(true);
    expect(snap.remainingMs).toBe(0);
  });
});
