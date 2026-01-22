import Phaser from 'phaser';
import { BOSS_CONFIG, GAME_CONFIG } from '../utils/Constants';
import { BossBullet } from './BossBullet';
import { Player } from './Player';
import { Bullet } from './Bullet';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  private health: number;
  private maxHealth: number;
  private speed: number;
  public scoreValue: number;
  private lastFireTime: number = 0;
  private player: Player | null = null;
  private bullets: Phaser.Physics.Arcade.Group | null = null;
  private gunPositions: number[] = [];
  private targetX: number;
  private isDodging: boolean = false;
  private healthBar: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'boss');

    this.health = BOSS_CONFIG.HEALTH;
    this.maxHealth = BOSS_CONFIG.HEALTH;
    this.speed = BOSS_CONFIG.SPEED;
    this.scoreValue = BOSS_CONFIG.SCORE_VALUE;
    this.targetX = x;

    // Calculate gun positions spread across the boss width
    const gunCount = BOSS_CONFIG.SHOOTING.GUN_COUNT;
    const gunSpacing = BOSS_CONFIG.WIDTH / (gunCount + 1);
    for (let i = 1; i <= gunCount; i++) {
      this.gunPositions.push(-BOSS_CONFIG.WIDTH / 2 + gunSpacing * i);
    }

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(BOSS_CONFIG.WIDTH - 20, BOSS_CONFIG.HEIGHT - 10);
    body.setCollideWorldBounds(true);

    // Create health bar
    this.createHealthBar();
  }

  private createHealthBar(): void {
    this.healthBar = this.scene.add.graphics();
    this.updateHealthBar();
  }

  private updateHealthBar(): void {
    if (!this.healthBar) return;

    this.healthBar.clear();

    const barWidth = BOSS_CONFIG.WIDTH;
    const barHeight = 8;
    const barX = this.x - barWidth / 2;
    const barY = this.y - BOSS_CONFIG.HEIGHT / 2 - 15;

    // Background
    this.healthBar.fillStyle(0x333333, 0.8);
    this.healthBar.fillRect(barX, barY, barWidth, barHeight);

    // Health fill
    const healthPercent = this.health / this.maxHealth;
    const fillColor = healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000;
    this.healthBar.fillStyle(fillColor, 1);
    this.healthBar.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    // Border
    this.healthBar.lineStyle(2, 0xffffff, 0.8);
    this.healthBar.strokeRect(barX, barY, barWidth, barHeight);
  }

  setShootingTargets(player: Player, bullets: Phaser.Physics.Arcade.Group): void {
    this.player = player;
    this.bullets = bullets;
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (!this.active) return;

    // Check for incoming player bullets and dodge
    this.checkAndDodge();

    // Move towards target position
    this.moveTowardsTarget();

    // Update health bar position
    this.updateHealthBar();

    // Shoot at player
    this.tryShootAtPlayer(time);
  }

  private checkAndDodge(): void {
    if (!this.player || !this.player.active) return;

    const playerBullets = this.player.getBullets();
    const children = playerBullets.getChildren();
    let closestBulletX = 0;
    let closestDistance = Infinity;
    let foundBullet = false;

    // Find the closest incoming bullet
    for (const child of children) {
      const bullet = child as Bullet;
      if (!bullet.active) continue;

      // Only consider bullets that are below the boss (heading towards it)
      if (bullet.y < this.y) continue;

      // Check if bullet is within horizontal range of boss
      const dx = Math.abs(bullet.x - this.x);
      if (dx < BOSS_CONFIG.WIDTH / 2 + BOSS_CONFIG.DODGE.REACTION_DISTANCE) {
        const dy = bullet.y - this.y;
        if (dy < closestDistance && dy > 0) {
          closestDistance = dy;
          closestBulletX = bullet.x;
          foundBullet = true;
        }
      }
    }

    // Dodge if a bullet is close
    if (foundBullet && closestDistance < BOSS_CONFIG.DODGE.REACTION_DISTANCE) {
      this.isDodging = true;
      // Move away from the bullet
      if (closestBulletX < this.x) {
        // Bullet is to the left, move right
        this.targetX = Math.min(GAME_CONFIG.WIDTH - BOSS_CONFIG.WIDTH / 2 - 10, this.x + 100);
      } else {
        // Bullet is to the right, move left
        this.targetX = Math.max(BOSS_CONFIG.WIDTH / 2 + 10, this.x - 100);
      }
    } else {
      this.isDodging = false;
      // When not dodging, slowly move towards player's x position
      if (this.player && this.player.active) {
        this.targetX = Phaser.Math.Clamp(
          this.player.x,
          BOSS_CONFIG.WIDTH / 2 + 10,
          GAME_CONFIG.WIDTH - BOSS_CONFIG.WIDTH / 2 - 10
        );
      }
    }
  }

  private moveTowardsTarget(): void {
    const dx = this.targetX - this.x;
    const currentSpeed = this.isDodging ? BOSS_CONFIG.DODGE.DODGE_SPEED : this.speed;

    if (Math.abs(dx) > 5) {
      this.setVelocityX(Math.sign(dx) * currentSpeed);
    } else {
      this.setVelocityX(0);
    }
  }

  private tryShootAtPlayer(time: number): void {
    if (!this.player || !this.bullets || !this.player.active) return;

    // Check fire rate
    if (time - this.lastFireTime >= BOSS_CONFIG.SHOOTING.FIRE_RATE) {
      this.shoot();
      this.lastFireTime = time;
    }
  }

  private shoot(): void {
    if (!this.bullets) return;

    // Fire from all gun positions
    for (const gunOffset of this.gunPositions) {
      const bulletX = this.x + gunOffset;
      const bulletY = this.y + BOSS_CONFIG.HEIGHT / 2;

      const bullet = this.bullets.get(bulletX, bulletY) as BossBullet;
      if (bullet) {
        bullet.fire(bulletX, bulletY);
      }
    }
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;

    // Flash effect when hit
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      if (this.active) {
        this.clearTint();
      }
    });

    this.updateHealthBar();

    if (this.health <= 0) {
      this.die();
      return true; // Boss destroyed
    }

    return false;
  }

  private die(): void {
    // Create large explosion effect
    this.createExplosion();

    // Clean up health bar
    if (this.healthBar) {
      this.healthBar.destroy();
      this.healthBar = null;
    }

    this.setActive(false);
    this.setVisible(false);
    // Note: bossDestroyed event is emitted by CollisionManager to avoid double emission
  }

  private createExplosion(): void {
    // Create multiple explosion bursts for dramatic effect
    for (let i = 0; i < 5; i++) {
      const offsetX = Phaser.Math.Between(-BOSS_CONFIG.WIDTH / 3, BOSS_CONFIG.WIDTH / 3);
      const offsetY = Phaser.Math.Between(-BOSS_CONFIG.HEIGHT / 3, BOSS_CONFIG.HEIGHT / 3);

      this.scene.time.delayedCall(i * 100, () => {
        const particles = this.scene.add.particles(this.x + offsetX, this.y + offsetY, 'explosion_particle', {
          speed: { min: 100, max: 300 },
          scale: { start: 2, end: 0 },
          lifespan: 500,
          quantity: 20,
          blendMode: 'ADD'
        });

        this.scene.time.delayedCall(500, () => {
          particles.destroy();
        });
      });
    }
  }

  getHealth(): number {
    return this.health;
  }

  destroy(fromScene?: boolean): void {
    if (this.healthBar) {
      this.healthBar.destroy();
      this.healthBar = null;
    }
    super.destroy(fromScene);
  }
}
