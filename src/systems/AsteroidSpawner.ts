import Phaser from 'phaser';
import { Asteroid, AsteroidSize } from '../entities/Asteroid';
import { GameScene } from '@/scenes/GameScene';
import { BaseSpawner } from './BaseSpawner';

export class AsteroidSpawner extends BaseSpawner {
  constructor(scene: GameScene) {
    const config = scene.levelConfig.getAsteroidConfig();
    super(
      scene,
      {
        initial: config.INITIAL_SPAWN_DELAY,
        min: config.MIN_SPAWN_DELAY,
        increase: config.SPAWN_DIFFICULTY_INCREASE
      },
      { classType: Asteroid, maxSize: 15, runChildUpdate: true }
    );
    this.startSpawning();
  }

  protected doSpawn(): void {
    const size = AsteroidSpawner.randomSize();
    const { x, y } = this.randomEdgePosition();
    this.spawnSized(x, y, size);
  }

  protected spawnAt(x: number, y: number): void {
    this.spawnSized(x, y, AsteroidSpawner.randomSize());
  }

  spawnSingle(): void {
    this.spawnAt(this.scene.cameras.main.width / 2, -50);
  }

  private spawnSized(x: number, y: number, size: AsteroidSize): void {
    const asteroid = this.group.get(x, y, size) as Asteroid;
    if (asteroid) asteroid.spawn(x, y, size);
  }

  private static randomSize(): AsteroidSize {
    const roll = Phaser.Math.Between(1, 100);
    if (roll <= 50) return 'small';
    if (roll <= 85) return 'medium';
    return 'large';
  }

  private randomEdgePosition(): { x: number; y: number } {
    const margin = 50;
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    switch (Phaser.Math.Between(0, 3)) {
      case 0:
        return { x: Phaser.Math.Between(margin, width - margin), y: -margin };
      case 1:
        return { x: width + margin, y: Phaser.Math.Between(margin, height - margin) };
      case 2:
        return { x: Phaser.Math.Between(margin, width - margin), y: height + margin };
      default:
        return { x: -margin, y: Phaser.Math.Between(margin, height - margin) };
    }
  }

  getAsteroids(): Phaser.Physics.Arcade.Group {
    return this.group;
  }
}
