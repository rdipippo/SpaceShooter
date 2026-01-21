import Phaser from 'phaser';
import { ScoreManager } from '../systems/ScoreManager';
import { UI_CONFIG } from '../utils/Constants';

export class MainMenuScene extends Phaser.Scene {
  private scoreManager!: ScoreManager;
  private stars: Phaser.GameObjects.TileSprite | null = null;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    this.scoreManager = new ScoreManager();

    // Create scrolling starfield background
    this.createStarfield();

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Title text
    const title = this.add.text(width / 2, height / 3, 'SPACE SHOOTER', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.TITLE_FONT_SIZE,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    });
    title.setOrigin(0.5);

    // High score display
    const highScoreText = this.add.text(
      width / 2,
      height / 2,
      `High Score: ${this.scoreManager.getHighScore()}`,
      {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '32px',
        color: '#ffff00'
      }
    );
    highScoreText.setOrigin(0.5);

    // Start button
    const startButton = this.add.text(width / 2, height * 2 / 3, 'TAP TO START', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.MENU_FONT_SIZE,
      color: '#00ff00'
    });
    startButton.setOrigin(0.5);
    startButton.setInteractive({ useHandCursor: true });

    // Blinking effect
    this.tweens.add({
      targets: startButton,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Test mode button
    const testModeButton = this.add.text(width / 2, height * 2 / 3 + 50, 'TEST MODE', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '20px',
      color: '#ff9900'
    });
    testModeButton.setOrigin(0.5);
    testModeButton.setInteractive({ useHandCursor: true });

    testModeButton.on('pointerover', () => {
      testModeButton.setColor('#ffcc00');
    });

    testModeButton.on('pointerout', () => {
      testModeButton.setColor('#ff9900');
    });

    testModeButton.on('pointerdown', () => {
      this.scene.start('GameScene', { testMode: true });
    });

    // Controls text
    const controlsText = this.add.text(
      width / 2,
      height - 60,
      'WASD/Arrows: Move | Space: Shoot',
      {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '18px',
        color: '#aaaaaa'
      }
    );
    controlsText.setOrigin(0.5);

    // Click/tap to start
    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Also allow spacebar to start
    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.start('GameScene');
      });
    }
  }

  update(): void {
    // Scroll the starfield
    if (this.stars) {
      this.stars.tilePositionY -= 1;
    }
  }

  private createStarfield(): void {
    // Create a simple starfield using tile sprite
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create a graphics object to generate star texture
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff);

    // Draw random stars
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 2);
      graphics.fillCircle(x, y, size);
    }

    graphics.generateTexture('starfield', width, height);
    graphics.destroy();

    // Create tile sprite for scrolling effect
    this.stars = this.add.tileSprite(0, 0, width, height, 'starfield');
    this.stars.setOrigin(0, 0);
    this.stars.setDepth(-1);
  }
}
