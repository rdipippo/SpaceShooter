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

export const COLORS = {
  PLAYER: 0x00ff00,
  ENEMY_BASIC: 0xff0000,
  BULLET: 0xffff00,
  STAR: 0xffffff,
  EXPLOSION: 0xff8800
};

export const UI_CONFIG = {
  FONT_FAMILY: 'Arial, sans-serif',
  SCORE_FONT_SIZE: '24px',
  TITLE_FONT_SIZE: '64px',
  MENU_FONT_SIZE: '36px'
};
