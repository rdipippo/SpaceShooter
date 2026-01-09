import Phaser from 'phaser';
import { ENEMY_CONFIG } from '../utils/Constants';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private health!: number;
  private speed!: number;
  public scoreValue!: number;

  constructor(scene: Phaser.Scene, x: number, y: number, type: string = 'basic') {
    super(scene, x, y, `enemy_${type}`);

    this.setEnemyProperties(type);

    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  private setEnemyProperties(type: string): void {
    switch (type) {
      case 'basic':
        this.health = ENEMY_CONFIG.BASIC.HEALTH;
        this.speed = ENEMY_CONFIG.BASIC.SPEED;
        this.scoreValue = ENEMY_CONFIG.BASIC.SCORE_VALUE;
        break;
      default:
        this.health = 1;
        this.speed = 100;
        this.scoreValue = 10;
    }
  }

  spawn(x: number, y: number): void {
    this.setTexture('enemy_basic');
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setVelocityY(this.speed);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    // Destroy enemy if it goes off-screen (bottom)
    if (this.y > this.scene.cameras.main.height + this.height) {
      this.setActive(false);
      this.setVisible(false);
    }
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;

    if (this.health <= 0) {
      this.die();
      return true; // Enemy destroyed
    }

    return false;
  }

  private die(): void {
    // Create explosion effect
    this.createExplosion();

    this.setActive(false);
    this.setVisible(false);
  }

  private createExplosion(): void {
    // Create particle explosion
    const particles = this.scene.add.particles(this.x, this.y, 'explosion_particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      lifespan: 300,
      quantity: 10,
      blendMode: 'ADD'
    });

    // Auto-destroy particles after explosion
    this.scene.time.delayedCall(300, () => {
      particles.destroy();
    });
  }
}
