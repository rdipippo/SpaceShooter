# Testing Framework

This document defines the testing strategy for the Space Shooter codebase. It is the spec a contributor follows when adding tests.

## Why this framework

The codebase mixes two kinds of code:

- **Pure logic** that is trivial to test in isolation: `ScoreManager`, `LevelConfig`, `SceneEvents`, `BaseSpawner.increaseDifficulty`, damage math.
- **Phaser-coupled paths** that need a live scene: collision overlap setup, spawn timers, scene wiring, event flow between subsystems.

A single layer can't serve both well. Unit tests stay fast and stable but can't exercise wiring; full-browser E2E exercises everything but is slow and flaky. The framework therefore has three layers, with most tests in the cheapest layer.

## Stack

- **Vitest 4** — runner. Already wired to `npm test`.
- **jsdom** — DOM environment so Phaser can find `window`/`document`.
- **node-canvas** — provides a real canvas implementation; jsdom auto-detects it.
- **`Phaser.HEADLESS`** — Phaser's no-render mode for integration tests in Node.
- **`@vitest/coverage-v8`** — coverage provider.

## Layout

```
src/tests/
  setup.ts                          # global setup (mocks, polyfills)
  helpers/
    inMemoryPreferences.ts          # @capacitor/preferences mock store
    stubLevelConfig.ts              # makeLevelConfig / makeLevelConfigData
    headlessGame.ts                 # createHeadlessGame(SceneClass, options)
    tick.ts                         # tick(scene, ms) — manual time advance
  unit/
    *.test.ts                       # fast, no Phaser.Game
  integration/
    *.test.ts                       # boot Phaser.HEADLESS, exercise wiring
```

Tests are discovered by Vitest's include glob in `vitest.config.ts`:

```
src/tests/unit/**/*.test.ts
src/tests/integration/**/*.test.ts
```

## The three layers

### Layer 1 — Unit tests (`src/tests/unit/`)

- No `Phaser.Game` instance.
- Mock at module boundaries (`@capacitor/preferences` is auto-mocked in setup; spy on `Phaser.Math.Between` etc. when needed).
- Should finish in < 1s for the whole unit suite in watch mode.

Initial coverage:

| File | What it covers |
|---|---|
| `unit/ScoreManager.test.ts` | `addScore` adds, promotes high score, persists; `reset` clears current only; load on construction. |
| `unit/LevelConfig.test.ts` | All getters pass through; optional `STRIKER` is `undefined` when absent and present when set. |
| `unit/SceneEvents.test.ts` | `bindSceneEvents` calls `off` *then* `on` per key (regression alarm — this is the bug the helper exists to prevent). |
| `unit/BaseSpawner.test.ts` | `increaseDifficulty` decrements, clamps at `minSpawnDelay`, only restarts the timer when one already exists. |

### Layer 2 — Integration tests (`src/tests/integration/`)

- Each test boots a real `Phaser.Game` in `Phaser.HEADLESS` mode via `createHeadlessGame`.
- Time advances manually via `tick(scene, ms)`. No real frames, no `setTimeout` waits.
- Assert on **game state** (health, score, group `countActive(true)`, emitted events). Never on rendering.

Initial coverage:

| File | What it covers |
|---|---|
| `integration/headless.smoke.test.ts` | Booting Phaser.HEADLESS works; `create()` runs. |
| `integration/GameScene.boot.test.ts` | `GameScene` create wires player + four spawners; striker spawner toggles via level config. |
| `integration/Collisions.test.ts` | The bullet-vs-enemy overlap callback registered by `CollisionManager` deactivates the bullet, kills the target, and emits `enemyDestroyed`. |
| `integration/Spawning.test.ts` | After `tick`-ing past 3× the initial spawn delay, ≥3 enemies are active; `increaseDifficulty` drops the delay. |
| `integration/Persistence.test.ts` | `addScore` → save → fresh `ScoreManager` → `await ready` → high score loaded. |

Player input, particle effects, and tweens are deliberately *not* covered. They are presentation; their failures are visible to a human in 30 seconds and not worth the test scaffolding cost.

### Layer 3 — Manual smoke checklist

No automation. Run before every release; ~3 minutes.

1. `npm run dev` — server boots, browser opens to localhost:3000.
2. Main menu → start level 1-1 — game runs, player moves with WASD/arrows, fires with space.
3. Open test mode — fire one of each entity (asteroid, enemy, striker, shield, boss) — each appears and behaves.
4. Boss fight — drop boss to 0 HP — explosion plays, score event fires.
5. Die → game-over → restart → menu — loop completes; high score persists across a full page reload.

E2E browser testing (Playwright, Chrome DevTools MCP) is **not** part of this framework. Add it as Layer 4 only if integration coverage stops being enough.

## NPM scripts

```bash
npm test                    # watch mode, all tests
npm run test:run            # one-shot, all tests
npm run test:unit           # one-shot, unit only (fast)
npm run test:integration    # one-shot, integration only
npm run test:coverage       # full run + v8 coverage report
```

## How to write a test

### Unit test recipe

```ts
// src/tests/unit/MyThing.test.ts
import { describe, it, expect } from 'vitest';
import { MyThing } from '@/whatever/MyThing';

describe('MyThing', () => {
  it('does the thing', () => {
    expect(new MyThing().compute(2)).toBe(4);
  });
});
```

For Phaser-touching code, build a stub scene with only the surface you exercise:

```ts
const stubScene = {
  physics: { add: { group: vi.fn(() => ({})) } },
  time: { addEvent: vi.fn(() => ({ destroy: vi.fn() })) },
  cameras: { main: { width: 800, height: 600 } },
};
const subject = new MySpawner(stubScene as any, { initial: 2000 }, {});
```

### Integration test recipe

```ts
// src/tests/integration/MyFeature.test.ts
import { describe, it, expect, afterEach } from 'vitest';
import { GameScene } from '@/scenes/GameScene';
import { createHeadlessGame, HeadlessHandle } from '../helpers/headlessGame';
import { tick } from '../helpers/tick';

describe('MyFeature', () => {
  let h: HeadlessHandle<GameScene> | null = null;
  afterEach(() => { h?.destroy(); h = null; });

  it('spawns enemies on its timer', async () => {
    h = await createHeadlessGame(GameScene, { level: '1-1' });
    tick(h.scene, h.scene.enemySpawner.getSpawnDelay() * 3 + 100);
    expect(h.scene.enemySpawner.getEnemies().countActive(true)).toBeGreaterThanOrEqual(3);
  });
});
```

### Custom level config

```ts
import { makeLevelConfigData } from '../helpers/stubLevelConfig';

const data = makeLevelConfigData();
data.BOSS_CONFIG.HEALTH = 1;  // make boss test fast
const h = await createHeadlessGame(GameScene, { level: 'test', levelConfigData: data });
```

## Phaser-specific best practices

1. **Test pyramid.** Many unit tests, fewer integration tests, zero automated E2E.
2. **Mock at boundaries only** — `@capacitor/preferences` (auto-mocked), RNG via `vi.spyOn(Phaser.Math, 'Between')`, time via `tick()`. Never mock the unit under test.
3. **One headless game per test.** Construct in the test or `beforeEach`, `destroy()` in `afterEach`. Phaser leaks event listeners and timers across tests; sharing a game between tests will cause cascading failures.
4. **Assert state, not rendering.** `player.health`, `enemies.countActive(true)`, emitted events. Never compare pixels or check texture keys.
5. **Determinism.** Advance time with `tick(scene, ms)`, never with real `setTimeout` waits. Seed `Phaser.Math.RND` if a test depends on randomness.
6. **Subdirectory separation.** Unit and integration are deliberately split (`src/tests/unit/`, `src/tests/integration/`) so the unit run can stay fast — `npm run test:unit`.
7. **No tests for pure presentation** — particles, tweens, tints. They're verified by the manual smoke pass.
8. **Don't test the framework.** Phaser itself is tested by Phaser. We test *our* logic and *our* wiring.

## CI

Suggested workflow (not yet committed):

```yaml
# .github/workflows/test.yml (sketch)
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run test:run
```

Coverage is informational, not a gate, until the suite stabilizes.

## Out of scope (for now)

- Player input testing — defer until the input layer is extracted behind an interface.
- Visual regression testing — manual smoke covers it.
- Performance / FPS testing — not currently a concern.
- E2E browser tests — add Layer 4 only if integration tests stop catching wiring bugs.
