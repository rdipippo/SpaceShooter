import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseSpawner } from '@/systems/BaseSpawner';

class TestSpawner extends BaseSpawner {
  spawnCalls = 0;
  protected spawnAt(_x: number, _y: number): void {
    this.spawnCalls += 1;
  }
}

function makeStubScene() {
  const timer = { destroy: vi.fn() };
  const addEvent = vi.fn(() => timer);
  const group = { clear: vi.fn() };
  const groupFactory = vi.fn(() => group);
  return {
    timer,
    addEvent,
    group,
    scene: {
      physics: { add: { group: groupFactory } },
      time: { addEvent },
      cameras: { main: { width: 800, height: 600 } },
    },
  };
}

describe('BaseSpawner.increaseDifficulty', () => {
  let stub: ReturnType<typeof makeStubScene>;
  let spawner: TestSpawner;

  beforeEach(() => {
    stub = makeStubScene();
    spawner = new TestSpawner(
      stub.scene as any,
      { initial: 2000, min: 500, increase: 100 },
      {}
    );
  });

  it('decrements spawnDelay by `increase`', () => {
    spawner.startSpawning();
    spawner.increaseDifficulty();
    expect(spawner.getSpawnDelay()).toBe(1900);
  });

  it('clamps at minSpawnDelay', () => {
    spawner.startSpawning();
    for (let i = 0; i < 100; i += 1) spawner.increaseDifficulty();
    expect(spawner.getSpawnDelay()).toBe(500);
  });

  it('does nothing once already at min', () => {
    spawner.startSpawning();
    for (let i = 0; i < 100; i += 1) spawner.increaseDifficulty();
    const callsBefore = stub.timer.destroy.mock.calls.length;
    spawner.increaseDifficulty();
    expect(stub.timer.destroy.mock.calls.length).toBe(callsBefore);
  });

  it('restarts the timer when called after startSpawning', () => {
    spawner.startSpawning();
    stub.addEvent.mockClear();
    spawner.increaseDifficulty();
    expect(stub.timer.destroy).toHaveBeenCalled();
    expect(stub.addEvent).toHaveBeenCalledTimes(1);
  });

  it('does not start a timer if startSpawning was never called', () => {
    spawner.increaseDifficulty();
    expect(stub.addEvent).not.toHaveBeenCalled();
  });
});

describe('BaseSpawner.stopSpawning', () => {
  it('destroys the active timer', () => {
    const stub = makeStubScene();
    const spawner = new TestSpawner(stub.scene as any, { initial: 1000 }, {});
    spawner.startSpawning();
    spawner.stopSpawning();
    expect(stub.timer.destroy).toHaveBeenCalled();
  });

  it('is a no-op when no timer is active', () => {
    const stub = makeStubScene();
    const spawner = new TestSpawner(stub.scene as any, { initial: 1000 }, {});
    expect(() => spawner.stopSpawning()).not.toThrow();
  });
});
