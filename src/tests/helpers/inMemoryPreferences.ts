// In-memory replacement for @capacitor/preferences. Wired up via vi.mock in setup.ts.

const store = new Map<string, string>();

export const inMemoryPreferences = {
  async get({ key }: { key: string }): Promise<{ value: string | null }> {
    return { value: store.get(key) ?? null };
  },
  async set({ key, value }: { key: string; value: string }): Promise<void> {
    store.set(key, value);
  },
  async remove({ key }: { key: string }): Promise<void> {
    store.delete(key);
  },
  async clear(): Promise<void> {
    store.clear();
  },
};

export function __resetPreferences(): void {
  store.clear();
}
