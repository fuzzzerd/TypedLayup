# Typed Layup

A retro-style typing basketball game built with Vite, TypeScript, and Phaser.js. Type words to shoot down falling basketballs before they reach the bottom of the screen!

## Game Features

- **Typing Gameplay**: Type words displayed on falling basketballs to shoot them down
- **Progressive Difficulty**: Game speed increases over time with more balls spawning
- **Retro 16-bit Aesthetic**: Classic arcade-style graphics with grid background
- **Sound Effects**: 8-bit style sounds for typing, shooting, hits, and misses
- **High Score Tracking**: Persistent high scores saved in browser localStorage
- **Multiple Scenes**: Welcome screen, gameplay, and high score display

## How to Play

1. **Start the Game**: Press SPACE on the welcome screen
2. **Type Words**: Type the letters shown on the basketballs as they fall
3. **Fire**: Press ENTER when you've completed a word to shoot the ball
4. **Misfire Warning**: Pressing ENTER without a valid word match triggers a misfire (wastes time!)
5. **Switch Targets**: Press ESC to clear your input and target a different ball
6. **Don't Miss**: If a ball reaches the bottom, you lose a life (starts with 3 lives)
7. **Pause**: Press CTRL+P to pause/resume the game

## Controls

- **Letter Keys**: Type words on the basketballs
- **ENTER**: Fire at the target (must match the word exactly)
- **ESC**: Clear current input and switch targets
- **SPACE**: Start new game (from welcome/high score screen)
- **CTRL+P**: Pause/Resume game
- **H**: View high scores (from welcome screen)

## Game Configuration

You can adjust difficulty settings in `src/config/gameConfig.ts`:

- `startingLives`: Number of lives (default: 3)
- `maxSimultaneousBalls`: Maximum balls on screen at once (default: 3)
- `ballSpawnInterval`: Time between ball spawns in ms (default: 2000)
- `ballStartSpeed`: Initial falling speed (default: 50)
- `ballMaxSpeed`: Maximum falling speed (default: 150)
- `difficultyIncreaseInterval`: Time between difficulty increases (default: 30000)

## Adding More Words

Words are stored in `src/data/words.json`. The game automatically filters for words between 3-8 letters. To add more words, simply edit this JSON file:

```json
{
  "words": [
    "cat",
    "dog",
    "your-word-here"
  ]
}
```

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The game will be available at `http://localhost:5173/` (or the next available port).

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Technology Stack

- **Vite**: Fast build tool and dev server
- **TypeScript**: Type-safe JavaScript
- **Phaser.js**: HTML5 game framework
- **Web Audio API**: Sound effects generation

## Project Structure

```
src/
├── config/
│   └── gameConfig.ts      # Game configuration and settings
├── data/
│   └── words.json         # Word list for the game
├── scenes/
│   ├── WelcomeScene.ts    # Main menu
│   ├── GameScene.ts       # Main gameplay
│   └── HighScoreScene.ts  # High scores display
├── utils/
│   └── SoundManager.ts    # 8-bit sound effect generator
├── main.ts                # Phaser game initialization
└── style.css              # Global styles
```

## License

MIT
