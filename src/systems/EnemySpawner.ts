import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { ENEMY_CONFIG } from '../utils/Constants';

export class EnemySpawner {
  private scene: Phaser.Scene;
  private enemies!: Phaser.Physics.Arcade.Group;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private spawnDelay: number;
  private minSpawnDelay: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.spawnDelay = ENEMY_CONFIG.INITIAL_SPAWN_DELAY;
    this.minSpawnDelay = ENEMY_CONFIG.MIN_SPAWN_DELAY;

    this.initEnemyGroup();
    this.startSpawning();
  }

  private initEnemyGroup(): void {
    this.enemies = this.scene.physics.add.group({
      classType: Enemy,
      maxSize: 20,
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
    }
  }

  increaseDifficulty(): void {
    // Reduce spawn delay
    if (this.spawnDelay > this.minSpawnDelay) {
      this.spawnDelay -= ENEMY_CONFIG.SPAWN_DIFFICULTY_INCREASE;
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
  }

  getEnemies(): Phaser.Physics.Arcade.Group {
    return this.enemies;
  }

  getSpawnDelay(): number {
    return this.spawnDelay;
  }
}
