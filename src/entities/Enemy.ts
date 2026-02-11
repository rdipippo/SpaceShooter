import Phaser from 'phaser';
import { EnemyBullet } from './EnemyBullet';
import { Player } from './Player';
import { GameScene } from '@/scenes/GameScene';
import { EnemyConfig } from '@/utils/LevelConfig';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private health!: number;
  private speed!: number;
  public scoreValue!: number;
  private lastFireTime: number = 0;
  private player: Player | null = null;
  private bullets: Phaser.Physics.Arcade.Group | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, type: string = 'basic') {
    super(scene, x, y, `enemy_${type}`);

    this.setEnemyProperties(type);

    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  private getEnemyConfig(): EnemyConfig {
    return (this.scene as GameScene).levelConfig.getEnemyConfig();
  }

  setShootingTargets(player: Player, bullets: Phaser.Physics.Arcade.Group): void {
    this.player = player;
    this.bullets = bullets;
  }

  private setEnemyProperties(type: string): void {
    const config = this.getEnemyConfig();
    switch (type) {
      case 'basic':
        this.health = config.BASIC.HEALTH;
        this.speed = config.BASIC.SPEED;
        this.scoreValue = config.BASIC.SCORE_VALUE;
        break;
      default:
        this.health = 1;
        this.speed = 100;
        this.scoreValue = 10;
    }
  }

  spawn(x: number, y: number): void {
    this.setTexture('enemy_basic');
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setVelocityY(this.speed);
    this.lastFireTime = 0;
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    // Destroy enemy if it goes off-screen (bottom)
    if (this.y > this.scene.cameras.main.height + this.height) {
      this.setActive(false);
      this.setVisible(false);
      return;
    }

    // Check if player is within range and shoot
    this.tryShootAtPlayer(time);
  }

  private tryShootAtPlayer(time: number): void {
    if (!this.player || !this.bullets || !this.player.active) return;

    const config = this.getEnemyConfig();

    // Calculate distance to player
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only shoot if player is within detection range and below the enemy
    if (distance <= config.SHOOTING.DETECTION_RANGE && dy > 0) {
      // Check fire rate
      if (time - this.lastFireTime >= config.SHOOTING.FIRE_RATE) {
        this.shoot();
        this.lastFireTime = time;
      }
    }
  }

  private shoot(): void {
    if (!this.bullets) return;

    const bullet = this.bullets.get(this.x, this.y + 20) as EnemyBullet;
    if (bullet) {
      bullet.fire(this.x, this.y + 20);
    }
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;

    if (this.health <= 0) {
      this.die();
      return true; // Enemy destroyed
    }

    return false;
  }

  private die(): void {
    // Create explosion effect
    this.createExplosion();
    

    this.setActive(false);
    this.setVisible(false);
    
    this.scene.events.emit('enemyDied', this);
  }

  private createExplosion(): void {
    // Create particle explosion
    const particles = this.scene.add.particles(this.x, this.y, 'explosion_particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      lifespan: 300,
      quantity: 10,
      blendMode: 'ADD'
    });

    // Auto-destroy particles after explosion
    this.scene.time.delayedCall(300, () => {
      particles.destroy();
    });
  }
}
