import { describe, it, expect, afterEach } from 'vitest';
import { GameScene } from '@/scenes/GameScene';
import { createHeadlessGame, HeadlessHandle } from '../helpers/headlessGame';

interface FakeBullet {
  active: boolean;
  visible: boolean;
  damage: number;
  setActive(v: boolean): FakeBullet;
  setVisible(v: boolean): FakeBullet;
}

interface FakeTarget {
  active: boolean;
  scoreValue: number;
  health: number;
  takeDamage(n: number): boolean;
}

function makeFakeBullet(damage = 1): FakeBullet {
  return {
    active: true,
    visible: true,
    damage,
    setActive(v) { this.active = v; return this; },
    setVisible(v) { this.visible = v; return this; },
  };
}

function makeFakeTarget(health = 1, scoreValue = 10): FakeTarget {
  return {
    active: true,
    scoreValue,
    health,
    takeDamage(n) {
      this.health -= n;
      if (this.health <= 0) { this.active = false; return true; }
      return false;
    },
  };
}

describe('CollisionManager wiring (booted scene)', () => {
  let h: HeadlessHandle<GameScene> | null = null;

  afterEach(() => { h?.destroy(); h = null; });

  it('emits enemyDestroyed when bullet kills an enemy via the registered callback', async () => {
    h = await createHeadlessGame(GameScene, { level: '1-1' });

    const bullet = makeFakeBullet(1);
    const target = makeFakeTarget(1, 10);
    let emittedScore: number | undefined;
    h.scene.events.once('enemyDestroyed', (score: number) => { emittedScore = score; });

    // CollisionManager registered an overlap callback against the player-bullets vs enemies group.
    // Pull that callback out of the physics world and invoke it with our fakes.
    const colliders = (h.scene.physics.world.colliders as any).getActive() as Phaser.Physics.Arcade.Collider[];
    const enemies = h.scene.enemySpawner.getEnemies();
    const playerBullets = h.scene.player.getBullets();
    const collider = colliders.find(
      (c) =>
        (c.object1 === playerBullets && c.object2 === enemies) ||
        (c.object1 === enemies && c.object2 === playerBullets),
    );
    expect(collider).toBeDefined();
    collider!.collideCallback?.call(collider!.callbackContext, bullet as any, target as any);

    expect(bullet.active).toBe(false);
    expect(bullet.visible).toBe(false);
    expect(target.active).toBe(false);
    expect(emittedScore).toBe(10);
  });

  it('does nothing when bullet is already inactive', async () => {
    h = await createHeadlessGame(GameScene, { level: '1-1' });
    const bullet = makeFakeBullet(1);
    bullet.active = false;
    const target = makeFakeTarget(1, 10);

    let emitted = false;
    h.scene.events.once('enemyDestroyed', () => { emitted = true; });

    const colliders = (h.scene.physics.world.colliders as any).getActive() as Phaser.Physics.Arcade.Collider[];
    const collider = colliders.find(
      (c) =>
        c.object1 === h!.scene.player.getBullets() && c.object2 === h!.scene.enemySpawner.getEnemies(),
    );
    collider!.collideCallback?.call(collider!.callbackContext, bullet as any, target as any);

    expect(target.active).toBe(true);
    expect(emitted).toBe(false);
  });
});
