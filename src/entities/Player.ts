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
  private touchTarget: Phaser.Math.Vector2 | null = null;
  private touchActive: boolean = false;
  private touchStartPosition: Phaser.Math.Vector2 | null = null;
  private touchStartTime: number = 0;
  private isDragging: boolean = false;

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
    
    // Set custom body size to match actual sprite (smaller than bounding box)
    // Assuming player sprite is roughly 32x32, use a smaller circular body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(12); // Adjust radius based on actual sprite size

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

    // Set up touch controls for mobile
    this.setupTouchControls();
  }

  private setupTouchControls(): void {
    // Make the entire scene interactive for touch
    this.scene.input.addPointer(3); // Support up to 3 touch points

    // Handle touch start
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Use world coordinates to match player's coordinate system
      this.touchStartPosition = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
      this.touchTarget = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
      this.touchActive = true;
      this.isDragging = false;
      this.touchStartTime = this.scene.time.now;
    });

    // Handle touch move - update target position for dragging
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && this.touchStartPosition) {
        // Use world coordinates for consistent movement
        const moveDistance = Phaser.Math.Distance.Between(
          this.touchStartPosition.x,
          this.touchStartPosition.y,
          pointer.worldX,
          pointer.worldY
        );

        // If moved more than 10 pixels, consider it a drag
        if (moveDistance > 10) {
          this.isDragging = true;
        }

        this.touchTarget = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
        this.touchActive = true;
      }
    });

    // Handle touch end - check if it was a tap (shoot) or drag (move)
    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.touchStartPosition && !this.isDragging) {
        // It was a tap - trigger shooting
        const currentTime = this.scene.time.now;
        const tapDuration = currentTime - this.touchStartTime;
        // Use world coordinates for consistent distance calculation
        const tapDistance = Phaser.Math.Distance.Between(
          this.touchStartPosition.x,
          this.touchStartPosition.y,
          pointer.worldX,
          pointer.worldY
        );

        // Consider it a tap if it was quick (< 200ms) and didn't move much (< 20px)
        if (tapDuration < 200 && tapDistance < 20) {
          // Trigger shoot if fire rate allows
          if (currentTime > this.lastFired + this.fireRate) {
            this.shoot();
            this.lastFired = currentTime;
          }
        }
      }

      // Immediately stop movement when touch ends
      this.touchActive = false;
      this.touchTarget = null;
      this.touchStartPosition = null;
      this.isDragging = false;
      this.setVelocity(0);
    });
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

    // Check for touch input first (mobile) - only move if dragging, not tapping
    if (this.touchActive && this.touchTarget && this.isDragging) {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.touchTarget.x,
        this.touchTarget.y
      );

      // Only move if touch is far enough from current position (dead zone)
      if (distance > 10) {
        const angle = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          this.touchTarget.x,
          this.touchTarget.y
        );

        // Move towards touch position
        this.setVelocity(
          Math.cos(angle) * this.speed,
          Math.sin(angle) * this.speed
        );
      }
      return; // Touch input takes priority
    }

    // Keyboard movement (desktop)
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
    // Check keyboard input (desktop)
    if (this.keys && this.keys.space.isDown && time > this.lastFired + this.fireRate) {
      this.shoot();
      this.lastFired = time;
    }
    
    // Check touch input for continuous shooting (hold without dragging)
    if (this.touchActive && this.touchStartPosition && !this.isDragging) {
      const holdDuration = time - this.touchStartTime;
      // After holding for 300ms, start continuous shooting
      if (holdDuration > 300 && time > this.lastFired + this.fireRate) {
        this.shoot();
        this.lastFired = time;
      }
    }
    // Quick tap shooting is handled in pointerup event
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

  heal(amount: number): void {
    this.health = Math.min(this.health + amount, PLAYER_CONFIG.MAX_HEALTH);
  }

  getBullets(): Phaser.Physics.Arcade.Group {
    return this.bullets;
  }
}

