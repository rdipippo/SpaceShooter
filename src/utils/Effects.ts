import Phaser from 'phaser';

type ParticleConfig = Phaser.Types.GameObjects.Particles.ParticleEmitterConfig & { lifespan: number };

/** Position + activate a pooled sprite, optionally swapping its texture. */
export function respawnSprite(
  sprite: Phaser.Physics.Arcade.Sprite,
  x: number,
  y: number,
  textureKey?: string
): void {
  if (textureKey) sprite.setTexture(textureKey);
  sprite.setPosition(x, y);
  sprite.setActive(true);
  sprite.setVisible(true);
}

export function emitBurst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  texture: string,
  config: ParticleConfig
): void {
  const particles = scene.add.particles(x, y, texture, config);
  scene.time.delayedCall(config.lifespan as number, () => particles.destroy());
}

export function flashTint(
  sprite: Phaser.GameObjects.Sprite,
  color: number = 0xffffff,
  ms: number = 100
): void {
  sprite.setTint(color);
  sprite.scene.time.delayedCall(ms, () => {
    if (sprite.active) sprite.clearTint();
  });
}
