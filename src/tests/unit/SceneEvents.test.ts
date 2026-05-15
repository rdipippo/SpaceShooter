import { describe, it, expect, vi } from 'vitest';
import { bindSceneEvents, unbindSceneEvents } from '@/utils/SceneEvents';

function makeFakeScene() {
  const calls: Array<{ op: 'on' | 'off'; event: string }> = [];
  return {
    calls,
    events: {
      on: vi.fn((event: string) => { calls.push({ op: 'on', event }); }),
      off: vi.fn((event: string) => { calls.push({ op: 'off', event }); }),
    },
  };
}

describe('bindSceneEvents', () => {
  it('calls off then on for each event (regression: prevents double-binding)', () => {
    const scene = makeFakeScene();
    const ctx = {};
    const handler = () => {};
    bindSceneEvents(scene as any, ctx, { foo: handler, bar: handler });

    expect(scene.calls).toEqual([
      { op: 'off', event: 'foo' },
      { op: 'on', event: 'foo' },
      { op: 'off', event: 'bar' },
      { op: 'on', event: 'bar' },
    ]);
  });

  it('passes handler and context to events.on', () => {
    const scene = makeFakeScene();
    const ctx = { id: 'ctx' };
    const handler = vi.fn();
    bindSceneEvents(scene as any, ctx, { ping: handler });

    expect(scene.events.on).toHaveBeenCalledWith('ping', handler, ctx);
  });
});

describe('unbindSceneEvents', () => {
  it('calls off only — never on', () => {
    const scene = makeFakeScene();
    unbindSceneEvents(scene as any, {}, { foo: () => {}, bar: () => {} });

    expect(scene.events.off).toHaveBeenCalledTimes(2);
    expect(scene.events.on).not.toHaveBeenCalled();
  });
});
