import Phaser from 'phaser';
import { GameScene } from '@/scenes/GameScene';

export class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
  private speed: number;
  public damage: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy_bullet');
    const config = (scene as GameScene).levelConfig.getEnemyConfig();
    this.speed = config.SHOOTING.BULLET_SPEED;
    this.damage = config.SHOOTING.BULLET_DAMAGE;
  }

  fire(x: number, y: number): void {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setVelocityY(this.speed);
  }

  fireDirectional(x: number, y: number, vx: number, vy: number, damage: number): void {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setVelocity(vx, vy);
    this.damage = damage;
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    const cam = this.scene.cameras.main;
    if (
      this.y > cam.height + this.height ||
      this.y < -this.height ||
      this.x < -this.width ||
      this.x > cam.width + this.width
    ) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}
