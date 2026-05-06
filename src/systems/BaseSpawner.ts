import Phaser from 'phaser';
import { GameScene } from '@/scenes/GameScene';

export interface SpawnRates {
  initial: number;
  min?: number;
  increase?: number;
}

export abstract class BaseSpawner {
  protected scene: GameScene;
  protected group!: Phaser.Physics.Arcade.Group;
  protected spawnTimer?: Phaser.Time.TimerEvent;
  protected spawnDelay: number;
  protected minSpawnDelay: number;
  protected spawnDifficultyIncrease: number;

  constructor(
    scene: GameScene,
    rates: SpawnRates,
    groupConfig: Phaser.Types.Physics.Arcade.PhysicsGroupConfig
  ) {
    this.scene = scene;
    this.spawnDelay = rates.initial;
    this.minSpawnDelay = rates.min ?? 0;
    this.spawnDifficultyIncrease = rates.increase ?? 0;
    this.group = scene.physics.add.group(groupConfig);
  }

  protected abstract spawnAt(x: number, y: number): void;

  /** Default timer callback: spawn at random X across the top. Override for different positioning. */
  protected doSpawn(): void {
    const x = Phaser.Math.Between(30, this.scene.cameras.main.width - 30);
    this.spawnAt(x, -30);
  }

  startSpawning(): void {
    this.spawnTimer = this.scene.time.addEvent({
      delay: this.spawnDelay,
      callback: this.doSpawn,
      callbackScope: this,
      loop: true
    });
  }

  protected restartTimer(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.startSpawning();
    }
  }

  increaseDifficulty(): void {
    if (this.spawnDelay > this.minSpawnDelay) {
      this.spawnDelay -= this.spawnDifficultyIncrease;
      this.spawnDelay = Math.max(this.spawnDelay, this.minSpawnDelay);
      this.restartTimer();
    }
  }

  stopSpawning(): void {
    if (this.spawnTimer) this.spawnTimer.destroy();
  }

  destroyAll(): void {
    this.stopSpawning();
    this.group.clear(true, true);
  }

  getSpawnDelay(): number {
    return this.spawnDelay;
  }

  /** Test mode: spawn at center-top. */
  spawnSingle(): void {
    this.spawnAt(this.scene.cameras.main.width / 2, -30);
  }
}
