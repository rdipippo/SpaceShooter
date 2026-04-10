export class ScoreManager {
  private currentScore: number;
  private highScore!: number;
  private readonly HIGH_SCORE_KEY = 'spaceshooter_highscore';

  constructor() {
    this.currentScore = 0;
    this.loadHighScore();
  }

  addScore(points: number): void {
    this.currentScore += points;

    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      this.saveHighScore();
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

  private loadHighScore(): void {
    try {
      const stored = localStorage.getItem(this.HIGH_SCORE_KEY);
      this.highScore = stored ? parseInt(stored, 10) : 0;
    } catch (error) {
      console.warn('Could not load high score:', error);
      this.highScore = 0;
    }
  }

  private saveHighScore(): void {
    try {
      localStorage.setItem(this.HIGH_SCORE_KEY, this.highScore.toString());
    } catch (error) {
      console.warn('Could not save high score:', error);
    }
  }
}
