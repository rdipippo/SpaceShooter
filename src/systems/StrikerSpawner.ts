import Phaser from 'phaser';
import { StrikerEnemy } from '../entities/StrikerEnemy';
import { EnemyBullet } from '../entities/EnemyBullet';
import { Player } from '../entities/Player';
import { GameScene } from '@/scenes/GameScene';
import { BaseSpawner } from './BaseSpawner';

export class StrikerSpawner extends BaseSpawner {
  private strikerBullets!: Phaser.Physics.Arcade.Group;
  private player: Player | null = null;

  constructor(scene: GameScene) {
    const config = scene.levelConfig.getEnemyConfig().STRIKER!;
    super(
      scene,
      {
        initial: config.INITIAL_SPAWN_DELAY,
        min: config.MIN_SPAWN_DELAY,
        increase: config.SPAWN_DIFFICULTY_INCREASE
      },
      { classType: StrikerEnemy, maxSize: 10, runChildUpdate: true }
    );

    this.strikerBullets = scene.physics.add.group({
      classType: EnemyBullet,
      maxSize: 30,
      runChildUpdate: true
    });

    this.startSpawning();
  }

  setPlayer(player: Player): void {
    this.player = player;
  }

  protected spawnAt(x: number, y: number): void {
    const striker = this.group.get(x, y, 'enemy_striker') as StrikerEnemy;
    if (striker) {
      striker.spawn(x, y);
      if (this.player) {
        striker.setShootingTargets(this.player, this.strikerBullets);
      }
    }
  }

  destroyAll(): void {
    super.destroyAll();
    this.strikerBullets.clear(true, true);
  }

  getStrikers(): Phaser.Physics.Arcade.Group {
    return this.group;
  }

  getStrikerBullets(): Phaser.Physics.Arcade.Group {
    return this.strikerBullets;
  }
}
