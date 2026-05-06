import Phaser from 'phaser';
import { EnemyBullet } from './EnemyBullet';
import { Player } from './Player';
import { GameScene } from '@/scenes/GameScene';
import { StrikerConfig } from '@/utils/LevelConfig';
import { emitBurst, flashTint, respawnSprite } from '@/utils/Effects';

const enum StrikerState {
  PATROL = 'PATROL',
  DIVING = 'DIVING'
}

export class StrikerEnemy extends Phaser.Physics.Arcade.Sprite {
  private health: number = 2;
  private patrolSpeed: number = 80;
  private diveSpeed: number = 300;
  public scoreValue: number = 25;
  private strikerState: StrikerState = StrikerState.PATROL;
  private player: Player | null = null;
  private bullets: Phaser.Physics.Arcade.Group | null = null;
  private lastFireTime: number = 0;
  private patrolTime: number = 0;
  private detectionRange: number = 350;
  private fireRate: number = 600;
  private bulletSpeed: number = 300;
  private bulletDamage: number = 1;
  private readonly cfg: StrikerConfig | undefined;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy_striker');
    this.cfg = (scene as GameScene).levelConfig.getEnemyConfig().STRIKER;
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  setShootingTargets(player: Player, bullets: Phaser.Physics.Arcade.Group): void {
    this.player = player;
    this.bullets = bullets;
  }

  spawn(x: number, y: number): void {
    if (this.cfg) {
      this.health = this.cfg.HEALTH;
      this.patrolSpeed = this.cfg.SPEED;
      this.diveSpeed = this.cfg.DIVE_SPEED;
      this.scoreValue = this.cfg.SCORE_VALUE;
      this.detectionRange = this.cfg.DETECTION_RANGE;
      this.fireRate = this.cfg.FIRE_RATE;
      this.bulletSpeed = this.cfg.BULLET_SPEED;
      this.bulletDamage = this.cfg.BULLET_DAMAGE;
    }

    respawnSprite(this, x, y, 'enemy_striker');
    this.setAlpha(1);
    this.clearTint();
    this.strikerState = StrikerState.PATROL;
    this.patrolTime = 0;
    this.lastFireTime = 0;
    this.setVelocity(0, this.patrolSpeed);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    const cam = this.scene.cameras.main;

    if (
      this.y > cam.height + this.height ||
      this.x < -this.width ||
      this.x > cam.width + this.width
    ) {
      this.setActive(false);
      this.setVisible(false);
      return;
    }

    switch (this.strikerState) {
      case StrikerState.PATROL:
        this.updatePatrol(time, delta);
        break;
      case StrikerState.DIVING:
        this.updateDiving(time);
        break;
    }
  }

  private updatePatrol(time: number, delta: number): void {
    this.patrolTime += delta;
    // Sinusoidal horizontal drift while descending — visually distinct from basic enemy
    const sineVx = Math.sin(this.patrolTime * 0.002) * 80;
    this.setVelocityX(sineVx);
    this.setVelocityY(this.patrolSpeed);

    if (!this.player || !this.player.active) return;

    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Lock on and dive when player is in range and below
    if (distance <= this.detectionRange && dy > 0) {
      this.startDive();
    }
  }

  private startDive(): void {
    if (!this.player) return;
    this.strikerState = StrikerState.DIVING;

    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    this.setVelocity(
      (dx / length) * this.diveSpeed,
      (dy / length) * this.diveSpeed
    );

    // Brief flash to signal the attack run start
    this.scene.tweens.add({
      targets: this,
      alpha: 0.2,
      duration: 60,
      yoyo: true,
      repeat: 2
    });
  }

  private updateDiving(time: number): void {
    if (!this.player || !this.player.active || !this.bullets) return;
    if (time - this.lastFireTime >= this.fireRate) {
      this.shootAtPlayer();
      this.lastFireTime = time;
    }
  }

  private shootAtPlayer(): void {
    if (!this.bullets || !this.player) return;

    const bullet = this.bullets.get(this.x, this.y + 10) as EnemyBullet;
    if (!bullet) return;

    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    bullet.fireDirectional(
      this.x, this.y + 10,
      (dx / length) * this.bulletSpeed,
      (dy / length) * this.bulletSpeed,
      this.bulletDamage
    );
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;

    if (this.health <= 0) {
      this.die();
      return true;
    }

    flashTint(this, 0xffffff, 80);

    return false;
  }

  private die(): void {
    this.createExplosion();
    this.setActive(false);
    this.setVisible(false);
  }

  private createExplosion(): void {
    emitBurst(this.scene, this.x, this.y, 'explosion_particle', {
      speed: { min: 80, max: 200 },
      scale: { start: 1.5, end: 0 },
      lifespan: 400,
      quantity: 15,
      blendMode: 'ADD'
    });
  }
}
