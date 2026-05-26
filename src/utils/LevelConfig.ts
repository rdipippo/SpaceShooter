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

export interface StrikerConfig {
    ENABLED: boolean;
    HEALTH: number;
    SPEED: number;
    DIVE_SPEED: number;
    SCORE_VALUE: number;
    INITIAL_SPAWN_DELAY: number;
    MIN_SPAWN_DELAY: number;
    SPAWN_DIFFICULTY_INCREASE: number;
    DETECTION_RANGE: number;
    FIRE_RATE: number;
    BULLET_SPEED: number;
    BULLET_DAMAGE: number;
}

export interface EnemyConfig {
    BASIC: EnemyBasicConfig;
    STRIKER?: StrikerConfig;
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

/**
 * Compute the next level ID from a "W-L" string.
 * Within a world, levels run 1..10; after W-10, advance to (W+1)-1.
 * Returns null if the input is malformed.
 */
export function getNextLevel(level: string): string | null {
    const match = /^(\d+)-(\d+)$/.exec(level);
    if (!match) return null;
    const world = parseInt(match[1], 10);
    const num = parseInt(match[2], 10);
    if (!Number.isFinite(world) || !Number.isFinite(num) || world < 1 || num < 1) return null;
    if (num < 10) return `${world}-${num + 1}`;
    return `${world + 1}-1`;
}

/**
 * Probe whether a level config file exists at config/levels/<level>.json.
 * Used to detect "no more levels → player has beaten the game".
 *
 * Note: dev servers (Vite) and SPA hosts often return the index.html fallback
 * with status 200 for missing files, so we additionally check the response
 * content-type to ensure we're actually getting JSON.
 */
export async function levelExists(level: string): Promise<boolean> {
    try {
        const res = await fetch(`config/levels/${level}.json`, { method: 'HEAD' });
        if (!res.ok) return false;
        const ct = res.headers.get('content-type') ?? '';
        return ct.toLowerCase().includes('json');
    } catch {
        return false;
    }
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