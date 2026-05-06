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

/**
 * Visual-only sizing used by PreloadScene to generate textures.
 * Gameplay numbers live in per-level JSON via LevelConfig — keep these in sync.
 */
export const TEXTURE_CONFIG = {
  ASTEROID: {
    SMALL: { RADIUS: 15 },
    MEDIUM: { RADIUS: 25 },
    LARGE: { RADIUS: 40 }
  },
  BOSS: {
    WIDTH: 200,
    HEIGHT: 100,
    GUN_COUNT: 5
  }
};

export const COLORS = {
  PLAYER: 0x00ff00,
  ENEMY_BASIC: 0xff0000,
  ENEMY_STRIKER: 0xff8800,
  BULLET: 0xffff00,
  ENEMY_BULLET: 0xff4444,
  STAR: 0xffffff,
  EXPLOSION: 0xff8800,
  ASTEROID: 0x8b7355,
  SHIELD_POWERUP: 0x00ffff,
  BOSS: 0x990099,
  BOSS_BULLET: 0xff00ff
};

export const UI_CONFIG = {
  FONT_FAMILY: 'Arial, sans-serif',
  SCORE_FONT_SIZE: '24px',
  TITLE_FONT_SIZE: '64px',
  MENU_FONT_SIZE: '36px'
};
