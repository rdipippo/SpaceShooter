import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { EnemySpawner } from './EnemySpawner';

export class CollisionManager {
  private scene: Phaser.Scene;
  private player: Player;
  private enemySpawner: EnemySpawner;

  constructor(scene: Phaser.Scene, player: Player, enemySpawner: EnemySpawner) {
    this.scene = scene;
    this.player = player;
    this.enemySpawner = enemySpawner;

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
}
