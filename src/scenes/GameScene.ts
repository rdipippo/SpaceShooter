import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { EnemySpawner } from '../systems/EnemySpawner';
import { AsteroidSpawner } from '../systems/AsteroidSpawner';
import { ShieldPowerUpSpawner } from '../systems/ShieldPowerUpSpawner';
import { BossSpawner } from '../systems/BossSpawner';
import { CollisionManager } from '../systems/CollisionManager';
import { ScoreManager } from '../systems/ScoreManager';
import { HUD } from '../ui/HUD';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemySpawner!: EnemySpawner;
  private asteroidSpawner!: AsteroidSpawner;
  private shieldPowerUpSpawner!: ShieldPowerUpSpawner;
  private bossSpawner!: BossSpawner;
  private scoreManager!: ScoreManager;
  private collisionManager!: CollisionManager;
  private hud!: HUD;
  private gameOver: boolean = false;
  private stars: Phaser.GameObjects.TileSprite | null = null;
  private paused: boolean = false;
  private testMode: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { testMode?: boolean }): void {
    this.testMode = data.testMode || false;
  }

  create(): void {
    this.gameOver = false;
    this.paused = false;

    // Remove any existing event listeners to prevent duplicates on restart
    this.events.off('enemyDestroyed', this.handleEnemyDestroyed, this);
    this.events.off('asteroidDestroyed', this.handleAsteroidDestroyed, this);
    this.events.off('bossDestroyed', this.handleBossDestroyed, this);
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

    // Create enemy spawner and set player reference for enemy shooting
    this.enemySpawner = new EnemySpawner(this);
    this.enemySpawner.setPlayer(this.player);

    // Create asteroid spawner
    this.asteroidSpawner = new AsteroidSpawner(this);

    // Create shield power-up spawner
    this.shieldPowerUpSpawner = new ShieldPowerUpSpawner(this);

    // Create boss spawner (spawns after 3 minutes)
    this.bossSpawner = new BossSpawner(this);
    this.bossSpawner.setPlayer(this.player);

    // Set up collision manager
    this.collisionManager = new CollisionManager(this, this.player, this.enemySpawner, this.asteroidSpawner, this.shieldPowerUpSpawner, this.bossSpawner);

    // Create HUD
    this.hud = new HUD(this);
    this.hud.updateHighScore(this.scoreManager.getHighScore());
    this.hud.updateScore(0);
    this.hud.updateHealth(this.player.getHealth());

    // Set up event listeners
    this.events.on('enemyDestroyed', this.handleEnemyDestroyed, this);
    this.events.on('asteroidDestroyed', this.handleAsteroidDestroyed, this);
    this.events.on('bossDestroyed', this.handleBossDestroyed, this);
    this.events.on('playerDied', this.handlePlayerDied, this);

    // Test mode setup
    if (this.testMode) {
      this.enemySpawner.stopSpawning();
      this.asteroidSpawner.stopSpawning();
      this.shieldPowerUpSpawner.stopSpawning();
      this.bossSpawner.stopSpawning();
      this.createTestModeUI();
    }
  }

  private createTestModeUI(): void {
    const buttonStyle = {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 8 }
    };

    const buttonX = 70;
    let buttonY = 120;
    const buttonSpacing = 50;

    // Test mode label
    const label = this.add.text(10, 80, 'TEST MODE', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ff9900'
    });
    label.setDepth(100);

    // Asteroid button
    const asteroidBtn = this.add.text(buttonX, buttonY, 'Asteroid', buttonStyle);
    asteroidBtn.setOrigin(0.5);
    asteroidBtn.setInteractive({ useHandCursor: true });
    asteroidBtn.setDepth(100);
    asteroidBtn.on('pointerover', () => asteroidBtn.setStyle({ backgroundColor: '#555555' }));
    asteroidBtn.on('pointerout', () => asteroidBtn.setStyle({ backgroundColor: '#333333' }));
    asteroidBtn.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.spawnTestAsteroid();
    });

    buttonY += buttonSpacing;

    // Enemy button
    const enemyBtn = this.add.text(buttonX, buttonY, 'Enemy', buttonStyle);
    enemyBtn.setOrigin(0.5);
    enemyBtn.setInteractive({ useHandCursor: true });
    enemyBtn.setDepth(100);
    enemyBtn.on('pointerover', () => enemyBtn.setStyle({ backgroundColor: '#555555' }));
    enemyBtn.on('pointerout', () => enemyBtn.setStyle({ backgroundColor: '#333333' }));
    enemyBtn.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.spawnTestEnemy();
    });

    buttonY += buttonSpacing;

    // Shield button
    const shieldBtn = this.add.text(buttonX, buttonY, 'Shield', buttonStyle);
    shieldBtn.setOrigin(0.5);
    shieldBtn.setInteractive({ useHandCursor: true });
    shieldBtn.setDepth(100);
    shieldBtn.on('pointerover', () => shieldBtn.setStyle({ backgroundColor: '#555555' }));
    shieldBtn.on('pointerout', () => shieldBtn.setStyle({ backgroundColor: '#333333' }));
    shieldBtn.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.spawnTestShield();
    });

    buttonY += buttonSpacing;

    // Boss button
    const bossBtn = this.add.text(buttonX, buttonY, 'Boss', buttonStyle);
    bossBtn.setOrigin(0.5);
    bossBtn.setInteractive({ useHandCursor: true });
    bossBtn.setDepth(100);
    bossBtn.on('pointerover', () => bossBtn.setStyle({ backgroundColor: '#555555' }));
    bossBtn.on('pointerout', () => bossBtn.setStyle({ backgroundColor: '#333333' }));
    bossBtn.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.spawnTestBoss();
    });

    buttonY += buttonSpacing;

    // Invincible button
    const invincibleBtn = this.add.text(buttonX, buttonY, 'Invincible', buttonStyle);
    invincibleBtn.setOrigin(0.5);
    invincibleBtn.setInteractive({ useHandCursor: true });
    invincibleBtn.setDepth(100);
    invincibleBtn.on('pointerover', () => invincibleBtn.setStyle({ backgroundColor: '#555555' }));
    invincibleBtn.on('pointerout', () => {
      if (this.player.getInvincible()) {
        invincibleBtn.setStyle({ backgroundColor: '#006600' });
      } else {
        invincibleBtn.setStyle({ backgroundColor: '#333333' });
      }
    });
    invincibleBtn.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      const newState = !this.player.getInvincible();
      this.player.setInvincible(newState);
      if (newState) {
        invincibleBtn.setStyle({ backgroundColor: '#006600' });
      } else {
        invincibleBtn.setStyle({ backgroundColor: '#333333' });
      }
    });
  }

  private spawnTestAsteroid(): void {
    this.asteroidSpawner.spawnSingle();
  }

  private spawnTestEnemy(): void {
    this.enemySpawner.spawnSingle();
  }

  private spawnTestShield(): void {
    this.shieldPowerUpSpawner.spawnSingle();
  }

  private spawnTestBoss(): void {
    this.bossSpawner.spawnSingle();
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

  private handleBossDestroyed(scoreValue: number): void {
    this.addScoreAndCheckDifficulty(scoreValue);
    this.physics.pause();
    this.time.paused = true;
    this.hud.victory();
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
    this.bossSpawner.stopSpawning();

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
    this.events.off('bossDestroyed', this.handleBossDestroyed, this);
    this.events.off('playerDied', this.handlePlayerDied, this);
  }
}
