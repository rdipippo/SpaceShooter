import { describe, it, expect, afterEach } from 'vitest';
import { GameScene } from '@/scenes/GameScene';
import { createHeadlessGame, HeadlessHandle } from '../helpers/headlessGame';
import { makeLevelConfigData } from '../helpers/stubLevelConfig';

describe('GameScene boot', () => {
  let h: HeadlessHandle<GameScene> | null = null;
  afterEach(() => { h?.destroy(); h = null; });

  it('constructs player, spawners, and boss spawner from level 1-1 config', async () => {
    h = await createHeadlessGame(GameScene, { level: '1-1' });
    expect(h.scene.player).toBeDefined();
    expect(h.scene.enemySpawner).toBeDefined();
    expect(h.scene.asteroidSpawner).toBeDefined();
    expect(h.scene.shieldPowerUpSpawner).toBeDefined();
    expect(h.scene.bossSpawner).toBeDefined();
  });

  it('does not create a striker spawner when STRIKER.ENABLED is false', async () => {
    h = await createHeadlessGame(GameScene, { level: '1-1' });
    expect(h.scene.strikerSpawner).toBeUndefined();
  });

  it('creates a striker spawner when STRIKER.ENABLED is true', async () => {
    const data = makeLevelConfigData();
    data.ENEMY_CONFIG.STRIKER = {
      ENABLED: true,
      HEALTH: 2, SPEED: 80, DIVE_SPEED: 300, SCORE_VALUE: 25,
      INITIAL_SPAWN_DELAY: 4000, MIN_SPAWN_DELAY: 2000, SPAWN_DIFFICULTY_INCREASE: 100,
      DETECTION_RANGE: 350, FIRE_RATE: 600, BULLET_SPEED: 300, BULLET_DAMAGE: 1,
    };
    h = await createHeadlessGame(GameScene, { level: '1-3', levelConfigData: data });
    expect(h.scene.strikerSpawner).toBeDefined();
  });

  it('exposes the loaded level identifier on the LevelConfig', async () => {
    h = await createHeadlessGame(GameScene, { level: '2-7' });
    expect(h.scene.levelConfig.getLevel()).toBe('2-7');
  });
});
