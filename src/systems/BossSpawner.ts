import Phaser from 'phaser';
import { Boss } from '../entities/Boss';
import { BossBullet } from '../entities/BossBullet';
import { Player } from '../entities/Player';
import { GAME_CONFIG } from '../utils/Constants';
import { GameScene } from '@/scenes/GameScene';

export class BossSpawner {
  private scene: GameScene;
  private boss: Boss | null = null;
  private bossBullets!: Phaser.Physics.Arcade.Group;
  private player: Player | null = null;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private bossSpawned: boolean = false;

  constructor(scene: GameScene) {
    this.scene = scene;

    this.initBossBulletGroup();
    this.startSpawnTimer();
  }

  setPlayer(player: Player): void {
    this.player = player;
  }

  private initBossBulletGroup(): void {
    this.bossBullets = this.scene.physics.add.group({
      classType: BossBullet,
      maxSize: 50,
      runChildUpdate: true
    });
  }

  private startSpawnTimer(): void {
    const bossConfig = this.scene.levelConfig.getBossConfig();
    this.spawnTimer = this.scene.time.delayedCall(bossConfig.SPAWN_TIME, () => {
      this.spawnBoss();
    });
  }

  private spawnBoss(): void {
    if (this.bossSpawned) return;

    this.bossSpawned = true;
    const bossConfig = this.scene.levelConfig.getBossConfig();

    // Spawn boss at center top of screen
    const x = GAME_CONFIG.WIDTH / 2;
    const y = bossConfig.Y_POSITION;

    this.boss = new Boss(this.scene, x, -1 * bossConfig.HEIGHT);

    // Animate boss entering from top
    this.scene.tweens.add({
      targets: this.boss,
      y: y,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        if (this.boss && this.player) {
          this.boss.setShootingTargets(this.player, this.bossBullets);
        }
      }
    });

    // Emit event to notify game that boss has spawned
    this.scene.events.emit('bossSpawned');
  }

  spawnSingle(): void {
    // For test mode - spawn boss immediately
    if (this.bossSpawned && this.boss && this.boss.active) return;

    this.bossSpawned = true;
    const bossConfig = this.scene.levelConfig.getBossConfig();

    const x = GAME_CONFIG.WIDTH / 2;
    const y = bossConfig.Y_POSITION;

    this.boss = new Boss(this.scene, x, y);

    if (this.player) {
      this.boss.setShootingTargets(this.player, this.bossBullets);
    }

    // Emit event to set up collisions
    this.scene.events.emit('bossSpawned');
  }

  stopSpawning(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }
  }

  destroyAll(): void {
    this.stopSpawning();
    if (this.boss) {
      this.boss.destroy();
      this.boss = null;
    }
    this.bossBullets.clear(true, true);
    this.bossSpawned = false;
  }

  getBoss(): Boss | null {
    return this.boss;
  }

  getBossBullets(): Phaser.Physics.Arcade.Group {
    return this.bossBullets;
  }

  isBossSpawned(): boolean {
    return this.bossSpawned;
  }

  isBossAlive(): boolean {
    return this.boss !== null && this.boss.active;
  }
}
