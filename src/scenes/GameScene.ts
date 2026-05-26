import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { EnemySpawner } from '../systems/EnemySpawner';
import { AsteroidSpawner } from '../systems/AsteroidSpawner';
import { ShieldPowerUpSpawner } from '../systems/ShieldPowerUpSpawner';
import { BossSpawner } from '../systems/BossSpawner';
import { StrikerSpawner } from '../systems/StrikerSpawner';
import { CollisionManager } from '../systems/CollisionManager';
import { ScoreManager } from '../systems/ScoreManager';
import { ShieldUpgradeManager } from '../systems/ShieldUpgradeManager';
import { HUD } from '../ui/HUD';
import { TestUI } from '@/ui/TestUI';
import { LevelConfig, LevelConfigData, getNextLevel, levelExists } from '@/utils/LevelConfig';
import { bindSceneEvents, unbindSceneEvents, SceneEventMap } from '@/utils/SceneEvents';
import { Starfield } from '@/ui/Starfield';

export class GameScene extends Phaser.Scene {
  public player!: Player;
  public enemySpawner!: EnemySpawner;
  public asteroidSpawner!: AsteroidSpawner;
  public shieldPowerUpSpawner!: ShieldPowerUpSpawner;
  public bossSpawner!: BossSpawner;
  public strikerSpawner?: StrikerSpawner;
  public levelConfig!: LevelConfig;

  private level: string = "1-1";
  private carryScore: number = 0;
  private scoreManager!: ScoreManager;
  private shieldUpgradeManager!: ShieldUpgradeManager;
  private collisionManager!: CollisionManager;
  private hud!: HUD;
  private gameOver: boolean = false;
  private totalEnemiesDestroyed: number = 0;
  private stars: Starfield | null = null;
  private paused: boolean = false;
  private testMode: boolean = false;
  private eventMap!: SceneEventMap;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { testMode?: boolean, level?: string, carryScore?: number }): void {
    this.testMode = data.testMode || false;
    this.level = data.level || "1-1";
    this.carryScore = data.carryScore && data.carryScore > 0 ? data.carryScore : 0;
  }

  preload(): void {
    // Load the level configuration JSON
    this.load.json('levelConfig', `config/levels/${this.level}.json`);
  }

  create(): void {
    // Initialize level config from loaded JSON
    const configData = this.cache.json.get('levelConfig') as LevelConfigData;
    this.levelConfig = new LevelConfig(this.level, configData);
    this.gameOver = false;
    this.paused = false;

    this.eventMap = {
      enemyDestroyed: this.handleEnemyDestroyed,
      asteroidDestroyed: this.handleAsteroidDestroyed,
      bossDestroyed: this.handleBossDestroyed,
      playerDied: this.handlePlayerDied,
    };
    unbindSceneEvents(this, this, this.eventMap);

    // Set up Enter key for pause/resume
    if (this.input.keyboard) {
      const enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      enterKey.on('down', () => {
        this.paused = !this.paused;
        if (this.paused) {
          this.physics.pause();
          this.time.paused = true;
          this.hud.setPaused(true)
          this.events.emit('gamePaused');
        } else {
          this.physics.resume();
          this.time.paused = false;
          this.hud.setPaused(false);
          this.events.emit('gameResumed');
        }
      });
    }

    // Create scrolling starfield background
    this.stars = new Starfield(this, { starCount: 150, scrollSpeed: 2, jitterAlpha: true });

    // Initialize score manager
    this.scoreManager = new ScoreManager();
    if (this.carryScore > 0) {
      this.scoreManager.addScore(this.carryScore);
      this.carryScore = 0;
    }

    // Create player
    this.player = new Player(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height - 100
    );

    // Load persistent shield upgrades and apply damage mitigation to player
    this.shieldUpgradeManager = new ShieldUpgradeManager();
    this.shieldUpgradeManager.ready.then(() => {
      this.player.setDamageMitigation(this.shieldUpgradeManager.getDamageMitigation());
    });

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

    // Create striker spawner if enabled for this level
    const strikerConfig = this.levelConfig.getEnemyConfig().STRIKER;
    if (strikerConfig?.ENABLED) {
      this.strikerSpawner = new StrikerSpawner(this);
      this.strikerSpawner.setPlayer(this.player);
    }

    // Set up collision manager
    this.collisionManager = new CollisionManager(this, this.player, this.enemySpawner, this.asteroidSpawner, this.shieldPowerUpSpawner, this.bossSpawner, this.strikerSpawner);

    // Create HUD
    this.hud = new HUD(this);
    this.hud.updateScore(0);
    this.hud.updateHealth(this.player.getHealth());

    bindSceneEvents(this, this, this.eventMap);

    // Test mode setup
    if (this.testMode) {
      this.enemySpawner.stopSpawning();
      this.asteroidSpawner.stopSpawning();
      this.shieldPowerUpSpawner.stopSpawning();
      this.bossSpawner.stopSpawning();
      this.strikerSpawner?.stopSpawning();

      const testUI = new TestUI(this);
    }
  }

  update(time: number): void {
    if (this.gameOver || this.paused) return;

    // Scroll the starfield
    this.stars?.update();

    // Update player
    if (this.player.active) {
      this.player.update(time);
      this.hud.updateHealth(this.player.getHealth());
    }
  }

  private handleEnemyDestroyed(scoreValue: number): void {
    this.totalEnemiesDestroyed++;
    this.addScoreAndCheckDifficulty(scoreValue);
  }

  private handleAsteroidDestroyed(scoreValue: number): void {
    this.totalEnemiesDestroyed++;
    this.addScoreAndCheckDifficulty(scoreValue);
  }

  private handleBossDestroyed(scoreValue: number): void {
    this.addScoreAndCheckDifficulty(scoreValue);
    this.paused = true;
    this.physics.pause();
    this.time.paused = true;
    this.physics.pause();

    this.events.emit('gamePaused');

    const totalSpawned = this.enemySpawner.getTotalSpawned()
      + (this.strikerSpawner?.getTotalSpawned() ?? 0)
      + this.asteroidSpawner.getTotalSpawned();
    const killPct = totalSpawned > 0
      ? Math.round((this.totalEnemiesDestroyed / totalSpawned) * 100)
      : 0;
    const originalScore = this.scoreManager.getCurrentScore();
    const modifiedScore = Math.round(originalScore * (1 + killPct / 100));
    this.scoreManager.addScore(modifiedScore - originalScore);
    this.hud.updateScore(this.scoreManager.getCurrentScore());

    this.hud.victory(killPct, originalScore, modifiedScore);

    window.setTimeout(() => {
      if (this.scene.isActive()) {
        this.hud.fadeToBlackKeepVictory(1500, () => {
          this.hud.showVictoryShop(
            this.shieldUpgradeManager,
            this.scoreManager,
            () => {
              void this.advanceToNextLevel();
            }
          );
        });
      }
    }, 3000);
  }

  private async advanceToNextLevel(): Promise<void> {
    if (!this.scene.isActive()) return;

    const nextLevel = getNextLevel(this.level);
    const carryScore = this.scoreManager.getCurrentScore();
    const highScore = this.scoreManager.getHighScore();

    if (nextLevel && await levelExists(nextLevel)) {
      this.scene.start('GameScene', { level: nextLevel, carryScore });
    } else {
      // No further level config exists — the player has beaten the game.
      this.scene.start('GameOverScene', {
        score: carryScore,
        highScore,
        gameWon: true,
      });
    }
  }

  private addScoreAndCheckDifficulty(scoreValue: number): void {
    this.scoreManager.addScore(scoreValue);
    this.hud.updateScore(this.scoreManager.getCurrentScore());

    // Increase difficulty every 100 points
    if (this.scoreManager.getCurrentScore() % 100 === 0) {
      this.enemySpawner.increaseDifficulty();
      this.asteroidSpawner.increaseDifficulty();
      this.strikerSpawner?.increaseDifficulty();
      // Keep power-up spawn rate at 10% of enemy rate
      this.shieldPowerUpSpawner.updateSpawnRate(this.enemySpawner.getSpawnDelay());
    }
  }

  private handlePlayerDied(): void {
    if (this.gameOver) return;

    this.gameOver = true;
    this.hud.updateHealth(this.player.getHealth());
    this.enemySpawner.stopSpawning();
    this.asteroidSpawner.stopSpawning();
    this.shieldPowerUpSpawner.stopSpawning();
    this.bossSpawner.stopSpawning();
    this.strikerSpawner?.stopSpawning();

    // Transition to game over scene after a brief delay
    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene', {
        score: this.scoreManager.getCurrentScore(),
        highScore: this.scoreManager.getHighScore()
      });
    });
  }

  shutdown(): void {
    if (this.eventMap) unbindSceneEvents(this, this, this.eventMap);
  }
}
