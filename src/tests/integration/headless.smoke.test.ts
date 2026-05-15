import { describe, it, expect, afterEach } from 'vitest';
import Phaser from 'phaser';
import { createHeadlessGame, HeadlessHandle } from '../helpers/headlessGame';

class EmptyScene extends Phaser.Scene {
  public didCreate = false;
  constructor() { super({ key: 'EmptyScene' }); }
  create(): void { this.didCreate = true; }
}

describe('headless game smoke', () => {
  let handle: HeadlessHandle<EmptyScene> | null = null;
  afterEach(() => { handle?.destroy(); handle = null; });

  it('boots Phaser.HEADLESS and runs scene create()', async () => {
    handle = await createHeadlessGame(EmptyScene);
    expect(handle.game.isRunning).toBe(true);
    expect(handle.scene.didCreate).toBe(true);
  });
});
