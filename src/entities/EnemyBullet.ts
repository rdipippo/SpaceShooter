import Phaser from 'phaser';
import { GameScene } from '@/scenes/GameScene';
import { BaseBullet } from './BaseBullet';

export class EnemyBullet extends BaseBullet {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy_bullet');
    const config = (scene as GameScene).levelConfig.getEnemyConfig();
    this.speed = config.SHOOTING.BULLET_SPEED;
    this.damage = config.SHOOTING.BULLET_DAMAGE;
  }

  fireDirectional(x: number, y: number, vx: number, vy: number, damage: number): void {
    this.damage = damage;
    this.fire(x, y, vx, vy);
  }
}
