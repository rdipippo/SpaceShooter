import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig';

window.addEventListener('load', () => {
  const game = new Phaser.Game(gameConfig);
  if (import.meta.env.DEV) {
    (window as unknown as { __game: Phaser.Game }).__game = game;
  }

  // Prevent scrolling on mobile
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.height = '100%';
});
