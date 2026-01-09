export const GAME_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  BACKGROUND_COLOR: 0x000033
};

export const PLAYER_CONFIG = {
  SPEED: 300,
  MAX_HEALTH: 3,
  FIRE_RATE: 250,  // milliseconds between shots
  BULLET_SPEED: 500,
  BULLET_DAMAGE: 1
};

export const ENEMY_CONFIG = {
  BASIC: {
    HEALTH: 1,
    SPEED: 100,
    SCORE_VALUE: 10
  },
  INITIAL_SPAWN_DELAY: 2000,  // milliseconds
  MIN_SPAWN_DELAY: 500,        // minimum spawn delay (max difficulty)
  SPAWN_DIFFICULTY_INCREASE: 50  // decrease delay by this amount
};

export const ASTEROID_CONFIG = {
  SMALL: {
    HEALTH: 1,
    RADIUS: 15,
    SCORE_VALUE: 15,
    MIN_SPEED: 80,
    MAX_SPEED: 150
  },
  MEDIUM: {
    HEALTH: 2,
    RADIUS: 25,
    SCORE_VALUE: 25,
    MIN_SPEED: 50,
    MAX_SPEED: 100
  },
  LARGE: {
    HEALTH: 3,
    RADIUS: 40,
    SCORE_VALUE: 40,
    MIN_SPEED: 30,
    MAX_SPEED: 70
  },
  INITIAL_SPAWN_DELAY: 3000,
  MIN_SPAWN_DELAY: 1000,
  SPAWN_DIFFICULTY_INCREASE: 100,
  ANGULAR_VELOCITY_RANGE: 100,  // max rotation speed in degrees/sec
  BOUNCE: 0.8  // elasticity when bouncing off walls
};

export const COLORS = {
  PLAYER: 0x00ff00,
  ENEMY_BASIC: 0xff0000,
  BULLET: 0xffff00,
  STAR: 0xffffff,
  EXPLOSION: 0xff8800,
  ASTEROID: 0x8b7355
};

export const UI_CONFIG = {
  FONT_FAMILY: 'Arial, sans-serif',
  SCORE_FONT_SIZE: '24px',
  TITLE_FONT_SIZE: '64px',
  MENU_FONT_SIZE: '36px'
};
