import Phaser from 'phaser';
import { GameScene } from '@/scenes/GameScene';
import { AsteroidConfig, AsteroidSizeConfig } from '@/utils/LevelConfig';
import { emitBurst, respawnSprite } from '@/utils/Effects';

export type AsteroidSize = 'small' | 'medium' | 'large';

const ASTEROID_COLLISION_DAMAGE_COOLDOWN_MS = 400;

export class Asteroid extends Phaser.Physics.Arcade.Sprite {
  private health!: number;
  public scoreValue!: number;
  private asteroidSize!: AsteroidSize;
  private lastAsteroidCollisionDamageTime: number = 0;
  private readonly cfg: AsteroidConfig;

  constructor(scene: Phaser.Scene, x: number, y: number, size: AsteroidSize = 'medium') {
    super(scene, x, y, `asteroid_${size}`);

    this.cfg = (scene as GameScene).levelConfig.getAsteroidConfig();
    this.asteroidSize = size;
    this.setAsteroidProperties(size);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Enable physics body settings
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setBounce(this.cfg.BOUNCE, this.cfg.BOUNCE);

    // Set circular body size based on asteroid radius
    body.setCircle(this.getSizeConfig(size).RADIUS);
  }

  private setAsteroidProperties(size: AsteroidSize): void {
    const config = this.getSizeConfig(size);
    this.health = config.HEALTH;
    this.scoreValue = config.SCORE_VALUE;
  }

  private getSizeConfig(size: AsteroidSize): AsteroidSizeConfig {
    switch (size) {
      case 'small':
        return this.cfg.SMALL;
      case 'medium':
        return this.cfg.MEDIUM;
      case 'large':
        return this.cfg.LARGE;
    }
  }

  /** Whether this asteroid can take 1 damage from another asteroid (cooldown to avoid multi-hit while overlapping). */
  canTakeAsteroidCollisionDamage(): boolean {
    return this.scene.time.now - this.lastAsteroidCollisionDamageTime > ASTEROID_COLLISION_DAMAGE_COOLDOWN_MS;
  }

  markAsteroidCollisionDamage(): void {
    this.lastAsteroidCollisionDamageTime = this.scene.time.now;
  }

  spawn(x: number, y: number, size: AsteroidSize): void {
    this.asteroidSize = size;
    this.setAsteroidProperties(size);
    this.lastAsteroidCollisionDamageTime = 0;
    respawnSprite(this, x, y, `asteroid_${size}`);

    const sizeConfig = this.getSizeConfig(size);

    // Set random velocity in any direction
    const speed = Phaser.Math.Between(sizeConfig.MIN_SPEED, sizeConfig.MAX_SPEED);
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    // Set random angular velocity (rotation)
    this.setAngularVelocity(Phaser.Math.Between(
      -this.cfg.ANGULAR_VELOCITY_RANGE,
      this.cfg.ANGULAR_VELOCITY_RANGE
    ));

    // Reset alpha in case it was hit before
    this.setAlpha(1);

    // Configure physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setBounce(this.cfg.BOUNCE, this.cfg.BOUNCE);

    // Set circular body size based on asteroid radius
    body.setCircle(sizeConfig.RADIUS);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    // Keep asteroid in play - if somehow it stops moving, give it a nudge
    const body = this.body as Phaser.Physics.Arcade.Body;
    const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);

    if (speed < 20) {
      const config = this.getSizeConfig(this.asteroidSize);
      const newSpeed = Phaser.Math.Between(config.MIN_SPEED, config.MAX_SPEED);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      this.setVelocity(Math.cos(angle) * newSpeed, Math.sin(angle) * newSpeed);
    }
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;

    // Visual feedback - flash and scale based on damage
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 50,
      yoyo: true,
    });

    if (this.health <= 0) {
      this.die();
      return true; // Asteroid destroyed
    }

    return false;
  }

  private die(): void {
    this.createExplosion();
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);
    this.setAngularVelocity(0);
  }

  private createExplosion(): void {
    const particleCount = this.getSizeConfig(this.asteroidSize).RADIUS;

    emitBurst(this.scene, this.x, this.y, 'asteroid_particle', {
      speed: { min: 30, max: 100 },
      scale: { start: 0.8, end: 0 },
      lifespan: 400,
      quantity: particleCount,
      blendMode: 'ADD',
      tint: 0x8b7355
    });
  }

  getSize(): AsteroidSize {
    return this.asteroidSize;
  }

  /** Radius used for physics/collision (from config). */
  getCollisionRadius(): number {
    return this.getSizeConfig(this.asteroidSize).RADIUS;
  }
}
