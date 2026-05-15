import Phaser from 'phaser';
import { LevelConfigData } from '@/utils/LevelConfig';
import { makeLevelConfigData } from './stubLevelConfig';

export interface HeadlessHandle<S extends Phaser.Scene> {
  game: Phaser.Game;
  scene: S;
  destroy(): void;
}

export interface BootOptions {
  level?: string;
  levelConfigData?: LevelConfigData;
  initData?: Record<string, unknown>;
  width?: number;
  height?: number;
}

/**
 * Boot a Phaser.Game in HEADLESS mode and add the given scene class.
 * The level JSON cache is pre-populated so scenes that call
 * `this.load.json('levelConfig', ...)` resolve from in-memory data.
 *
 * The returned promise resolves once the scene's `create()` has run.
 */
export function createHeadlessGame<S extends Phaser.Scene>(
  SceneClass: new () => S,
  options: BootOptions = {}
): Promise<HeadlessHandle<S>> {
  const level = options.level ?? '1-1';
  const data = options.levelConfigData ?? makeLevelConfigData();
  const width = options.width ?? 800;
  const height = options.height ?? 600;

  return new Promise((resolve) => {
    const sceneInstance = new SceneClass();

    const game = new Phaser.Game({
      type: Phaser.HEADLESS,
      width,
      height,
      physics: { default: 'arcade', arcade: { debug: false } },
      scene: sceneInstance,
      autoFocus: false,
      audio: { noAudio: true },
      banner: false,
    });

    game.events.once(Phaser.Core.Events.READY, () => {
      // Pre-populate the levelConfig JSON cache so GameScene.preload finds it.
      game.cache.json.add('levelConfig', data);
      sceneInstance.scene.start(sceneInstance.scene.key, { level, ...(options.initData ?? {}) });

      // Wait for create() to finish before resolving.
      sceneInstance.events.once(Phaser.Scenes.Events.CREATE, () => {
        resolve({
          game,
          scene: sceneInstance,
          destroy: () => game.destroy(true, false),
        });
      });
    });
  });
}
