# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on localhost:3000 (auto-opens browser)
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
```

**Mobile (Capacitor):**
```bash
npm run cap:sync           # Sync web assets to native projects
npm run cap:open:ios       # Open Xcode
npm run cap:open:android   # Open Android Studio
```

## Architecture

This is a **Phaser 3** space shooter game written in **TypeScript**, built with **Vite**, with mobile support via **Capacitor**.

### Scene Flow
`BootScene` → `PreloadScene` → `MainMenuScene` → `GameScene` → `GameOverScene`

### Directory Structure

- **src/scenes/** - Phaser scenes controlling game flow
  - `GameScene.ts` is the main gameplay scene (~1700 LOC)
- **src/entities/** - Game objects (Player, Enemy, Boss, Bullet types, Asteroid, ShieldPowerUp)
- **src/systems/** - Game logic managers:
  - `CollisionManager.ts` - All collision handling
  - `EnemySpawner.ts`, `AsteroidSpawner.ts`, `BossSpawner.ts`, `ShieldPowerUpSpawner.ts` - Spawning with difficulty scaling
  - `ScoreManager.ts` - Score tracking with localStorage persistence
- **src/ui/** - HUD elements (score, health, pause menu)
- **src/utils/Constants.ts** - All game tuning parameters (speeds, spawn rates, dimensions, health values)

### Key Patterns

- All game objects are rendered as generated graphics textures (created in PreloadScene), not image assets
- Path alias: `@/*` maps to `./src/*`
- Classes extend Phaser base classes (Scene, Sprite, Group)
- Systems are initialized in GameScene and managed independently
- Event-driven collision handling via scene events
- Supports both keyboard (WASD/arrows, spacebar) and touch controls

### Game Balance

All balance parameters are centralized in `src/utils/Constants.ts`:
- Player: 3 health, 300 speed, 250ms fire rate
- Boss: 10 health, spawns at 180 seconds, 5 gun positions
- Difficulty scales with score (spawn delays decrease from 2000ms to 500ms minimum)
