import { describe, it, expect } from 'vitest';
import { LevelConfig } from '@/utils/LevelConfig';
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
