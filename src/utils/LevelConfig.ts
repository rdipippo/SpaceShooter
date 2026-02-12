// Interfaces describing the full structure of a level JSON file (e.g. 1-1.json)

export interface EnemyBasicConfig {
    HEALTH: number;
    SPEED: number;
    SCORE_VALUE: number;
}

export interface EnemyShootingConfig {
    DETECTION_RANGE: number;
    FIRE_RATE: number;
    BULLET_SPEED: number;
    BULLET_DAMAGE: number;
}

export interface EnemyConfig {
    BASIC: EnemyBasicConfig;
    INITIAL_SPAWN_DELAY: number;
    MIN_SPAWN_DELAY: number;
    SPAWN_DIFFICULTY_INCREASE: number;
    SHOOTING: EnemyShootingConfig;
}

export interface AsteroidSizeConfig {
    HEALTH: number;
    RADIUS: number;
    SCORE_VALUE: number;
    MIN_SPEED: number;
    MAX_SPEED: number;
}

export interface AsteroidConfig {
    SMALL: AsteroidSizeConfig;
    MEDIUM: AsteroidSizeConfig;
    LARGE: AsteroidSizeConfig;
    INITIAL_SPAWN_DELAY: number;
    MIN_SPAWN_DELAY: number;
    SPAWN_DIFFICULTY_INCREASE: number;
    ANGULAR_VELOCITY_RANGE: number;
    BOUNCE: number;
}

export interface ShieldPowerupConfig {
    HEAL_AMOUNT: number;
    SPEED: number;
    SPAWN_RATE_MULTIPLIER: number;
}

export interface BossShootingConfig {
    FIRE_RATE: number;
    BULLET_SPEED: number;
    BULLET_DAMAGE: number;
    GUN_COUNT: number;
}

export interface BossDodgeConfig {
    REACTION_DISTANCE: number;
    DODGE_SPEED: number;
}

export interface BossConfig {
    HEALTH: number;
    WIDTH: number;
    HEIGHT: number;
    SPEED: number;
    SCORE_VALUE: number;
    SPAWN_TIME: number;
    Y_POSITION: number;
    SHOOTING: BossShootingConfig;
    DODGE: BossDodgeConfig;
}

export interface LevelConfigData {
    ENEMY_CONFIG: EnemyConfig;
    ASTEROID_CONFIG: AsteroidConfig;
    SHIELD_POWERUP_CONFIG: ShieldPowerupConfig;
    BOSS_CONFIG: BossConfig;
}

export class LevelConfig {
    private level: string;
    private config: LevelConfigData;

    constructor(level: string, data: LevelConfigData) {
        this.level = level;
        this.config = data;
    }

    public getLevel(): string {
        return this.level;
    }

    public getBossConfig(): BossConfig {
        return this.config.BOSS_CONFIG;
    }

    public getShieldPowerupConfig(): ShieldPowerupConfig {
        return this.config.SHIELD_POWERUP_CONFIG;
    }

    public getEnemyConfig(): EnemyConfig {
        return this.config.ENEMY_CONFIG;
    }

    public getAsteroidConfig(): AsteroidConfig {
        return this.config.ASTEROID_CONFIG;
    }
}