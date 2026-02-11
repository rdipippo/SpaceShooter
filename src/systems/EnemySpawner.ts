import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { EnemyBullet } from '../entities/EnemyBullet';
import { Player } from '../entities/Player';
import { GameScene } from '@/scenes/GameScene';

export class EnemySpawner {
  private scene: GameScene;
  private enemies!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private player: Player | null = null;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private spawnDelay: number;
  private minSpawnDelay: number;
  private spawnDifficultyIncrease: number;

  constructor(scene: GameScene) {
    this.scene = scene;
    const config = scene.levelConfig.getEnemyConfig();
    this.spawnDelay = config.INITIAL_SPAWN_DELAY;
    this.minSpawnDelay = config.MIN_SPAWN_DELAY;
    this.spawnDifficultyIncrease = config.SPAWN_DIFFICULTY_INCREASE;

    this.initEnemyGroup();
    this.initEnemyBulletGroup();
    this.startSpawning();
  }

  setPlayer(player: Player): void {
    this.player = player;
  }

  private initEnemyGroup(): void {
    this.enemies = this.scene.physics.add.group({
      classType: Enemy,
      maxSize: 20,
      runChildUpdate: true
    });
  }

  private initEnemyBulletGroup(): void {
    this.enemyBullets = this.scene.physics.add.group({
      classType: EnemyBullet,
      maxSize: 50,
      runChildUpdate: true
    });
  }

  private startSpawning(): void {
    this.spawnTimer = this.scene.time.addEvent({
      delay: this.spawnDelay,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
  }

  private spawnEnemy(): void {
    // Random X position at top of screen
    const x = Phaser.Math.Between(30, this.scene.cameras.main.width - 30);
    const y = -30;

    const enemy = this.enemies.get(x, y, 'enemy_basic') as Enemy;

    if (enemy) {
      enemy.spawn(x, y);
      if (this.player) {
        enemy.setShootingTargets(this.player, this.enemyBullets);
      }
    }
  }

  spawnSingle(): void {
    // Spawn at center top of screen
    const x = this.scene.cameras.main.width / 2;
    const y = -30;

    const enemy = this.enemies.get(x, y, 'enemy_basic') as Enemy;

    if (enemy) {
      enemy.spawn(x, y);
      if (this.player) {
        enemy.setShootingTargets(this.player, this.enemyBullets);
      }
    }
  }

  increaseDifficulty(): void {
    // Reduce spawn delay
    if (this.spawnDelay > this.minSpawnDelay) {
      this.spawnDelay -= this.spawnDifficultyIncrease;
      this.spawnDelay = Math.max(this.spawnDelay, this.minSpawnDelay);

      // Restart timer with new delay
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
    this.enemies.clear(true, true);
    this.enemyBullets.clear(true, true);
  }

  getEnemies(): Phaser.Physics.Arcade.Group {
    return this.enemies;
  }

  getEnemyBullets(): Phaser.Physics.Arcade.Group {
    return this.enemyBullets;
  }

  getSpawnDelay(): number {
    return this.spawnDelay;
  }
}
