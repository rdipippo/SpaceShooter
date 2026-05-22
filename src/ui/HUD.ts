import Phaser from 'phaser';
import { PLAYER_CONFIG, UI_CONFIG } from '../utils/Constants';
import { ShieldUpgradeManager } from '../systems/ShieldUpgradeManager';
import { ScoreManager } from '../systems/ScoreManager';

export class HUD {
  private scene: Phaser.Scene;
  private scoreText!: Phaser.GameObjects.Text;
  private healthLabel!: Phaser.GameObjects.Text;
  private healthBar!: Phaser.GameObjects.Graphics;
  private currentHealth: number = PLAYER_CONFIG.MAX_HEALTH;
  private static readonly HEALTH_BAR_X = 100;
  private static readonly HEALTH_BAR_Y = 56;
  private static readonly HEALTH_BAR_WIDTH = 160;
  private static readonly HEALTH_BAR_HEIGHT = 16;
  private pauseGameText!: Phaser.GameObjects.Text;
  private resetGameText!: Phaser.GameObjects.Text;
  private victoryText!: Phaser.GameObjects.Text;
  private killPctText!: Phaser.GameObjects.Text;
  private originalScoreText!: Phaser.GameObjects.Text;
  private modifiedScoreText!: Phaser.GameObjects.Text;
  private shopHeaderText!: Phaser.GameObjects.Text;
  private shopUpgradeInfoText!: Phaser.GameObjects.Text;
  private shopBuyButton!: Phaser.GameObjects.Text;
  private shopContinueButton!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createUI();
  }

  public setPaused(paused: boolean): void {
    this.pauseGameText.setVisible(paused);
    this.resetGameText.setVisible(paused);
  }

  public victory(killPct: number, originalScore: number, modifiedScore: number): void {
    this.victoryText.setVisible(true);
    this.victoryText.setDepth(200);
    const targetY = Math.floor(this.scene.cameras.main.height * 0.12);

    this.scene.tweens.add({
      targets: this.victoryText,
      y: targetY,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        this.killPctText.setText(`${killPct}% of enemies destroyed`);
        this.killPctText.setVisible(true);

        this.originalScoreText.setText(`Score: $${originalScore}`);
        this.originalScoreText.setVisible(true);

        this.modifiedScoreText.setText(`Bonus Score: $${modifiedScore}`);
        this.modifiedScoreText.setVisible(true);
      }
    });
  }

  public fadeToBlackKeepVictory(durationMs: number = 1500, onComplete?: () => void): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    this.victoryText.setDepth(200);

    const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000);
    overlay.setScrollFactor(0);
    overlay.setDepth(150);
    overlay.setAlpha(0);

    this.scene.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: durationMs,
      ease: 'Power2',
      onComplete: onComplete ? () => onComplete() : undefined
    });
  }

  public showVictoryShop(
    upgradeManager: ShieldUpgradeManager,
    scoreManager: ScoreManager,
    onContinue: () => void
  ): void {
    const updateShopUI = () => {
      const count = upgradeManager.getUpgradeCount();
      const pct = Math.round(count * 10);
      const price = upgradeManager.getNextPrice();
      const balance = scoreManager.getCurrentScore();
      const canAfford = balance >= price;

      this.shopUpgradeInfoText.setText(
        count === 0
          ? 'No upgrades active'
          : `${count} upgrade${count > 1 ? 's' : ''} active — ${pct}% damage reduction`
      );

      this.shopBuyButton.setText(`Buy Shield Upgrade — $${price}`);
      this.shopBuyButton.setColor(canAfford ? '#00ff88' : '#555555');
      this.shopBuyButton.setInteractive(canAfford ? { useHandCursor: true } : {});
    };

    updateShopUI();

    [this.shopHeaderText, this.shopUpgradeInfoText, this.shopBuyButton, this.shopContinueButton].forEach(el => {
      el.setAlpha(0);
      el.setVisible(true);
      this.scene.tweens.add({ targets: el, alpha: 1, duration: 400, ease: 'Power1' });
    });

    this.shopBuyButton.on('pointerdown', () => {
      const price = upgradeManager.getNextPrice();
      if (scoreManager.spendScore(price)) {
        void upgradeManager.purchaseUpgrade();
        this.updateScore(scoreManager.getCurrentScore());
        updateShopUI();
      }
    });

    this.shopContinueButton.on('pointerdown', onContinue);
  }

  private createUI(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Score text (top-left)
    this.scoreText = this.scene.add.text(16, 16, '$0', {
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

    const statsFontSize = Math.min(28, Math.floor(width / 18));
    this.killPctText = this.scene.add.text(width / 2, height * 0.38, '', {
      fontFamily: UI_CONFIG.FONT_FAMILY, fontSize: `${statsFontSize}px`, color: '#ffff00'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setVisible(false);

    this.originalScoreText = this.scene.add.text(width / 2, height * 0.52, '', {
      fontFamily: UI_CONFIG.FONT_FAMILY, fontSize: `${statsFontSize}px`, color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setVisible(false);

    this.modifiedScoreText = this.scene.add.text(width / 2, height * 0.62, '', {
      fontFamily: UI_CONFIG.FONT_FAMILY, fontSize: `${statsFontSize}px`, color: '#00ff88'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setVisible(false);

    const shopFontSize = Math.min(22, Math.floor(width / 20));
    this.shopHeaderText = this.scene.add.text(width / 2, height * 0.70, 'SHIELD UPGRADES', {
      fontFamily: UI_CONFIG.FONT_FAMILY, fontSize: `${shopFontSize + 4}px`, color: '#00ffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setVisible(false);

    this.shopUpgradeInfoText = this.scene.add.text(width / 2, height * 0.78, '', {
      fontFamily: UI_CONFIG.FONT_FAMILY, fontSize: `${shopFontSize}px`, color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setVisible(false);

    this.shopBuyButton = this.scene.add.text(width / 2, height * 0.86, '', {
      fontFamily: UI_CONFIG.FONT_FAMILY, fontSize: `${shopFontSize}px`, color: '#00ff88'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setVisible(false);

    this.shopContinueButton = this.scene.add.text(width / 2, height * 0.93, 'CONTINUE →', {
      fontFamily: UI_CONFIG.FONT_FAMILY, fontSize: `${shopFontSize}px`, color: '#ffff00'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setVisible(false)
      .setInteractive({ useHandCursor: true });
  }

  updateScore(score: number): void {
    this.scoreText.setText(`\$${score}`);
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

  destroy(): void {
    this.scoreText.destroy();
    this.healthLabel.destroy();
    this.healthBar.destroy();
    this.pauseGameText.destroy();
    this.resetGameText.destroy();
    this.killPctText.destroy();
    this.originalScoreText.destroy();
    this.modifiedScoreText.destroy();
    this.shopHeaderText.destroy();
    this.shopUpgradeInfoText.destroy();
    this.shopBuyButton.destroy();
    this.shopContinueButton.destroy();
  }
}
