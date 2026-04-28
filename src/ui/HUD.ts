import Phaser from 'phaser';
import { PLAYER_CONFIG, UI_CONFIG } from '../utils/Constants';

export class HUD {
  private scene: Phaser.Scene;
  private scoreText!: Phaser.GameObjects.Text;
  private healthLabel!: Phaser.GameObjects.Text;
  private healthBar!: Phaser.GameObjects.Graphics;
  private highScoreText!: Phaser.GameObjects.Text;
  private currentHealth: number = PLAYER_CONFIG.MAX_HEALTH;
  private static readonly HEALTH_BAR_X = 100;
  private static readonly HEALTH_BAR_Y = 56;
  private static readonly HEALTH_BAR_WIDTH = 160;
  private static readonly HEALTH_BAR_HEIGHT = 16;
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

    // Health label and neon green health bar (below score)
    this.healthLabel = this.scene.add.text(16, 50, 'Health:', {
      fontFamily: UI_CONFIG.FONT_FAMILY,
      fontSize: UI_CONFIG.SCORE_FONT_SIZE,
      color: '#ffffff'
    });
    this.healthLabel.setScrollFactor(0);
    this.healthLabel.setDepth(100);

    this.healthBar = this.scene.add.graphics();
    this.healthBar.setScrollFactor(0);
    this.healthBar.setDepth(100);
    this.drawHealthBar();

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
    this.currentHealth = Math.max(0, health);
    this.drawHealthBar();
  }

  private drawHealthBar(): void {
    const x = HUD.HEALTH_BAR_X;
    const y = HUD.HEALTH_BAR_Y;
    const w = HUD.HEALTH_BAR_WIDTH;
    const h = HUD.HEALTH_BAR_HEIGHT;
    const pct = Phaser.Math.Clamp(this.currentHealth / PLAYER_CONFIG.MAX_HEALTH, 0, 1);

    this.healthBar.clear();

    this.healthBar.fillStyle(0x000000, 0.6);
    this.healthBar.fillRect(x, y, w, h);

    if (pct > 0) {
      this.healthBar.fillStyle(0x39ff14, 0.35);
      this.healthBar.fillRect(x - 2, y - 2, w * pct + 4, h + 4);
      this.healthBar.fillStyle(0x39ff14, 1);
      this.healthBar.fillRect(x, y, w * pct, h);
    }

    this.healthBar.lineStyle(2, 0x39ff14, 1);
    this.healthBar.strokeRect(x, y, w, h);
  }

  updateHighScore(highScore: number): void {
    this.highScoreText.setText(`High: ${highScore}`);
  }

  destroy(): void {
    this.scoreText.destroy();
    this.healthLabel.destroy();
    this.healthBar.destroy();
    this.highScoreText.destroy();
    this.pauseGameText.destroy();
    this.resetGameText.destroy();
  }
}
