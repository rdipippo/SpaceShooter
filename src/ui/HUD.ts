import Phaser from 'phaser';
import { UI_CONFIG } from '../utils/Constants';

export class HUD {
  private scene: Phaser.Scene;
  private scoreText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private pauseGameText!: Phaser.GameObjects.Text;
  private resetGameText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createUI();
  }

  public setPaused(paused: boolean): void {
    this.pauseGameText.setVisible(paused);
    this.resetGameText.setVisible(paused);
  }

  private createUI(): void {
    // Score text (top-left)
    this.scoreText = this.scene.add.text(16, 16, 'Score: 0', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.SCORE_FONT_SIZE,
      color: '#ffffff'
    });
    this.pauseGameText = this.scene.add.text(
      200, 250, 'Game Paused',
      { fontFamily: 'Arial', fontSize: 64, color: '#00ff00' }
    ).setVisible(false);

    // Reset game link (shown when paused)
    this.resetGameText = this.scene.add.text(
      330, 360, 'Reset Game',
      { fontFamily: 'Arial', fontSize: 32, color: '#ffffff' }
    ).setVisible(false)
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
