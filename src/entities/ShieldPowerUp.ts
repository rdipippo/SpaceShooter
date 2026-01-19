import Phaser from 'phaser';
import { SHIELD_POWERUP_CONFIG } from '../utils/Constants';

export class ShieldPowerUp extends Phaser.Physics.Arcade.Sprite {
  private speed: number;
  public healAmount: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'shield_powerup');

    this.speed = SHIELD_POWERUP_CONFIG.SPEED;
    this.healAmount = SHIELD_POWERUP_CONFIG.HEAL_AMOUNT;

    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  spawn(x: number, y: number): void {
    this.setTexture('shield_powerup');
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);

    // Ensure physics body is enabled when reused from pool
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.enable = true;
    }

    this.setVelocityY(this.speed);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    // Destroy power-up if it goes off-screen (bottom)
    if (this.y > this.scene.cameras.main.height + this.height) {
      this.setActive(false);
      this.setVisible(false);
    }
  }

  collect(): void {
    // Create collection effect
    this.createCollectionEffect();

    this.setActive(false);
    this.setVisible(false);

    // Disable physics body when collected
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.enable = false;
    }
  }

  private createCollectionEffect(): void {
    // Create particle effect for collection
    const particles = this.scene.add.particles(this.x, this.y, 'shield_particle', {
      speed: { min: 30, max: 80 },
      scale: { start: 1, end: 0 },
      lifespan: 200,
      quantity: 8,
      blendMode: 'ADD'
    });

    // Auto-destroy particles after effect
    this.scene.time.delayedCall(200, () => {
      particles.destroy();
    });
  }
}
