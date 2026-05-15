import { describe, it, expect, afterEach } from 'vitest';
import { GameScene } from '@/scenes/GameScene';
import { createHeadlessGame, HeadlessHandle } from '../helpers/headlessGame';
import { tick } from '../helpers/tick';

describe('EnemySpawner under headless time', () => {
  let h: HeadlessHandle<GameScene> | null = null;
  afterEach(() => { h?.destroy(); h = null; });

  it('spawns at least three enemies after 3x the initial delay', async () => {
    h = await createHeadlessGame(GameScene, { level: '1-1' });

    const initial = h.scene.enemySpawner.getSpawnDelay();
    tick(h.scene, initial * 3 + 100);

    expect(h.scene.enemySpawner.getEnemies().countActive(true)).toBeGreaterThanOrEqual(3);
  });

  it('increaseDifficulty drops the spawn delay above the floor', async () => {
    h = await createHeadlessGame(GameScene, { level: '1-1' });
    const before = h.scene.enemySpawner.getSpawnDelay();
    h.scene.enemySpawner.increaseDifficulty();
    const after = h.scene.enemySpawner.getSpawnDelay();
    expect(after).toBeLessThan(before);
  });
});
