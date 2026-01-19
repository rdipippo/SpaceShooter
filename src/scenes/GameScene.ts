import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { EnemySpawner } from '../systems/EnemySpawner';
import { AsteroidSpawner } from '../systems/AsteroidSpawner';
import { ShieldPowerUpSpawner } from '../systems/ShieldPowerUpSpawner';
import { CollisionManager } from '../systems/CollisionManager';
import { ScoreManager } from '../systems/ScoreManager';
import { HUD } from '../ui/HUD';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemySpawner!: EnemySpawner;
  private asteroidSpawner!: AsteroidSpawner;
  private shieldPowerUpSpawner!: ShieldPowerUpSpawner;
  private scoreManager!: ScoreManager;
  private collisionManager!: CollisionManager;
  private hud!: HUD;
  private gameOver: boolean = false;
  private stars: Phaser.GameObjects.TileSprite | null = null;
  private paused: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.gameOver = false;
    this.paused = false;

    // Remove any existing event listeners to prevent duplicates on restart
    this.events.off('enemyDestroyed', this.handleEnemyDestroyed, this);
    this.events.off('asteroidDestroyed', this.handleAsteroidDestroyed, this);
    this.events.off('playerDied', this.handlePlayerDied, this);

    // Set up Enter key for pause/resume
    if (this.input.keyboard) {
      const enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      enterKey.on('down', () => {
        this.paused = !this.paused;
        if (this.paused) {
          // Pause physics and timers but keep scene active for input
          this.physics.pause();
          this.time.paused = true;
          this.hud.setPaused(true)
        } else {
          this.physics.resume();
          this.time.paused = false;
          this.hud.setPaused(false);
        }
      });
    }

    // Create scrolling starfield background
    this.createStarfield();

    // Initialize score manager
    this.scoreManager = new ScoreManager();

    // Create player
    this.player = new Player(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height - 100
    );

    // Create enemy spawner
    this.enemySpawner = new EnemySpawner(this);

    // Create asteroid spawner
    this.asteroidSpawner = new AsteroidSpawner(this);

    // Create shield power-up spawner
    this.shieldPowerUpSpawner = new ShieldPowerUpSpawner(this);

    // Set up collision manager
    this.collisionManager = new CollisionManager(this, this.player, this.enemySpawner, this.asteroidSpawner, this.shieldPowerUpSpawner);

    // Create HUD
    this.hud = new HUD(this);
    this.hud.updateHighScore(this.scoreManager.getHighScore());
    this.hud.updateScore(0);
    this.hud.updateHealth(this.player.getHealth());

    // Set up event listeners
    this.events.on('enemyDestroyed', this.handleEnemyDestroyed, this);
    this.events.on('asteroidDestroyed', this.handleAsteroidDestroyed, this);
    this.events.on('playerDied', this.handlePlayerDied, this);
  }

  update(time: number): void {
    if (this.gameOver || this.paused) return;

    // Scroll the starfield
    if (this.stars) {
      this.stars.tilePositionY -= 2;
    }

    // Update player
    if (this.player.active) {
      this.player.update(time);
      this.hud.updateHealth(this.player.getHealth());
    }
  }

  private handleEnemyDestroyed(scoreValue: number): void {
    this.addScoreAndCheckDifficulty(scoreValue);
  }

  private handleAsteroidDestroyed(scoreValue: number): void {
    this.addScoreAndCheckDifficulty(scoreValue);
  }

  private addScoreAndCheckDifficulty(scoreValue: number): void {
    this.scoreManager.addScore(scoreValue);
    this.hud.updateScore(this.scoreManager.getCurrentScore());
    this.hud.updateHighScore(this.scoreManager.getHighScore());

    // Increase difficulty every 100 points
    if (this.scoreManager.getCurrentScore() % 100 === 0) {
      this.enemySpawner.increaseDifficulty();
      this.asteroidSpawner.increaseDifficulty();
      // Keep power-up spawn rate at 10% of enemy rate
      this.shieldPowerUpSpawner.updateSpawnRate(this.enemySpawner.getSpawnDelay());
    }
  }

  private handlePlayerDied(): void {
    if (this.gameOver) return;

    this.gameOver = true;
    this.enemySpawner.stopSpawning();
    this.asteroidSpawner.stopSpawning();
    this.shieldPowerUpSpawner.stopSpawning();

    // Transition to game over scene after a brief delay
    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene', {
        score: this.scoreManager.getCurrentScore(),
        highScore: this.scoreManager.getHighScore()
      });
    });
  }

  private createStarfield(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create a graphics object to generate star texture
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff);

    // Draw random stars
    for (let i = 0; i < 150; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 2);
      const alpha = Phaser.Math.FloatBetween(0.3, 1);
      graphics.fillStyle(0xffffff, alpha);
      graphics.fillCircle(x, y, size);
    }

    graphics.generateTexture('game_starfield', width, height);
    graphics.destroy();

    // Create tile sprite for scrolling effect
    this.stars = this.add.tileSprite(0, 0, width, height, 'game_starfield');
    this.stars.setOrigin(0, 0);
    this.stars.setDepth(-1);
  }

  shutdown(): void {
    // Clean up event listeners
    this.events.off('enemyDestroyed', this.handleEnemyDestroyed, this);
    this.events.off('asteroidDestroyed', this.handleAsteroidDestroyed, this);
    this.events.off('playerDied', this.handlePlayerDied, this);
  }
}
