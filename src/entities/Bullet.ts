import Phaser from 'phaser';
import { PLAYER_CONFIG } from '../utils/Constants';
import { BaseBullet } from './BaseBullet';

export class Bullet extends BaseBullet {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bullet');
    this.speed = -PLAYER_CONFIG.BULLET_SPEED;
    this.damage = PLAYER_CONFIG.BULLET_DAMAGE;
  }
}
