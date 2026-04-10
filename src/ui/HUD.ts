import Phaser from 'phaser';
import { UI_CONFIG } from '../utils/Constants';

export class HUD {
  private scene: Phaser.Scene;
  private scoreText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private pauseGameText!: Phaser.GameObjects.Text;
  private resetGameText!: Phaser.GameObjects.Text;
  private victoryText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createUI();
  }

  public setPaused(paused: boolean): void {
    this.pauseGameText.setVisible(paused);
    this.resetGameText.setVisible(paused);
  }

  public victory(): void {
    this.victoryText.setVisible(true);
  }

  private createUI(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Score text (top-left)
    this.scoreText = this.scene.add.text(16, 16, 'Score: 0', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.SCORE_FONT_SIZE,
      color: '#ffffff'
    });

    const pauseFontSize = Math.min(64, Math.floor(width / 8));
    this.pauseGameText = this.scene.add.text(
      width / 2, height / 2 - 60, 'Game Paused',
      { fontFamily: 'Arial', fontSize: pauseFontSize, color: '#00ff00' }
    ).setOrigin(0.5).setVisible(false);
    this.pauseGameText.setScrollFactor(0);
    this.pauseGameText.setDepth(100);

    const resetFontSize = Math.min(32, Math.floor(width / 12));
    // Reset game link (shown when paused)
    this.resetGameText = this.scene.add.text(
      width / 2, height / 2 + 20, 'Reset Game',
      { fontFamily: 'Arial', fontSize: resetFontSize, color: '#ffffff' }
    ).setOrigin(0.5).setVisible(false)
     .setInteractive({ useHandCursor: true })
     .on('pointerdown', () => {
       // Unpause before restarting to ensure physics/timers work
       this.scene.physics.resume();
       this.scene.time.paused = false;
       this.scene.scene.restart();
     });
    this.resetGameText.setScrollFactor(0);
    this.resetGameText.setDepth(100);

    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(100);

    // Health text (below score)
    this.healthText = this.scene.add.text(16, 50, 'Shield: 🛡️🛡️🛡️', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.SCORE_FONT_SIZE,
      color: '#ffffff'
    });
    this.healthText.setScrollFactor(0);
    this.healthText.setDepth(100);

    // High score text (top-right)
    this.highScoreText = this.scene.add.text(
      this.scene.cameras.main.width - 16,
      16,
      'High: 0',
      {
        fontFamily: UI_CONFIG.FONT_FAMILY,
        fontSize: '20px',
        color: '#ffff00'
      }
    );
    this.highScoreText.setOrigin(1, 0);
    this.highScoreText.setScrollFactor(0);
    this.highScoreText.setDepth(100);

    const victoryFontSize = Math.min(64, Math.floor(width / 8));
    this.victoryText = this.scene.add.text(
      width / 2,
      height / 2,
      'VICTORY',
      { fontFamily: UI_CONFIG.FONT_FAMILY, fontSize: `${victoryFontSize}px`, color: '#ffffff' }
    ).setVisible(false);
    this.victoryText.setOrigin(0.5);
    this.victoryText.setScrollFactor(0);
    this.victoryText.setDepth(100);
  }

  updateScore(score: number): void {
    this.scoreText.setText(`Score: ${score}`);
  }

  updateHealth(health: number): void {
    const hearts = '🛡️'.repeat(Math.max(0, health));
    this.healthText.setText(`Shield: ${hearts}`);
  }

  updateHighScore(highScore: number): void {
    this.highScoreText.setText(`High: ${highScore}`);
  }

  destroy(): void {
    this.scoreText.destroy();
    this.healthText.destroy();
    this.highScoreText.destroy();
    this.pauseGameText.destroy();
    this.resetGameText.destroy();
  }
}
