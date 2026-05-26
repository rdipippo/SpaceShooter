import { Preferences } from '@capacitor/preferences';
import { SHIELD_UPGRADE_CONFIG } from '../utils/Constants';

export class ShieldUpgradeManager {
  private upgradeCount: number = 0;
  private readonly STORAGE_KEY = 'spaceshooter_shield_upgrades';
  public readonly ready: Promise<void>;

  constructor() {
    this.ready = this.load();
  }

  getUpgradeCount(): number {
    return this.upgradeCount;
  }

  getNextPrice(): number {
    return (this.upgradeCount + 1) * SHIELD_UPGRADE_CONFIG.BASE_PRICE;
  }

  getDamageMitigation(): number {
    return this.upgradeCount * SHIELD_UPGRADE_CONFIG.DAMAGE_REDUCTION_PER_LEVEL;
  }

  async purchaseUpgrade(): Promise<void> {
    this.upgradeCount++;
    await this.save();
  }

  private async load(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: this.STORAGE_KEY });
      this.upgradeCount = value ? parseInt(value, 10) || 0 : 0;
    } catch (error) {
      console.warn('Could not load shield upgrades:', error);
    }
  }

  private async save(): Promise<void> {
    try {
      await Preferences.set({ key: this.STORAGE_KEY, value: this.upgradeCount.toString() });
    } catch (error) {
      console.warn('Could not save shield upgrades:', error);
    }
  }
}
