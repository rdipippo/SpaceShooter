import { Preferences } from '@capacitor/preferences';

export class ScoreManager {
  private currentScore: number;
  private highScore: number = 0;
  private readonly HIGH_SCORE_KEY = 'spaceshooter_highscore';
  public readonly ready: Promise<void>;

  constructor() {
    this.currentScore = 0;
    // Kick off the async load. Callers that need the high score before
    // showing it should await `ready`.
    this.ready = this.loadHighScore();
  }

  addScore(points: number): void {
    this.currentScore += points;

    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      // Fire-and-forget; persist failures are logged but non-fatal.
      void this.saveHighScore();
    }
  }

  getCurrentScore(): number {
    return this.currentScore;
  }

  getHighScore(): number {
    return this.highScore;
  }

  reset(): void {
    this.currentScore = 0;
  }

  spendScore(amount: number): boolean {
    if (this.currentScore < amount) return false;
    this.currentScore -= amount;
    return true;
  }

  private async loadHighScore(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: this.HIGH_SCORE_KEY });
      this.highScore = value ? parseInt(value, 10) || 0 : 0;
    } catch (error) {
      console.warn('Could not load high score:', error);
      this.highScore = 0;
    }
  }

  private async saveHighScore(): Promise<void> {
    try {
      await Preferences.set({
        key: this.HIGH_SCORE_KEY,
        value: this.highScore.toString()
      });
    } catch (error) {
      console.warn('Could not save high score:', error);
    }
  }
}
