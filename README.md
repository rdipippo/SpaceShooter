# Space Shooter

A cross-platform 2D top-down space shooter game built with Phaser 3, TypeScript, and Capacitor. Play in your browser or on iOS/Android devices!

## Features

- Top-down space shooter gameplay
- Player ship with shooting mechanics
- Enemy spawning system with increasing difficulty
- Score tracking with high score persistence
- Health system with visual feedback
- Responsive controls (keyboard for desktop, touch for mobile)
- Cross-platform support (Web, iOS, Android)

## Technologies

- **Phaser 3** - HTML5 game framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Capacitor** - Native mobile wrapper (for iOS/Android builds)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server (opens in browser automatically)
npm run dev
```

The game will be available at `http://localhost:3000`

### Build for Web

```bash
# Build production version
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory.

## Controls

### Desktop
- **WASD** or **Arrow Keys** - Move the ship
- **Spacebar** - Shoot

### Mobile
- The game automatically adapts to touch input

## Game Mechanics

- **Objective**: Destroy enemies and survive as long as possible
- **Health**: You have 3 hearts. Colliding with enemies damages you
- **Score**: Destroy enemies to earn points (10 points per enemy)
- **Difficulty**: Enemy spawn rate increases every 100 points
- **High Score**: Your best score is saved locally

## Project Structure

```
SpaceShooter/
├── src/
│   ├── main.ts              # Entry point
│   ├── config/
│   │   └── gameConfig.ts    # Phaser configuration
│   ├── scenes/              # Game scenes
│   │   ├── BootScene.ts
│   │   ├── PreloadScene.ts
│   │   ├── MainMenuScene.ts
│   │   ├── GameScene.ts
│   │   └── GameOverScene.ts
│   ├── entities/            # Game objects
│   │   ├── Player.ts
│   │   ├── Enemy.ts
│   │   └── Bullet.ts
│   ├── systems/             # Game systems
│   │   ├── EnemySpawner.ts
│   │   ├── CollisionManager.ts
│   │   └── ScoreManager.ts
│   ├── ui/                  # UI components
│   │   └── HUD.ts
│   └── utils/               # Utilities and constants
│       └── Constants.ts
├── public/                  # Static assets
└── dist/                    # Build output
```

## Building for Mobile

### Setup Capacitor (First time only)

```bash
# Initialize Capacitor
npm run cap:init
# When prompted:
# App name: Space Shooter
# App ID: com.yourcompany.spaceshooter

# Add platforms
npm run cap:add:ios      # Requires macOS
npm run cap:add:android
```

### Build and Deploy to Mobile

```bash
# 1. Build the web version
npm run build

# 2. Copy web assets to native projects
npm run cap:sync

# 3. Open in native IDE
npm run cap:open:ios      # Opens Xcode (macOS only)
npm run cap:open:android  # Opens Android Studio

# 4. Build and run from the native IDE
```

### iOS Requirements
- macOS with Xcode installed
- Apple Developer account (for device deployment)

### Android Requirements
- Android Studio installed
- Android SDK configured

## Customization

You can easily customize the game by editing `src/utils/Constants.ts`:

```typescript
// Player settings
PLAYER_CONFIG.SPEED          // Movement speed
PLAYER_CONFIG.MAX_HEALTH     // Starting health
PLAYER_CONFIG.FIRE_RATE      // Shooting speed

// Enemy settings
ENEMY_CONFIG.BASIC.HEALTH    // Enemy health
ENEMY_CONFIG.BASIC.SPEED     // Enemy movement speed
ENEMY_CONFIG.BASIC.SCORE_VALUE // Points per enemy

// Difficulty
ENEMY_CONFIG.INITIAL_SPAWN_DELAY // Starting spawn rate
ENEMY_CONFIG.MIN_SPAWN_DELAY     // Maximum difficulty
```

## Future Enhancements

Potential features to add:
- Multiple enemy types with different behaviors
- Power-ups (rapid fire, shield, multi-shot)
- Boss fights
- Wave-based levels
- Sound effects and background music
- Better graphics and animations
- Particle effects and screen shake
- Online leaderboard

## License

MIT License - Feel free to use this project however you like!

## Credits

Built with Phaser 3 - https://phaser.io
