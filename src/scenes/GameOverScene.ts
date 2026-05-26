import Phaser from 'phaser';
import { UI_CONFIG } from '../utils/Constants';
import { createMenuButton } from '../ui/MenuButton';

export class GameOverScene extends Phaser.Scene {
  private finalScore: number = 0;
  private highScore: number = 0;
  private gameWon: boolean = false;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score: number; highScore: number; gameWon?: boolean }): void {
    this.finalScore = data.score || 0;
    this.highScore = data.highScore || 0;
    this.gameWon = data.gameWon === true;
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Heading: "GAME OVER" by default, "YOU WIN" when the player has beaten the game
    const gameOverFontSize = Math.min(64, Math.floor(width / 8));
    const headingText = this.gameWon ? 'YOU WIN' : 'GAME OVER';
    const headingColor = this.gameWon ? '#00ff88' : '#ff0000';
    const gameOverText = this.add.text(width / 2, height / 4, headingText, {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: `${gameOverFontSize}px`,
      color: headingColor,
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
    const highScoreFontSize = Math.min(32, Math.floor(width / 12));
    const highScoreText = this.add.text(
      width / 2,
      height / 2 + 20,
      `High Score: ${this.highScore}${isNewHighScore ? ' - NEW!' : ''}`,
      {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: `${highScoreFontSize}px`,
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
    createMenuButton(
      this,
      width / 2,
      (height * 3) / 4,
      'TAP TO RESTART',
      () => this.scene.start('GameScene'),
      {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: UI_CONFIG.MENU_FONT_SIZE,
        color: '#00ff00',
        blink: true
      }
    );

    // Menu button
    createMenuButton(
      this,
      width / 2,
      (height * 3) / 4 + 60,
      'Main Menu',
      () => this.scene.start('MainMenuScene'),
      {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '24px',
        color: '#aaaaaa'
      }
    );

    // Also allow spacebar to restart
    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.start('GameScene');
      });
    }
  }
}
