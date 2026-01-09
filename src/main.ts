import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig';

window.addEventListener('load', () => {
  new Phaser.Game(gameConfig);

  // Prevent scrolling on mobile
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.height = '100%';
});
