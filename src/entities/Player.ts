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
  private touchActive: boolean = false;
  private touchStartPosition: Phaser.Math.Vector2 | null = null;
  private touchStartTime: number = 0;
  private isDragging: boolean = false;
  private shipStartPosition: Phaser.Math.Vector2 | null = null;
  private static readonly TOUCH_DRAG_MULTIPLIER = 1;

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
    // Using a circular body centered on the sprite
    const body = this.body as Phaser.Physics.Arcade.Body;
    const radius = 12;
    // Offset the circle to center it on the sprite (assuming ~32x32 sprite)
    body.setCircle(radius, this.width / 2 - radius, this.height / 2 - radius);

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
      this.touchStartPosition = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
      this.shipStartPosition = new Phaser.Math.Vector2(this.x, this.y);
      this.touchActive = true;
      this.isDragging = false;
      this.touchStartTime = this.scene.time.now;
    });

    // Handle touch move - ship follows finger with 2x multiplier
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && this.touchStartPosition && this.shipStartPosition) {
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

        if (this.isDragging) {
          // Calculate finger movement delta and apply multiplier
          const deltaX = (pointer.worldX - this.touchStartPosition.x) * Player.TOUCH_DRAG_MULTIPLIER;
          const deltaY = (pointer.worldY - this.touchStartPosition.y) * Player.TOUCH_DRAG_MULTIPLIER;

          const targetX = this.shipStartPosition.x + deltaX;
          const targetY = this.shipStartPosition.y + deltaY;

          // Clamp to world bounds
          const halfWidth = this.width / 2;
          const halfHeight = this.height / 2;
          const clampedX = Phaser.Math.Clamp(targetX, halfWidth, this.scene.cameras.main.width - halfWidth);
          const clampedY = Phaser.Math.Clamp(targetY, halfHeight, this.scene.cameras.main.height - halfHeight);

          this.setPosition(clampedX, clampedY);
        }
      }
    });

    // Handle touch end - check if it was a tap (shoot) or drag (move)
    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.touchStartPosition && !this.isDragging) {
        // It was a tap - trigger shooting
        const currentTime = this.scene.time.now;
        const tapDuration = currentTime - this.touchStartTime;
        const tapDistance = Phaser.Math.Distance.Between(
          this.touchStartPosition.x,
          this.touchStartPosition.y,
          pointer.worldX,
          pointer.worldY
        );

        // Consider it a tap if it was quick (< 200ms) and didn't move much (< 20px)
        if (tapDuration < 200 && tapDistance < 20) {
          if (currentTime > this.lastFired + this.fireRate) {
            this.shoot();
            this.lastFired = currentTime;
          }
        }
      }

      this.touchActive = false;
      this.touchStartPosition = null;
      this.shipStartPosition = null;
      this.isDragging = false;
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
    // Reset velocity for keyboard movement
    this.setVelocity(0);

    // Touch movement is handled directly in pointermove event
    // Skip keyboard handling if touch is active
    if (this.touchActive && this.isDragging) {
      return;
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

