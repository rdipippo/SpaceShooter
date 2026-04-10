import Phaser from 'phaser';
import { StrikerEnemy } from '../entities/StrikerEnemy';
import { EnemyBullet } from '../entities/EnemyBullet';
import { Player } from '../entities/Player';
import { GameScene } from '@/scenes/GameScene';

export class StrikerSpawner {
  private scene: GameScene;
  private strikers!: Phaser.Physics.Arcade.Group;
  private strikerBullets!: Phaser.Physics.Arcade.Group;
  private player: Player | null = null;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private spawnDelay: number;
  private minSpawnDelay: number;
  private spawnDifficultyIncrease: number;

  constructor(scene: GameScene) {
    this.scene = scene;
    const config = scene.levelConfig.getEnemyConfig().STRIKER!;
    this.spawnDelay = config.INITIAL_SPAWN_DELAY;
    this.minSpawnDelay = config.MIN_SPAWN_DELAY;
    this.spawnDifficultyIncrease = config.SPAWN_DIFFICULTY_INCREASE;

    this.initStrikerGroup();
    this.initBulletGroup();
    this.startSpawning();
  }

  setPlayer(player: Player): void {
    this.player = player;
  }

  private initStrikerGroup(): void {
    this.strikers = this.scene.physics.add.group({
      classType: StrikerEnemy,
      maxSize: 10,
      runChildUpdate: true
    });
  }

  private initBulletGroup(): void {
    this.strikerBullets = this.scene.physics.add.group({
      classType: EnemyBullet,
      maxSize: 30,
      runChildUpdate: true
    });
  }

  private startSpawning(): void {
    this.spawnTimer = this.scene.time.addEvent({
      delay: this.spawnDelay,
      callback: this.spawnStriker,
      callbackScope: this,
      loop: true
    });
  }

  private spawnStriker(): void {
    const x = Phaser.Math.Between(30, this.scene.cameras.main.width - 30);
    const y = -30;

    const striker = this.strikers.get(x, y, 'enemy_striker') as StrikerEnemy;

    if (striker) {
      striker.spawn(x, y);
      if (this.player) {
        striker.setShootingTargets(this.player, this.strikerBullets);
      }
    }
  }

  increaseDifficulty(): void {
    if (this.spawnDelay > this.minSpawnDelay) {
      this.spawnDelay -= this.spawnDifficultyIncrease;
      this.spawnDelay = Math.max(this.spawnDelay, this.minSpawnDelay);

      if (this.spawnTimer) {
        this.spawnTimer.destroy();
        this.startSpawning();
      }
    }
  }

  stopSpawning(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }
  }

  destroyAll(): void {
    this.stopSpawning();
    this.strikers.clear(true, true);
    this.strikerBullets.clear(true, true);
  }

  getStrikers(): Phaser.Physics.Arcade.Group {
    return this.strikers;
  }

  getStrikerBullets(): Phaser.Physics.Arcade.Group {
    return this.strikerBullets;
  }

  getSpawnDelay(): number {
    return this.spawnDelay;
  }
}
