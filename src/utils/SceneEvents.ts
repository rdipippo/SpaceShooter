import Phaser from 'phaser';

export type SceneEventMap = Record<string, (...args: any[]) => void>;

export function bindSceneEvents(scene: Phaser.Scene, context: any, map: SceneEventMap): void {
  for (const event in map) {
    scene.events.off(event, map[event], context);
    scene.events.on(event, map[event], context);
  }
}

export function unbindSceneEvents(scene: Phaser.Scene, context: any, map: SceneEventMap): void {
  for (const event in map) {
    scene.events.off(event, map[event], context);
  }
}
