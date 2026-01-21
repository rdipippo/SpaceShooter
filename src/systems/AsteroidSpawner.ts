import Phaser from 'phaser';
import { Asteroid, AsteroidSize } from '../entities/Asteroid';
import { ASTEROID_CONFIG } from '../utils/Constants';

export class AsteroidSpawner {
  private scene: Phaser.Scene;
  private asteroids!: Phaser.Physics.Arcade.Group;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private spawnDelay: number;
  private minSpawnDelay: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.spawnDelay = ASTEROID_CONFIG.INITIAL_SPAWN_DELAY;
    this.minSpawnDelay = ASTEROID_CONFIG.MIN_SPAWN_DELAY;

    this.initAsteroidGroup();
    this.startSpawning();
  }

  private initAsteroidGroup(): void {
    this.asteroids = this.scene.physics.add.group({
      classType: Asteroid,
      maxSize: 15,
      runChildUpdate: true
    });
  }

  private startSpawning(): void {
    this.spawnTimer = this.scene.time.addEvent({
      delay: this.spawnDelay,
      callback: this.spawnAsteroid,
      callbackScope: this,
      loop: true
    });
  }

  private spawnAsteroid(): void {
    // Random size selection (weighted towards smaller asteroids)
    const sizeRoll = Phaser.Math.Between(1, 100);
    let size: AsteroidSize;
    if (sizeRoll <= 50) {
      size = 'small';
    } else if (sizeRoll <= 85) {
      size = 'medium';
    } else {
      size = 'large';
    }

    // Spawn from random edge of screen
    const edge = Phaser.Math.Between(0, 3);
    let x: number, y: number;
    const margin = 50;
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    switch (edge) {
      case 0: // Top
        x = Phaser.Math.Between(margin, width - margin);
        y = -margin;
        break;
      case 1: // Right
        x = width + margin;
        y = Phaser.Math.Between(margin, height - margin);
        break;
      case 2: // Bottom
        x = Phaser.Math.Between(margin, width - margin);
        y = height + margin;
        break;
      case 3: // Left
      default:
        x = -margin;
        y = Phaser.Math.Between(margin, height - margin);
        break;
    }

    const asteroid = this.asteroids.get(x, y, size) as Asteroid;

    if (asteroid) {
      asteroid.spawn(x, y, size);
    }
  }

  spawnSingle(): void {
    // Random size for manual spawn
    const sizeRoll = Phaser.Math.Between(1, 100);
    let size: AsteroidSize;
    if (sizeRoll <= 50) {
      size = 'small';
    } else if (sizeRoll <= 85) {
      size = 'medium';
    } else {
      size = 'large';
    }

    // Spawn at center top of screen
    const x = this.scene.cameras.main.width / 2;
    const y = -50;

    const asteroid = this.asteroids.get(x, y, size) as Asteroid;

    if (asteroid) {
      asteroid.spawn(x, y, size);
    }
  }

  increaseDifficulty(): void {
    if (this.spawnDelay > this.minSpawnDelay) {
      this.spawnDelay -= ASTEROID_CONFIG.SPAWN_DIFFICULTY_INCREASE;
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
    this.asteroids.clear(true, true);
  }

  getAsteroids(): Phaser.Physics.Arcade.Group {
    return this.asteroids;
  }
}
