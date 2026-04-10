import Phaser from 'phaser';
import { COLORS, ASTEROID_CONFIG, BOSS_CONFIG } from '../utils/Constants';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // Create loading text
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
      fontSize: '32px',
      color: '#ffffff'
    });
    loadingText.setOrigin(0.5);

    // Create progress bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 + 50, 320, 50);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 + 60, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Load sprite images
    this.load.image('player', 'player.png');
    this.load.image('enemy_basic', 'enemy_basic.png');
    this.load.image('bullet', 'bullet.png');
    this.load.image('explosion_particle', 'explosion_particle.png');
  }

  create(): void {
    // Create star for background (still using placeholder graphic)
    const starGraphics = this.add.graphics();
    starGraphics.fillStyle(COLORS.STAR);
    starGraphics.fillCircle(0, 0, 1);
    starGraphics.generateTexture('star', 2, 2);
    starGraphics.destroy();

    // Create enemy bullet texture
    this.createEnemyBulletTexture();

    // Create asteroid textures for all sizes
    this.createAsteroidTexture('small', ASTEROID_CONFIG.SMALL.RADIUS);
    this.createAsteroidTexture('medium', ASTEROID_CONFIG.MEDIUM.RADIUS);
    this.createAsteroidTexture('large', ASTEROID_CONFIG.LARGE.RADIUS);

    // Create asteroid particle
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(COLORS.ASTEROID);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('asteroid_particle', 8, 8);
    particleGraphics.destroy();

    // Create shield power-up texture
    this.createShieldPowerUpTexture();

    // Create boss textures
    this.createBossTexture();
    this.createBossBulletTexture();

    this.scene.start('MainMenuScene');
  }

  private createAsteroidTexture(size: string, radius: number): void {
    const graphics = this.add.graphics();
    const diameter = radius * 2;
    const centerX = radius;
    const centerY = radius;

    // Draw irregular asteroid shape
    graphics.fillStyle(COLORS.ASTEROID);
    graphics.beginPath();

    const points = 8;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const variance = Phaser.Math.FloatBetween(0.7, 1.0);
      const px = centerX + Math.cos(angle) * radius * variance;
      const py = centerY + Math.sin(angle) * radius * variance;

      if (i === 0) {
        graphics.moveTo(px, py);
      } else {
        graphics.lineTo(px, py);
      }
    }

    graphics.closePath();
    graphics.fillPath();

    // Add some crater details
    graphics.fillStyle(0x5a4a3a);
    const craterCount = Math.floor(radius / 10);
    for (let i = 0; i < craterCount; i++) {
      const craterX = centerX + Phaser.Math.Between(-radius * 0.5, radius * 0.5);
      const craterY = centerY + Phaser.Math.Between(-radius * 0.5, radius * 0.5);
      const craterRadius = Phaser.Math.Between(2, Math.max(3, radius * 0.15));
      graphics.fillCircle(craterX, craterY, craterRadius);
    }

    graphics.generateTexture(`asteroid_${size}`, diameter, diameter);
    graphics.destroy();
  }

  private createEnemyBulletTexture(): void {
    const graphics = this.add.graphics();
    const width = 6;
    const height = 12;

    // Draw enemy bullet - red elongated shape
    graphics.fillStyle(COLORS.ENEMY_BULLET);
    graphics.fillRoundedRect(0, 0, width, height, 2);

    // Add brighter center for glow effect
    graphics.fillStyle(0xff8888);
    graphics.fillRoundedRect(1, 2, width - 2, height - 4, 1);

    graphics.generateTexture('enemy_bullet', width, height);
    graphics.destroy();
  }

  private createShieldPowerUpTexture(): void {
    const graphics = this.add.graphics();
    const size = 24;
    const center = size / 2;

    // Draw shield icon - a plus/cross inside a circle
    graphics.fillStyle(COLORS.SHIELD_POWERUP);
    graphics.fillCircle(center, center, 10);

    // Add inner cross (health symbol)
    graphics.fillStyle(0xffffff);
    graphics.fillRect(center - 2, center - 6, 4, 12); // vertical bar
    graphics.fillRect(center - 6, center - 2, 12, 4); // horizontal bar

    graphics.generateTexture('shield_powerup', size, size);
    graphics.destroy();

    // Create shield particle for collection effect
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(COLORS.SHIELD_POWERUP);
    particleGraphics.fillCircle(3, 3, 3);
    particleGraphics.generateTexture('shield_particle', 6, 6);
    particleGraphics.destroy();
  }

  private createBossTexture(): void {
    const graphics = this.add.graphics();
    const width = BOSS_CONFIG.WIDTH;
    const height = BOSS_CONFIG.HEIGHT;
    const centerX = width / 2;
    const centerY = height / 2;

    // Main body - dark purple hull
    graphics.fillStyle(COLORS.BOSS);
    graphics.beginPath();
    // Draw a menacing ship shape
    graphics.moveTo(centerX, 5); // Top center point
    graphics.lineTo(width - 10, centerY - 10); // Top right
    graphics.lineTo(width - 5, centerY + 15); // Right wing
    graphics.lineTo(width - 30, height - 10); // Right bottom
    graphics.lineTo(centerX, height - 5); // Bottom center
    graphics.lineTo(30, height - 10); // Left bottom
    graphics.lineTo(5, centerY + 15); // Left wing
    graphics.lineTo(10, centerY - 10); // Top left
    graphics.closePath();
    graphics.fillPath();

    // Add darker armor plating
    graphics.fillStyle(0x660066);
    graphics.fillRect(centerX - 60, centerY - 15, 120, 35);
    graphics.fillRect(centerX - 40, centerY - 25, 80, 15);

    // Cockpit/bridge area
    graphics.fillStyle(0x330033);
    graphics.fillRoundedRect(centerX - 25, centerY - 20, 50, 30, 5);

    // Add glowing elements
    graphics.fillStyle(0xff00ff);
    graphics.fillCircle(centerX, centerY - 5, 8);

    // Gun turrets (5 guns spread across)
    const gunCount = BOSS_CONFIG.SHOOTING.GUN_COUNT;
    const gunSpacing = width / (gunCount + 1);
    graphics.fillStyle(0xcc00cc);
    for (let i = 1; i <= gunCount; i++) {
      const gunX = gunSpacing * i;
      graphics.fillRect(gunX - 6, height - 20, 12, 20);
      graphics.fillStyle(0xff00ff);
      graphics.fillCircle(gunX, height - 5, 4);
      graphics.fillStyle(0xcc00cc);
    }

    // Add some engine glow at top
    graphics.fillStyle(0xff66ff);
    graphics.fillCircle(centerX - 40, 15, 6);
    graphics.fillCircle(centerX + 40, 15, 6);
    graphics.fillCircle(centerX, 10, 8);

    // Wing details
    graphics.lineStyle(2, 0xaa00aa);
    graphics.lineBetween(15, centerY, 40, height - 15);
    graphics.lineBetween(width - 15, centerY, width - 40, height - 15);

    graphics.generateTexture('boss', width, height);
    graphics.destroy();
  }

  private createBossBulletTexture(): void {
    const graphics = this.add.graphics();
    const width = 10;
    const height = 16;

    // Draw boss bullet - larger purple/magenta projectile
    graphics.fillStyle(COLORS.BOSS_BULLET);
    graphics.fillRoundedRect(0, 0, width, height, 3);

    // Add bright center glow
    graphics.fillStyle(0xffaaff);
    graphics.fillRoundedRect(2, 2, width - 4, height - 4, 2);

    // Inner core
    graphics.fillStyle(0xffffff);
    graphics.fillRect(3, 4, width - 6, height - 8);

    graphics.generateTexture('boss_bullet', width, height);
    graphics.destroy();
  }
}
