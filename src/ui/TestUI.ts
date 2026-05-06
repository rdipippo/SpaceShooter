import { GameScene } from '@/scenes/GameScene';
import Phaser from 'phaser';

const BUTTON_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Arial',
  fontSize: '14px',
  color: '#ffffff',
  backgroundColor: '#333333',
  padding: { x: 10, y: 8 }
};

const BG_NORMAL = '#333333';
const BG_HOVER = '#555555';
const BG_TOGGLED = '#006600';

function createTestButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void
): Phaser.GameObjects.Text {
  const btn = scene.add.text(x, y, label, BUTTON_STYLE);
  btn.setOrigin(0.5);
  btn.setInteractive({ useHandCursor: true });
  btn.setDepth(100);
  btn.on('pointerover', () => btn.setStyle({ backgroundColor: BG_HOVER }));
  btn.on('pointerout', () => btn.setStyle({ backgroundColor: BG_NORMAL }));
  btn.on('pointerdown', (
    _pointer: Phaser.Input.Pointer,
    _localX: number,
    _localY: number,
    event: Phaser.Types.Input.EventData
  ) => {
    event.stopPropagation();
    onClick();
  });
  return btn;
}

function createToggleButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  isOn: () => boolean,
  onToggle: (next: boolean) => void
): Phaser.GameObjects.Text {
  const btn = scene.add.text(x, y, label, BUTTON_STYLE);
  btn.setOrigin(0.5);
  btn.setInteractive({ useHandCursor: true });
  btn.setDepth(100);

  const restingBg = () => (isOn() ? BG_TOGGLED : BG_NORMAL);

  btn.on('pointerover', () => btn.setStyle({ backgroundColor: BG_HOVER }));
  btn.on('pointerout', () => btn.setStyle({ backgroundColor: restingBg() }));
  btn.on('pointerdown', (
    _pointer: Phaser.Input.Pointer,
    _localX: number,
    _localY: number,
    event: Phaser.Types.Input.EventData
  ) => {
    event.stopPropagation();
    const next = !isOn();
    onToggle(next);
    btn.setStyle({ backgroundColor: next ? BG_TOGGLED : BG_NORMAL });
  });

  return btn;
}

export class TestUI {
  constructor(scene: GameScene) {
    const buttonX = 70;
    const buttonSpacing = 50;
    let buttonY = 120;

    const label = scene.add.text(10, 80, 'TEST MODE', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ff9900'
    });
    label.setDepth(100);

    createTestButton(scene, buttonX, buttonY, 'Asteroid', () =>
      scene.asteroidSpawner.spawnSingle()
    );
    buttonY += buttonSpacing;

    createTestButton(scene, buttonX, buttonY, 'Enemy', () =>
      scene.enemySpawner.spawnSingle()
    );
    buttonY += buttonSpacing;

    createTestButton(scene, buttonX, buttonY, 'Shield', () =>
      scene.shieldPowerUpSpawner.spawnSingle()
    );
    buttonY += buttonSpacing;

    createTestButton(scene, buttonX, buttonY, 'Boss', () =>
      scene.bossSpawner.spawnSingle()
    );
    buttonY += buttonSpacing;

    createToggleButton(
      scene,
      buttonX,
      buttonY,
      'Invincible',
      () => scene.player.getInvincible(),
      (next) => scene.player.setInvincible(next)
    );
  }
}
