import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { GameScene } from '../scenes/GameScene';
import { GameOverScene } from '../scenes/GameOverScene';
import { GAME_CONFIG } from '../utils/Constants';

const isMobile = !!(window as any).Capacitor || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: GAME_CONFIG.BACKGROUND_COLOR,
  scale: isMobile ? {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  } : {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    min: {
      width: 320,
      height: 240
    },
    max: {
      width: 1920,
      height: 1080
    }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    GameScene,
    GameOverScene
  ]
};
