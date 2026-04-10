import Phaser from 'phaser';
import { PLAYER_CONFIG } from '../utils/Constants';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  private speed: number;
  public damage: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bullet');
    this.speed = PLAYER_CONFIG.BULLET_SPEED;
    this.damage = PLAYER_CONFIG.BULLET_DAMAGE;
  }

  fire(x: number, y: number): void {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setVelocityY(-this.speed);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    // Destroy bullet if it goes off-screen
    if (this.y < -this.height) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}
