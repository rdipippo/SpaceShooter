import Phaser from 'phaser';
import { GameScene } from '@/scenes/GameScene';
import { BaseBullet } from './BaseBullet';

export class BossBullet extends BaseBullet {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'boss_bullet');
    const config = (scene as GameScene).levelConfig.getBossConfig();
    this.speed = config.SHOOTING.BULLET_SPEED;
    this.damage = config.SHOOTING.BULLET_DAMAGE;
  }
}
