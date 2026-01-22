import Phaser from 'phaser';
import { ENEMY_CONFIG } from '../utils/Constants';

export class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
  private speed: number;
  public damage: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy_bullet');
    this.speed = ENEMY_CONFIG.SHOOTING.BULLET_SPEED;
    this.damage = ENEMY_CONFIG.SHOOTING.BULLET_DAMAGE;
  }

  fire(x: number, y: number): void {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setVelocityY(this.speed);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    // Destroy bullet if it goes off-screen (bottom)
    if (this.y > this.scene.cameras.main.height + this.height) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}
