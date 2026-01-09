import Phaser from 'phaser';
import { UI_CONFIG } from '../utils/Constants';

export class GameOverScene extends Phaser.Scene {
  private finalScore: number = 0;
  private highScore: number = 0;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score: number; highScore: number }): void {
    this.finalScore = data.score || 0;
    this.highScore = data.highScore || 0;
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Game Over text
    const gameOverText = this.add.text(width / 2, height / 4, 'GAME OVER', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.TITLE_FONT_SIZE,
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6
    });
    gameOverText.setOrigin(0.5);

    // Pulsing effect for game over text
    this.tweens.add({
      targets: gameOverText,
      scale: 1.1,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Final score
    const scoreText = this.add.text(
      width / 2,
      height / 2 - 40,
      `Score: ${this.finalScore}`,
      {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: UI_CONFIG.MENU_FONT_SIZE,
        color: '#ffffff'
      }
    );
    scoreText.setOrigin(0.5);

    // High score
    const isNewHighScore = this.finalScore === this.highScore && this.finalScore > 0;
    const highScoreText = this.add.text(
      width / 2,
      height / 2 + 20,
      `High Score: ${this.highScore}${isNewHighScore ? ' - NEW!' : ''}`,
      {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '32px',
        color: isNewHighScore ? '#ffff00' : '#ffffff'
      }
    );
    highScoreText.setOrigin(0.5);

    // New high score celebration
    if (isNewHighScore) {
      this.tweens.add({
        targets: highScoreText,
        scale: 1.2,
        duration: 300,
        yoyo: true,
        repeat: 3
      });
    }

    // Restart button
    const restartText = this.add.text(width / 2, height * 3 / 4, 'TAP TO RESTART', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.MENU_FONT_SIZE,
      color: '#00ff00'
    });
    restartText.setOrigin(0.5);
    restartText.setInteractive({ useHandCursor: true });

    // Blinking effect
    this.tweens.add({
      targets: restartText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Menu button
    const menuText = this.add.text(width / 2, height * 3 / 4 + 60, 'Main Menu', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: '24px',
      color: '#aaaaaa'
    });
    menuText.setOrigin(0.5);
    menuText.setInteractive({ useHandCursor: true });

    // Click/tap to restart
    restartText.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Click/tap to go to menu
    menuText.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });

    // Also allow spacebar to restart
    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.start('GameScene');
      });
    }
  }
}
