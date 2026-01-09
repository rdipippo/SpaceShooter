import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Load any boot-specific assets here if needed
  }

  create(): void {
    // Initialize game systems if needed
    // Move to PreloadScene
    this.scene.start('PreloadScene');
  }
}
