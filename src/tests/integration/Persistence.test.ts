import { describe, it, expect } from 'vitest';
import { ScoreManager } from '@/systems/ScoreManager';

describe('high-score persistence round-trip', () => {
  it('a fresh ScoreManager loads the high score saved by a prior instance', async () => {
    const first = new ScoreManager();
    await first.ready;
    first.addScore(250);
    // Allow the fire-and-forget save to settle.
    await new Promise((r) => setTimeout(r, 0));

    const second = new ScoreManager();
    await second.ready;
    expect(second.getHighScore()).toBe(250);
  });

  it('the higher of two sessions wins', async () => {
    const first = new ScoreManager();
    await first.ready;
    first.addScore(100);
    await new Promise((r) => setTimeout(r, 0));

    const second = new ScoreManager();
    await second.ready;
    second.addScore(50);
    await new Promise((r) => setTimeout(r, 0));

    const third = new ScoreManager();
    await third.ready;
    expect(third.getHighScore()).toBe(100);
  });
});
