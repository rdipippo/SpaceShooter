import Phaser from 'phaser';

/**
 * Advance a scene's time and physics by `ms` milliseconds in `stepMs` slices.
 * Smaller steps make timer/physics callbacks fire on the schedule the game expects.
 */
export function tick(scene: Phaser.Scene, ms: number, stepMs = 16): void {
  const sys = scene.sys;
  let elapsed = 0;
  let now = scene.time.now;
  while (elapsed < ms) {
    const delta = Math.min(stepMs, ms - elapsed);
    now += delta;
    sys.step(now, delta);
    elapsed += delta;
  }
}
