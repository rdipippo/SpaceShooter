import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { EnemyBullet } from '../entities/EnemyBullet';
import { Player } from '../entities/Player';
import { GameScene } from '@/scenes/GameScene';
import { BaseSpawner } from './BaseSpawner';

export class EnemySpawner extends BaseSpawner {
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private player: Player | null = null;

  constructor(scene: GameScene) {
    const config = scene.levelConfig.getEnemyConfig();
    super(
      scene,
      {
        initial: config.INITIAL_SPAWN_DELAY,
        min: config.MIN_SPAWN_DELAY,
        increase: config.SPAWN_DIFFICULTY_INCREASE
      },
      { classType: Enemy, maxSize: 20, runChildUpdate: true }
    );

    this.enemyBullets = scene.physics.add.group({
      classType: EnemyBullet,
      maxSize: 50,
      runChildUpdate: true
    });

    this.startSpawning();
  }

  setPlayer(player: Player): void {
    this.player = player;
  }

  protected spawnAt(x: number, y: number): void {
    const enemy = this.group.get(x, y, 'enemy_basic') as Enemy;
    if (enemy) {
      this.spawnCount++;
      enemy.spawn(x, y);
      if (this.player) {
        enemy.setShootingTargets(this.player, this.enemyBullets);
      }
    }
  }

  destroyAll(): void {
    super.destroyAll();
    this.enemyBullets.clear(true, true);
  }

  getEnemies(): Phaser.Physics.Arcade.Group {
    return this.group;
  }

  getEnemyBullets(): Phaser.Physics.Arcade.Group {
    return this.enemyBullets;
  }
}
