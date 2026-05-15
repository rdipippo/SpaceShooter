import { describe, it, expect } from 'vitest';
import { ScoreManager } from '@/systems/ScoreManager';
import { inMemoryPreferences } from '../helpers/inMemoryPreferences';

describe('ScoreManager', () => {
  it('starts at zero current and zero high', async () => {
    const sm = new ScoreManager();
    await sm.ready;
    expect(sm.getCurrentScore()).toBe(0);
    expect(sm.getHighScore()).toBe(0);
  });

  it('addScore increments current', async () => {
    const sm = new ScoreManager();
    await sm.ready;
    sm.addScore(10);
    sm.addScore(15);
    expect(sm.getCurrentScore()).toBe(25);
  });

  it('promotes high score and persists when current passes it', async () => {
    const sm = new ScoreManager();
    await sm.ready;
    sm.addScore(100);
    expect(sm.getHighScore()).toBe(100);
    // Wait for the fire-and-forget save to settle.
    await new Promise((r) => setTimeout(r, 0));
    const stored = await inMemoryPreferences.get({ key: 'spaceshooter_highscore' });
    expect(stored.value).toBe('100');
  });

  it('does not promote high score when current stays below it', async () => {
    await inMemoryPreferences.set({ key: 'spaceshooter_highscore', value: '500' });
    const sm = new ScoreManager();
    await sm.ready;
    sm.addScore(100);
    expect(sm.getHighScore()).toBe(500);
  });

  it('reset clears current but preserves high', async () => {
    const sm = new ScoreManager();
    await sm.ready;
    sm.addScore(100);
    sm.reset();
    expect(sm.getCurrentScore()).toBe(0);
    expect(sm.getHighScore()).toBe(100);
  });

  it('loads previously saved high score on construction', async () => {
    await inMemoryPreferences.set({ key: 'spaceshooter_highscore', value: '777' });
    const sm = new ScoreManager();
    await sm.ready;
    expect(sm.getHighScore()).toBe(777);
  });
});
