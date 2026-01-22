import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { EnemyBullet } from '../entities/EnemyBullet';
import { Asteroid } from '../entities/Asteroid';
import { ShieldPowerUp } from '../entities/ShieldPowerUp';
import { Boss } from '../entities/Boss';
import { BossBullet } from '../entities/BossBullet';
import { EnemySpawner } from './EnemySpawner';
import { AsteroidSpawner } from './AsteroidSpawner';
import { ShieldPowerUpSpawner } from './ShieldPowerUpSpawner';
import { BossSpawner } from './BossSpawner';

export class CollisionManager {
  private scene: Phaser.Scene;
  private player: Player;
  private enemySpawner: EnemySpawner;
  private asteroidSpawner?: AsteroidSpawner;
  private shieldPowerUpSpawner?: ShieldPowerUpSpawner;
  private bossSpawner?: BossSpawner;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    enemySpawner: EnemySpawner,
    asteroidSpawner?: AsteroidSpawner,
    shieldPowerUpSpawner?: ShieldPowerUpSpawner,
    bossSpawner?: BossSpawner
  ) {
    this.scene = scene;
    this.player = player;
    this.enemySpawner = enemySpawner;
    this.asteroidSpawner = asteroidSpawner;
    this.shieldPowerUpSpawner = shieldPowerUpSpawner;
    this.bossSpawner = bossSpawner;

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

    // Enemy bullets hit player
    this.scene.physics.add.overlap(
      this.player,
      this.enemySpawner.getEnemyBullets(),
      this.enemyBulletPlayerCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
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

    // Set up boss collisions if spawner exists
    if (this.bossSpawner) {
      // Boss bullets hit player
      this.scene.physics.add.overlap(
        this.player,
        this.bossSpawner.getBossBullets(),
        this.bossBulletPlayerCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
        undefined,
        this
      );

      // Listen for boss spawn to set up boss-specific collisions
      this.scene.events.on('bossSpawned', this.setupBossCollisions, this);
    }
  }

  private setupBossCollisions(): void {
    if (!this.bossSpawner) return;

    const boss = this.bossSpawner.getBoss();
    if (!boss) return;

    // Player bullets hit boss
    this.scene.physics.add.overlap(
      this.player.getBullets(),
      boss,
      this.bulletBossCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Player collides with boss
    this.scene.physics.add.overlap(
      this.player,
      boss,
      this.playerBossCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
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

  private enemyBulletPlayerCollision(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    bulletObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const player = playerObj as Player;
    const bullet = bulletObj as EnemyBullet;

    if (!player.active || !bullet.active) return;

    // Destroy bullet
    bullet.setActive(false);
    bullet.setVisible(false);

    // Damage player
    player.takeDamage(bullet.damage);
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

  private bossBulletPlayerCollision(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    bulletObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const player = playerObj as Player;
    const bullet = bulletObj as BossBullet;

    if (!player.active || !bullet.active) return;

    // Destroy bullet
    bullet.setActive(false);
    bullet.setVisible(false);

    // Damage player
    player.takeDamage(bullet.damage);
  }

  private bulletBossCollision(
    bossObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    bulletObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const bullet = bulletObj as Bullet;
    const boss = bossObj as Boss;

    if (!bullet.active || !boss.active) return;

    // Destroy bullet
    bullet.setActive(false);
    bullet.setVisible(false);

    // Damage boss
    const destroyed = boss.takeDamage(bullet.damage);

    if (destroyed) {
      // Emit event to add score
      this.scene.events.emit('bossDestroyed', boss.scoreValue);
    }
  }

  private playerBossCollision(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    bossObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const player = playerObj as Player;
    const boss = bossObj as Boss;

    if (!player.active || !boss.active) return;

    // Damage player heavily for touching boss
    player.takeDamage(1);
  }
}
