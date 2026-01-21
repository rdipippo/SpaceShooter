import Phaser from 'phaser';
import { ShieldPowerUp } from '../entities/ShieldPowerUp';
import { ENEMY_CONFIG, SHIELD_POWERUP_CONFIG } from '../utils/Constants';
import { Enemy } from '../entities/Enemy';

export class ShieldPowerUpSpawner {
  private scene: Phaser.Scene;
  private powerUps!: Phaser.Physics.Arcade.Group;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private spawnDelay: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    // Spawn at 10% of enemy rate (10x slower than enemies)
    this.spawnDelay = ENEMY_CONFIG.INITIAL_SPAWN_DELAY * SHIELD_POWERUP_CONFIG.SPAWN_RATE_MULTIPLIER;
    
    this.scene.events.on('enemyDied', this.handleDeadEnemy, this);

    this.initPowerUpGroup();
    this.startSpawning();
  }

  private initPowerUpGroup(): void {
    this.powerUps = this.scene.physics.add.group({
      classType: ShieldPowerUp,
      maxSize: 5,
      runChildUpdate: true
    });
  }

  private startSpawning(): void {
    this.spawnTimer = this.scene.time.addEvent({
      delay: this.spawnDelay,
      callback: this.spawnRandomPowerUp,
      callbackScope: this,
      loop: true
    });
  }
  
  private handleDeadEnemy(enemy : Enemy) {
      this.spawnPowerUp(enemy.x, enemy.y); 
  }

  private spawnPowerUp(x: number, y: number) {
    const powerUp = this.powerUps.get(x, y, 'shield_powerup') as ShieldPowerUp;
    
    if (powerUp) {
      powerUp.spawn(x, y);
    }
  }
  
  private spawnRandomPowerUp(): void {
    // Random X position at top of screen
    const x = Phaser.Math.Between(30, this.scene.cameras.main.width - 30);
    const y = -30;

    this.spawnPowerUp(x, y);
  }

  spawnSingle(): void {
    // Spawn at center top of screen
    const x = this.scene.cameras.main.width / 2;
    const y = -30;

    this.spawnPowerUp(x, y);
  }

  updateSpawnRate(enemySpawnDelay: number): void {
    // Keep power-up spawn rate at 10% of enemy rate
    this.spawnDelay = enemySpawnDelay * SHIELD_POWERUP_CONFIG.SPAWN_RATE_MULTIPLIER;

    // Restart timer with new delay
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.startSpawning();
    }
  }

  stopSpawning(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }
  }

  destroyAll(): void {
    this.stopSpawning();
    this.powerUps.clear(true, true);
  }

  getPowerUps(): Phaser.Physics.Arcade.Group {
    return this.powerUps;
  }
}
