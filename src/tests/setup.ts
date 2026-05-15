import { vi, beforeEach } from 'vitest';

vi.mock('@capacitor/preferences', async () => {
  const { inMemoryPreferences } = await import('./helpers/inMemoryPreferences');
  return { Preferences: inMemoryPreferences };
});

if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback): number =>
    setTimeout(() => cb(performance.now()), 16) as unknown as number;
  globalThis.cancelAnimationFrame = (id: number): void => clearTimeout(id);
}

beforeEach(async () => {
  const { __resetPreferences } = await import('./helpers/inMemoryPreferences');
  __resetPreferences();
});
