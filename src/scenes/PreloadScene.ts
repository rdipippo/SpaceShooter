import Phaser from 'phaser';
import { COLORS } from '../utils/Constants';

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

    this.scene.start('MainMenuScene');
  }
}
