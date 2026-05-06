import Phaser from 'phaser';

export abstract class BaseBullet extends Phaser.Physics.Arcade.Sprite {
  public damage: number = 1;
  protected speed: number = 0;

  fire(x: number, y: number, vx: number = 0, vy: number = this.speed): void {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setVelocity(vx, vy);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    const cam = this.scene.cameras.main;
    if (
      this.y < -this.height ||
      this.y > cam.height + this.height ||
      this.x < -this.width ||
      this.x > cam.width + this.width
    ) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}
