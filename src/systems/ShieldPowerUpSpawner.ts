import Phaser from 'phaser';
import { ShieldPowerUp } from '../entities/ShieldPowerUp';
import { Enemy } from '../entities/Enemy';
import { GameScene } from '@/scenes/GameScene';
import { BaseSpawner } from './BaseSpawner';

export class ShieldPowerUpSpawner extends BaseSpawner {
  private static readonly ENEMY_DROP_CHANCE = 0.1;

  private spawnRateMultiplier: number;

  constructor(scene: GameScene) {
    const enemyConfig = scene.levelConfig.getEnemyConfig();
    const shieldConfig = scene.levelConfig.getShieldPowerupConfig();
    const initialDelay = enemyConfig.INITIAL_SPAWN_DELAY * shieldConfig.SPAWN_RATE_MULTIPLIER;

    super(
      scene,
      { initial: initialDelay },
      { classType: ShieldPowerUp, maxSize: 5, runChildUpdate: true }
    );

    this.spawnRateMultiplier = shieldConfig.SPAWN_RATE_MULTIPLIER;
    scene.events.on('enemyDied', this.handleDeadEnemy, this);
    this.startSpawning();
  }

  protected spawnAt(x: number, y: number): void {
    const powerUp = this.group.get(x, y, 'shield_powerup') as ShieldPowerUp;
    if (powerUp) powerUp.spawn(x, y);
  }

  private handleDeadEnemy(enemy: Enemy): void {
    if (Phaser.Math.FloatBetween(0, 1) < ShieldPowerUpSpawner.ENEMY_DROP_CHANCE) {
      this.spawnAt(enemy.x, enemy.y);
    }
  }

  updateSpawnRate(enemySpawnDelay: number): void {
    this.spawnDelay = enemySpawnDelay * this.spawnRateMultiplier;
    this.restartTimer();
  }

  getPowerUps(): Phaser.Physics.Arcade.Group {
    return this.group;
  }
}
