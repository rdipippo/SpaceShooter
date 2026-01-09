import Phaser from 'phaser';
import { ASTEROID_CONFIG } from '../utils/Constants';

export type AsteroidSize = 'small' | 'medium' | 'large';

export class Asteroid extends Phaser.Physics.Arcade.Sprite {
  private health!: number;
  public scoreValue!: number;
  private asteroidSize!: AsteroidSize;

  constructor(scene: Phaser.Scene, x: number, y: number, size: AsteroidSize = 'medium') {
    super(scene, x, y, `asteroid_${size}`);

    this.asteroidSize = size;
    this.setAsteroidProperties(size);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Enable physics body settings
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setBounce(ASTEROID_CONFIG.BOUNCE, ASTEROID_CONFIG.BOUNCE);
    
    // Set circular body size based on asteroid radius
    const config = this.getSizeConfig(size);
    body.setCircle(config.RADIUS);
  }

  private setAsteroidProperties(size: AsteroidSize): void {
    const config = this.getSizeConfig(size);
    this.health = config.HEALTH;
    this.scoreValue = config.SCORE_VALUE;
  }

  private getSizeConfig(size: AsteroidSize) {
    switch (size) {
      case 'small':
        return ASTEROID_CONFIG.SMALL;
      case 'medium':
        return ASTEROID_CONFIG.MEDIUM;
      case 'large':
        return ASTEROID_CONFIG.LARGE;
    }
  }

  spawn(x: number, y: number, size: AsteroidSize): void {
    this.asteroidSize = size;
    this.setAsteroidProperties(size);
    this.setTexture(`asteroid_${size}`);
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);

    const config = this.getSizeConfig(size);

    // Set random velocity in any direction
    const speed = Phaser.Math.Between(config.MIN_SPEED, config.MAX_SPEED);
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;

    this.setVelocity(velocityX, velocityY);

    // Set random angular velocity (rotation)
    const angularVelocity = Phaser.Math.Between(
      -ASTEROID_CONFIG.ANGULAR_VELOCITY_RANGE,
      ASTEROID_CONFIG.ANGULAR_VELOCITY_RANGE
    );
    this.setAngularVelocity(angularVelocity);

    // Reset alpha in case it was hit before
    this.setAlpha(1);

    // Configure physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setBounce(ASTEROID_CONFIG.BOUNCE, ASTEROID_CONFIG.BOUNCE);
    
    // Set circular body size based on asteroid radius
    body.setCircle(config.RADIUS);
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
    // Create particle explosion scaled to asteroid size
    const config = this.getSizeConfig(this.asteroidSize);
    const particleCount = config.RADIUS;

    const particles = this.scene.add.particles(this.x, this.y, 'asteroid_particle', {
      speed: { min: 30, max: 100 },
      scale: { start: 0.8, end: 0 },
      lifespan: 400,
      quantity: particleCount,
      blendMode: 'ADD',
      tint: 0x8b7355
    });

    this.scene.time.delayedCall(400, () => {
      particles.destroy();
    });
  }

  getSize(): AsteroidSize {
    return this.asteroidSize;
  }
}
