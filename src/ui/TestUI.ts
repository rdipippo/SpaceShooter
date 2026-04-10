import { GameScene } from '@/scenes/GameScene';
import Phaser from 'phaser';

export class TestUI {
     constructor(scene: GameScene) {
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
        const label = scene.add.text(10, 80, 'TEST MODE', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ff9900'
        });
        label.setDepth(100);

        // Asteroid button
        const asteroidBtn = scene.add.text(buttonX, buttonY, 'Asteroid', buttonStyle);
            asteroidBtn.setOrigin(0.5);
            asteroidBtn.setInteractive({ useHandCursor: true });
            asteroidBtn.setDepth(100);
            asteroidBtn.on('pointerover', () => asteroidBtn.setStyle({ backgroundColor: '#555555' }));
            asteroidBtn.on('pointerout', () => asteroidBtn.setStyle({ backgroundColor: '#333333' }));
            asteroidBtn.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
            event.stopPropagation();
            this.spawnTestAsteroid(scene);
        });

        buttonY += buttonSpacing;

        // Enemy button
        const enemyBtn = scene.add.text(buttonX, buttonY, 'Enemy', buttonStyle);
            enemyBtn.setOrigin(0.5);
            enemyBtn.setInteractive({ useHandCursor: true });
            enemyBtn.setDepth(100);
            enemyBtn.on('pointerover', () => enemyBtn.setStyle({ backgroundColor: '#555555' }));
            enemyBtn.on('pointerout', () => enemyBtn.setStyle({ backgroundColor: '#333333' }));
            enemyBtn.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
            event.stopPropagation();
            this.spawnTestEnemy(scene);
        });

        buttonY += buttonSpacing;

        // Shield button
        const shieldBtn = scene.add.text(buttonX, buttonY, 'Shield', buttonStyle);
            shieldBtn.setOrigin(0.5);
            shieldBtn.setInteractive({ useHandCursor: true });
            shieldBtn.setDepth(100);
            shieldBtn.on('pointerover', () => shieldBtn.setStyle({ backgroundColor: '#555555' }));
            shieldBtn.on('pointerout', () => shieldBtn.setStyle({ backgroundColor: '#333333' }));
            shieldBtn.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
            event.stopPropagation();
            this.spawnTestShield(scene);
        });

        buttonY += buttonSpacing;

        // Boss button
        const bossBtn = scene.add.text(buttonX, buttonY, 'Boss', buttonStyle);
            bossBtn.setOrigin(0.5);
            bossBtn.setInteractive({ useHandCursor: true });
            bossBtn.setDepth(100);
            bossBtn.on('pointerover', () => bossBtn.setStyle({ backgroundColor: '#555555' }));
            bossBtn.on('pointerout', () => bossBtn.setStyle({ backgroundColor: '#333333' }));
            bossBtn.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
            event.stopPropagation();
            this.spawnTestBoss(scene);
        });

        buttonY += buttonSpacing;

        // Invincible button
        const invincibleBtn = scene.add.text(buttonX, buttonY, 'Invincible', buttonStyle);
        invincibleBtn.setOrigin(0.5);
        invincibleBtn.setInteractive({ useHandCursor: true });
        invincibleBtn.setDepth(100);
        invincibleBtn.on('pointerover', () => invincibleBtn.setStyle({ backgroundColor: '#555555' }));
        invincibleBtn.on('pointerout', () => {
        if (scene.player.getInvincible()) {
            invincibleBtn.setStyle({ backgroundColor: '#006600' });
        } else {
            invincibleBtn.setStyle({ backgroundColor: '#333333' });
        }
        });
        invincibleBtn.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        const newState = !scene.player.getInvincible();
        scene.player.setInvincible(newState);
        if (newState) {
            invincibleBtn.setStyle({ backgroundColor: '#006600' });
        } else {
            invincibleBtn.setStyle({ backgroundColor: '#333333' });
        }
    });
  }

  private spawnTestAsteroid(scene: GameScene): void {
    scene.asteroidSpawner.spawnSingle();
  }

  private spawnTestEnemy(scene: GameScene): void {
    scene.enemySpawner.spawnSingle();
  }

  private spawnTestShield(scene: GameScene): void {
    scene.shieldPowerUpSpawner.spawnSingle();
  }

  private spawnTestBoss(scene: GameScene): void {
    scene.bossSpawner.spawnSingle();
  }
}