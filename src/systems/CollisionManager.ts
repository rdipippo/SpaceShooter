import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Asteroid } from '../entities/Asteroid';
import { ShieldPowerUp } from '../entities/ShieldPowerUp';
import { EnemySpawner } from './EnemySpawner';
import { AsteroidSpawner } from './AsteroidSpawner';
import { ShieldPowerUpSpawner } from './ShieldPowerUpSpawner';
import { BossSpawner } from './BossSpawner';
import { StrikerSpawner } from './StrikerSpawner';

type ArcadeBullet = Phaser.Physics.Arcade.Sprite & { damage: number };

interface DamageableTarget extends Phaser.Physics.Arcade.Sprite {
  takeDamage(n: number): boolean;
  scoreValue: number;
}

type ArcadeCallback = Phaser.Types.Physics.Arcade.ArcadePhysicsCallback;

export class CollisionManager {
  private scene: Phaser.Scene;
  private player: Player;
  private enemySpawner: EnemySpawner;
  private asteroidSpawner?: AsteroidSpawner;
  private shieldPowerUpSpawner?: ShieldPowerUpSpawner;
  private bossSpawner?: BossSpawner;
  private strikerSpawner?: StrikerSpawner;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    enemySpawner: EnemySpawner,
    asteroidSpawner?: AsteroidSpawner,
    shieldPowerUpSpawner?: ShieldPowerUpSpawner,
    bossSpawner?: BossSpawner,
    strikerSpawner?: StrikerSpawner
  ) {
    this.scene = scene;
    this.player = player;
    this.enemySpawner = enemySpawner;
    this.asteroidSpawner = asteroidSpawner;
    this.shieldPowerUpSpawner = shieldPowerUpSpawner;
    this.bossSpawner = bossSpawner;
    this.strikerSpawner = strikerSpawner;

    this.setupCollisions();
  }

  private setupCollisions(): void {
    const playerBullets = this.player.getBullets();

    this.scene.physics.add.overlap(
      playerBullets,
      this.enemySpawner.getEnemies(),
      this.bulletVsTarget('enemyDestroyed'),
      undefined,
      this
    );
    this.scene.physics.add.overlap(
      this.player,
      this.enemySpawner.getEnemies(),
      this.playerVsTarget(),
      undefined,
      this
    );
    this.scene.physics.add.overlap(
      this.player,
      this.enemySpawner.getEnemyBullets(),
      this.bulletVsPlayer(),
      undefined,
      this
    );

    if (this.asteroidSpawner) {
      const asteroids = this.asteroidSpawner.getAsteroids();
      this.scene.physics.add.overlap(
        playerBullets,
        asteroids,
        this.bulletVsTarget('asteroidDestroyed'),
        undefined,
        this
      );
      this.scene.physics.add.overlap(
        this.player,
        asteroids,
        this.playerVsTarget(),
        undefined,
        this
      );
      this.scene.physics.add.collider(
        asteroids,
        asteroids,
        this.asteroidAsteroidCollision as ArcadeCallback,
        this.asteroidAsteroidProcess as ArcadeCallback,
        this
      );
    }

    if (this.shieldPowerUpSpawner) {
      this.scene.physics.add.overlap(
        this.player,
        this.shieldPowerUpSpawner.getPowerUps(),
        this.playerPowerUpCollision as ArcadeCallback,
        undefined,
        this
      );
    }

    if (this.strikerSpawner) {
      this.scene.physics.add.overlap(
        playerBullets,
        this.strikerSpawner.getStrikers(),
        this.bulletVsTarget('enemyDestroyed'),
        undefined,
        this
      );
      this.scene.physics.add.overlap(
        this.player,
        this.strikerSpawner.getStrikers(),
        this.playerVsTarget(),
        undefined,
        this
      );
      this.scene.physics.add.overlap(
        this.player,
        this.strikerSpawner.getStrikerBullets(),
        this.bulletVsPlayer(),
        undefined,
        this
      );
    }

    if (this.bossSpawner) {
      this.scene.physics.add.overlap(
        this.player,
        this.bossSpawner.getBossBullets(),
        this.bulletVsPlayer(),
        undefined,
        this
      );
      this.scene.events.on('bossSpawned', this.setupBossCollisions, this);
    }
  }

  private setupBossCollisions(): void {
    if (!this.bossSpawner) return;
    const boss = this.bossSpawner.getBoss();
    if (!boss) return;

    this.scene.physics.add.overlap(
      this.player.getBullets(),
      boss,
      this.bulletVsTarget('bossDestroyed'),
      undefined,
      this
    );
    this.scene.physics.add.overlap(
      this.player,
      boss,
      this.playerBossCollision as ArcadeCallback,
      undefined,
      this
    );
  }

  /** Bullet hits a damageable target — deactivate bullet, damage target, emit event on kill. */
  private bulletVsTarget(eventName: string): ArcadeCallback {
    return (a, b) => {
      const bullet = a as ArcadeBullet;
      const target = b as DamageableTarget;
      if (!bullet.active || !target.active) return;
      bullet.setActive(false);
      bullet.setVisible(false);
      if (target.takeDamage(bullet.damage)) {
        this.scene.events.emit(eventName, target.scoreValue);
      }
    };
  }

  /** Player rams a damageable target — player takes 1 damage, target dies. */
  private playerVsTarget(): ArcadeCallback {
    return (p, t) => {
      const player = p as Player;
      const target = t as DamageableTarget;
      if (!player.active || !target.active) return;
      player.takeDamage(1);
      target.takeDamage(999);
    };
  }

  /** Enemy/boss bullet hits player — deactivate bullet, damage player. */
  private bulletVsPlayer(): ArcadeCallback {
    return (p, b) => {
      const player = p as Player;
      const bullet = b as ArcadeBullet;
      if (!player.active || !bullet.active) return;
      bullet.setActive(false);
      bullet.setVisible(false);
      player.takeDamage(bullet.damage);
    };
  }

  /** Only run asteroid-asteroid damage when overlap is deep enough (so visuals look like they're touching). */
  private asteroidAsteroidProcess(
    a1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    a2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): boolean {
    const a = a1 as Asteroid;
    const b = a2 as Asteroid;
    if (!a.active || !b.active || a === b) return false;
    const sumRadii = a.getCollisionRadius() + b.getCollisionRadius();
    const distance = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
    return distance < sumRadii * 0.9;
  }

  private asteroidAsteroidCollision(
    a1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    a2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const a = a1 as Asteroid;
    const b = a2 as Asteroid;
    if (!a.active || !b.active || a === b) return;
    if (!a.canTakeAsteroidCollisionDamage() || !b.canTakeAsteroidCollisionDamage()) return;

    a.markAsteroidCollisionDamage();
    b.markAsteroidCollisionDamage();

    if (a.takeDamage(1)) this.scene.events.emit('asteroidDestroyed', a.scoreValue);
    if (b.takeDamage(1)) this.scene.events.emit('asteroidDestroyed', b.scoreValue);
  }

  private playerPowerUpCollision(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    powerUpObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const player = playerObj as Player;
    const powerUp = powerUpObj as ShieldPowerUp;
    if (!player.active || !powerUp.active) return;
    player.heal(powerUp.healAmount);
    powerUp.collect();
    this.scene.events.emit('shieldCollected');
  }

  /** Boss body hit — player takes damage, boss is invulnerable to ramming. */
  private playerBossCollision(
    playerObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    _bossObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void {
    const player = playerObj as Player;
    if (!player.active) return;
    player.takeDamage(1);
  }
}
