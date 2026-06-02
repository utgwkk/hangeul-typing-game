import { describe, it, expect } from 'vitest';
import {
  createStats,
  recordKeystroke,
  recordSyllable,
  computeStats,
} from '../stats';

describe('createStats', () => {
  it('returns zeroed initial state', () => {
    const s = createStats();
    expect(s.totalKeystrokes).toBe(0);
    expect(s.correctKeystrokes).toBe(0);
    expect(s.confirmedSyllables).toBe(0);
    expect(s.confirmedChars).toBe(0);
    expect(s.startedAt).toBeNull();
  });
});

describe('recordKeystroke', () => {
  it('increments totalKeystrokes on each call', () => {
    let s = createStats();
    s = recordKeystroke(s, true, 1000);
    s = recordKeystroke(s, false, 1500);
    expect(s.totalKeystrokes).toBe(2);
  });

  it('increments correctKeystrokes only for correct strokes', () => {
    let s = createStats();
    s = recordKeystroke(s, true, 1000);
    s = recordKeystroke(s, true, 1200);
    s = recordKeystroke(s, false, 1400);
    expect(s.correctKeystrokes).toBe(2);
  });

  it('sets startedAt on the first keystroke', () => {
    let s = createStats();
    s = recordKeystroke(s, true, 5000);
    expect(s.startedAt).toBe(5000);
  });

  it('does not change startedAt on subsequent keystrokes', () => {
    let s = createStats();
    s = recordKeystroke(s, true, 5000);
    s = recordKeystroke(s, true, 6000);
    expect(s.startedAt).toBe(5000);
  });
});

describe('recordSyllable', () => {
  it('increments confirmedSyllables', () => {
    let s = createStats();
    s = recordSyllable(s);
    s = recordSyllable(s);
    expect(s.confirmedSyllables).toBe(2);
  });

  it('increments confirmedChars by syllableLength (default 1)', () => {
    let s = createStats();
    s = recordSyllable(s);
    expect(s.confirmedChars).toBe(1);
  });

  it('increments confirmedChars by specified syllableLength', () => {
    let s = createStats();
    s = recordSyllable(s, 3);
    expect(s.confirmedChars).toBe(3);
  });
});

describe('computeStats', () => {
  it('returns 100% accuracy and 0 cpm/wpm before any keystrokes', () => {
    const snap = computeStats(createStats(), 10000);
    expect(snap.accuracy).toBe(100);
    expect(snap.cpm).toBe(0);
    expect(snap.wpm).toBe(0);
    expect(snap.elapsedMs).toBe(0);
  });

  it('calculates CPM correctly', () => {
    let s = createStats();
    // 60 keystrokes over 60 seconds → 60 CPM
    s = recordKeystroke(s, true, 0);
    for (let i = 1; i < 60; i++) {
      s = recordKeystroke(s, true, i * 1000);
    }
    const snap = computeStats(s, 60_000);
    // 60 keystrokes / 1 min = 60 CPM
    expect(snap.cpm).toBe(60);
  });

  it('calculates WPM as confirmed chars / 5 / elapsed minutes', () => {
    let s = createStats();
    s = recordKeystroke(s, true, 0);
    // 10 chars confirmed in 1 minute → 10/5/1 = 2 WPM
    s = recordSyllable(s, 10);
    const snap = computeStats(s, 60_000);
    expect(snap.wpm).toBe(2);
  });

  it('calculates accuracy correctly', () => {
    let s = createStats();
    s = recordKeystroke(s, true, 0);
    s = recordKeystroke(s, true, 100);
    s = recordKeystroke(s, false, 200);
    // 2 correct / 3 total = 66.666... → 67
    const snap = computeStats(s, 1000);
    expect(snap.accuracy).toBe(67);
  });

  it('returns elapsedMs from startedAt to now', () => {
    let s = createStats();
    s = recordKeystroke(s, true, 1000);
    const snap = computeStats(s, 4000);
    expect(snap.elapsedMs).toBe(3000);
  });
});
