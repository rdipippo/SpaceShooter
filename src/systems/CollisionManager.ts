import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { Asteroid } from '../entities/Asteroid';
import { ShieldPowerUp } from '../entities/ShieldPowerUp';
import { EnemySpawner } from './EnemySpawner';
import { AsteroidSpawner } from './AsteroidSpawner';
import { ShieldPowerUpSpawner } from './ShieldPowerUpSpawner';

export class CollisionManager {
  private scene: Phaser.Scene;
  private player: Player;
  private enemySpawner: EnemySpawner;
  private asteroidSpawner?: AsteroidSpawner;
  private shieldPowerUpSpawner?: ShieldPowerUpSpawner;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    enemySpawner: EnemySpawner,
    asteroidSpawner?: AsteroidSpawner,
    shieldPowerUpSpawner?: ShieldPowerUpSpawner
  ) {
    this.scene = scene;
    this.player = player;
    this.enemySpawner = enemySpawner;
    this.asteroidSpawner = asteroidSpawner;
    this.shieldPowerUpSpawner = shieldPowerUpSpawner;

    this.setupCollisions();
  }

  private setupCollisions(): void {
    // Player bullets hit enemies
    this.scene.physics.add.overlap(
      this.player.getBullets(),
      this.enemySpawner.getEnemies(),
      this.bulletEnemyCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Player collides with enemies
    this.scene.physics.add.overlap(
      this.player,
      this.enemySpawner.getEnemies(),
      this.playerEnemyCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Set up asteroid collisions if spawner exists
    if (this.asteroidSpawner) {
      // Player bullets hit asteroids
      this.scene.physics.add.overlap(
        this.player.getBullets(),
        this.asteroidSpawner.getAsteroids(),
        this.bulletAsteroidCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
        undefined,
        this
      );

      // Player collides with asteroids
      this.scene.physics.add.overlap(
        this.player,
        this.asteroidSpawner.getAsteroids(),
        this.playerAsteroidCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
        undefined,
        this
      );
    }

    // Set up shield power-up collisions if spawner exists
    if (this.shieldPowerUpSpawner) {
      this.scene.physics.add.overlap(
        this.player,
        this.shieldPowerUpSpawner.getPowerUps(),
        this.playerPowerUpCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
        undefined,
        this
      );
    }
  }

  private bulletEnemyCollision(
    bulletObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const bullet = bulletObj as Bullet;
    const enemy = enemyObj as Enemy;

    if (!bullet.active || !enemy.active) return;

    // Destroy bullet
    bullet.setActive(false);
    bullet.setVisible(false);

    // Damage enemy
    const destroyed = enemy.takeDamage(bullet.damage);

    if (destroyed) {
      // Emit event to add score
      this.scene.events.emit('enemyDestroyed', enemy.scoreValue);
    }
  }

  private playerEnemyCollision(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    enemyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const player = playerObj as Player;
    const enemy = enemyObj as Enemy;

    if (!player.active || !enemy.active) return;

    // Damage player
    player.takeDamage(1);

    // Destroy enemy
    enemy.takeDamage(999);
  }

  private bulletAsteroidCollision(
    bulletObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    asteroidObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const bullet = bulletObj as Bullet;
    const asteroid = asteroidObj as Asteroid;

    if (!bullet.active || !asteroid.active) return;

    // Destroy bullet
    bullet.setActive(false);
    bullet.setVisible(false);

    // Damage asteroid
    const destroyed = asteroid.takeDamage(bullet.damage);

    if (destroyed) {
      // Emit event to add score
      this.scene.events.emit('asteroidDestroyed', asteroid.scoreValue);
    }
  }

  private playerAsteroidCollision(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    asteroidObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const player = playerObj as Player;
    const asteroid = asteroidObj as Asteroid;

    if (!player.active || !asteroid.active) return;

    // Damage player
    player.takeDamage(1);

    // Destroy asteroid
    asteroid.takeDamage(999);
  }

  private playerPowerUpCollision(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    powerUpObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const player = playerObj as Player;
    const powerUp = powerUpObj as ShieldPowerUp;

    if (!player.active || !powerUp.active) return;

    // Heal player
    player.heal(powerUp.healAmount);

    // Collect power-up (triggers effect and deactivates)
    powerUp.collect();

    // Emit event for UI feedback
    this.scene.events.emit('shieldCollected');
  }
}
