import Phaser from 'phaser';

export interface StarfieldOptions {
  starCount?: number;
  scrollSpeed?: number;
  textureKey?: string;
  jitterAlpha?: boolean;
}

export class Starfield {
  private tile: Phaser.GameObjects.TileSprite;
  private scrollSpeed: number;

  constructor(scene: Phaser.Scene, opts: StarfieldOptions = {}) {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;
    const starCount = opts.starCount ?? 100;
    const textureKey = opts.textureKey ?? `starfield_${scene.scene.key}`;
    this.scrollSpeed = opts.scrollSpeed ?? 1;

    if (!scene.textures.exists(textureKey)) {
      const graphics = scene.add.graphics();
      graphics.fillStyle(0xffffff);
      for (let i = 0; i < starCount; i++) {
        const x = Phaser.Math.Between(0, width);
        const y = Phaser.Math.Between(0, height);
        const size = Phaser.Math.Between(1, 2);
        if (opts.jitterAlpha) {
          const alpha = Phaser.Math.FloatBetween(0.3, 1);
          graphics.fillStyle(0xffffff, alpha);
        }
        graphics.fillCircle(x, y, size);
      }
      graphics.generateTexture(textureKey, width, height);
      graphics.destroy();
    }

    this.tile = scene.add.tileSprite(0, 0, width, height, textureKey);
    this.tile.setOrigin(0, 0);
    this.tile.setDepth(-1);
  }

  update(): void {
    this.tile.tilePositionY -= this.scrollSpeed;
  }
}
