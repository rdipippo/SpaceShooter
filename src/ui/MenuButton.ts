import Phaser from 'phaser';

export interface MenuButtonOptions {
  fontFamily: string;
  fontSize: string;
  color: string;
  blink?: boolean;
  hoverColor?: string;
  baseColor?: string;
}

export function createMenuButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  onClick: () => void,
  opts: MenuButtonOptions
): Phaser.GameObjects.Text {
  const btn = scene.add.text(x, y, text, {
    fontFamily: opts.fontFamily,
    fontSize: opts.fontSize,
    color: opts.color
  });
  btn.setOrigin(0.5);
  btn.setInteractive({ useHandCursor: true });

  if (opts.blink) {
    scene.tweens.add({
      targets: btn,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  if (opts.hoverColor && opts.baseColor) {
    btn.on('pointerover', () => btn.setColor(opts.hoverColor!));
    btn.on('pointerout', () => btn.setColor(opts.baseColor!));
  }

  btn.on('pointerdown', onClick);

  return btn;
}
