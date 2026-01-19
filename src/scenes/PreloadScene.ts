import Phaser from 'phaser';
import { COLORS, ASTEROID_CONFIG } from '../utils/Constants';

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
}
