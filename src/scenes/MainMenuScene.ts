import Phaser from 'phaser';
import { ScoreManager } from '../systems/ScoreManager';
import { UI_CONFIG } from '../utils/Constants';
import { Starfield } from '../ui/Starfield';
import { createMenuButton } from '../ui/MenuButton';

export class MainMenuScene extends Phaser.Scene {
  private scoreManager!: ScoreManager;
  private stars: Starfield | null = null;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    this.scoreManager = new ScoreManager();

    // Create scrolling starfield background
    this.stars = new Starfield(this, { starCount: 100, scrollSpeed: 1 });

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Title text — two lines on mobile so it always fits, one line on wider screens
    const titleText = width < 500 ? 'SPACE\nSHOOTER' : 'SPACE SHOOTER';
    const titleFontSize = Math.min(64, Math.floor(width / 8));
    const title = this.add.text(width / 2, height / 3, titleText, {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: `${titleFontSize}px`,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    });
    title.setOrigin(0.5);

    // High score display — initial value may be 0 while the async load runs
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

    // Refresh once Capacitor Preferences has loaded the persisted value
    this.scoreManager.ready.then(() => {
      if (highScoreText.active) {
        highScoreText.setText(`High Score: ${this.scoreManager.getHighScore()}`);
      }
    });

    // Start button
    createMenuButton(
      this,
      width / 2,
      (height * 2) / 3,
      'TAP TO START',
      () => this.scene.start('GameScene', { level: '1-1' }),
      {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: UI_CONFIG.MENU_FONT_SIZE,
        color: '#00ff00',
        blink: true
      }
    );

    // Test mode button
    createMenuButton(
      this,
      width / 2,
      (height * 2) / 3 + 50,
      'TEST MODE',
      () => this.scene.start('GameScene', { testMode: true }),
      {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '20px',
        color: '#ff9900',
        baseColor: '#ff9900',
        hoverColor: '#ffcc00'
      }
    );

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

    // Also allow spacebar to start
    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.start('GameScene', { level: '1-1' });
      });
    }
  }

  update(): void {
    this.stars?.update();
  }
}
