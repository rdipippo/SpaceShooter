import Phaser from 'phaser';
import { PLAYER_CONFIG } from '../utils/Constants';
import { Bullet } from './Bullet';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private health: number;
  private speed: number;
  private fireRate: number;
  private lastFired: number;
  private bullets!: Phaser.Physics.Arcade.Group;
  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
  };
  private isInvulnerable: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    this.health = PLAYER_CONFIG.MAX_HEALTH;
    this.speed = PLAYER_CONFIG.SPEED;
    this.fireRate = PLAYER_CONFIG.FIRE_RATE;
    this.lastFired = 0;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics body
    this.setCollideWorldBounds(true);

    // Set up input
    this.setupInput();

    // Create bullet group
    this.createBulletGroup();
  }

  private setupInput(): void {
    if (this.scene.input.keyboard) {
      this.keys = {
        up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
        space: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        w: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        a: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        s: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        d: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
      };
    }
  }

  private createBulletGroup(): void {
    this.bullets = this.scene.physics.add.group({
      classType: Bullet,
      maxSize: 30,
      runChildUpdate: true
    });
  }

  update(time: number): void {
    this.handleMovement();
    this.handleShooting(time);
  }

  private handleMovement(): void {
    // Reset velocity
    this.setVelocity(0);

    // Horizontal movement
    if (this.keys.left.isDown || this.keys.a.isDown) {
      this.setVelocityX(-this.speed);
    } else if (this.keys.right.isDown || this.keys.d.isDown) {
      this.setVelocityX(this.speed);
    }

    // Vertical movement
    if (this.keys.up.isDown || this.keys.w.isDown) {
      this.setVelocityY(-this.speed);
    } else if (this.keys.down.isDown || this.keys.s.isDown) {
      this.setVelocityY(this.speed);
    }
  }

  private handleShooting(time: number): void {
    if (this.keys.space.isDown && time > this.lastFired + this.fireRate) {
      this.shoot();
      this.lastFired = time;
    }
  }

  private shoot(): void {
    const bullet = this.bullets.get(this.x, this.y - 20) as Bullet;
    if (bullet) {
      bullet.fire(this.x, this.y - 20);
    }
  }

  takeDamage(amount: number): void {
    if (this.isInvulnerable) return;

    this.health -= amount;

    // Flash effect
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 3
    });

    // Brief invulnerability
    this.isInvulnerable = true;
    this.scene.time.delayedCall(1000, () => {
      this.isInvulnerable = false;
    });

    if (this.health <= 0) {
      this.die();
    }
  }

  private die(): void {
    // Emit death event to game scene
    this.scene.events.emit('playerDied');
    this.setActive(false);
    this.setVisible(false);
  }

  getHealth(): number {
    return this.health;
  }

  getBullets(): Phaser.Physics.Arcade.Group {
    return this.bullets;
  }
}
