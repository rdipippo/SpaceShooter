import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LevelConfig, getNextLevel, levelExists } from '@/utils/LevelConfig';
import { makeLevelConfig, makeLevelConfigData } from '../helpers/stubLevelConfig';

describe('LevelConfig', () => {
  it('exposes level identifier', () => {
    const cfg = makeLevelConfig('2-3');
    expect(cfg.getLevel()).toBe('2-3');
  });

  it('returns the boss config block', () => {
    const cfg = makeLevelConfig();
    expect(cfg.getBossConfig().HEALTH).toBe(10);
    expect(cfg.getBossConfig().SHOOTING.GUN_COUNT).toBe(1);
  });

  it('returns the asteroid config block with all sizes', () => {
    const cfg = makeLevelConfig();
    expect(cfg.getAsteroidConfig().SMALL.RADIUS).toBe(15);
    expect(cfg.getAsteroidConfig().MEDIUM.RADIUS).toBe(25);
    expect(cfg.getAsteroidConfig().LARGE.RADIUS).toBe(40);
  });

  it('returns the shield powerup config block', () => {
    const cfg = makeLevelConfig();
    expect(cfg.getShieldPowerupConfig().HEAL_AMOUNT).toBe(1);
  });

  it('STRIKER block is undefined when not provided', () => {
    const cfg = makeLevelConfig();
    expect(cfg.getEnemyConfig().STRIKER).toBeUndefined();
  });

  it('STRIKER block passes through when provided', () => {
    const data = makeLevelConfigData();
    data.ENEMY_CONFIG.STRIKER = {
      ENABLED: true,
      HEALTH: 2,
      SPEED: 80,
      DIVE_SPEED: 300,
      SCORE_VALUE: 25,
      INITIAL_SPAWN_DELAY: 4000,
      MIN_SPAWN_DELAY: 2000,
      SPAWN_DIFFICULTY_INCREASE: 100,
      DETECTION_RANGE: 350,
      FIRE_RATE: 600,
      BULLET_SPEED: 300,
      BULLET_DAMAGE: 1,
    };
    const cfg = new LevelConfig('1-3', data);
    expect(cfg.getEnemyConfig().STRIKER?.ENABLED).toBe(true);
    expect(cfg.getEnemyConfig().STRIKER?.HEALTH).toBe(2);
  });
});

describe('getNextLevel', () => {
  it('advances within a world', () => {
    expect(getNextLevel('1-1')).toBe('1-2');
    expect(getNextLevel('1-9')).toBe('1-10');
    expect(getNextLevel('3-5')).toBe('3-6');
  });

  it('rolls over to the next world after level 10', () => {
    expect(getNextLevel('1-10')).toBe('2-1');
    expect(getNextLevel('2-10')).toBe('3-1');
  });

  it('returns null for malformed input', () => {
    expect(getNextLevel('bad')).toBeNull();
    expect(getNextLevel('1')).toBeNull();
    expect(getNextLevel('')).toBeNull();
    expect(getNextLevel('0-1')).toBeNull();
    expect(getNextLevel('1-0')).toBeNull();
  });
});

describe('levelExists', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns true when the response is ok with JSON content-type', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json; charset=utf-8' },
    });
    expect(await levelExists('1-1')).toBe(true);
  });

  it('returns false when the response is ok but content-type is HTML (SPA fallback)', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      headers: { get: () => 'text/html' },
    });
    expect(await levelExists('99-99')).toBe(false);
  });

  it('returns false on non-ok response', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      headers: { get: () => 'application/json' },
    });
    expect(await levelExists('1-4')).toBe(false);
  });

  it('returns false when fetch throws', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network'));
    expect(await levelExists('1-1')).toBe(false);
  });
});
