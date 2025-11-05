# Typed Layup

A retro-style typing basketball game built with Vite, TypeScript, and Phaser.js. Type words to shoot down falling basketballs before they reach the bottom of the screen!

## Game Features

- **Four Difficulty Levels**: Choose from Easy, Medium, Hard, or Insanity modes
- **Typing Gameplay**: Type words displayed on falling basketballs to shoot them down
- **Visual Feedback**: Matched letters turn green as you type, unmatched letters stay white
- **Progressive Difficulty**: Game speed increases over time with more balls spawning
- **Reset System**: Earn free resets (1 per 100 points) to clear typos with ESC
- **Retro 16-bit Aesthetic**: Classic arcade-style graphics with grid background
- **Sound Effects**: 8-bit style sounds for typing, shooting, hits, and misses
- **High Score Tracking**: Top 10 scores with player initials, date, and difficulty level
- **Fullscreen Support**: Press CTRL+ENTER to toggle fullscreen mode

## How to Play

**Getting Started:**

- **Select Difficulty**: Use number keys (1-4) or arrow keys to choose difficulty level
  - **Easy**: 2 balls max, slower spawns, gentler speeds
  - **Medium**: 3 balls max, moderate spawns, balanced speeds
  - **Hard**: 4 balls max, faster spawns, high speeds
  - **Insanity**: 8 balls max, rapid spawns, extreme speeds
- **Start the Game**: Press SPACE after selecting your difficulty

**Gameplay:**

- **Type Words**: Type the letters shown on the basketballs as they fall
  - Matched letters turn **green** as you type correctly
  - Unmatched letters remain **white**
  - Active ball gets a **yellow border**
- **Fire**: Press ENTER when you've completed the word to shoot the ball
- **Misfire Warning**: Pressing ENTER without a valid word match triggers a misfire (wastes time!)
- **Reset System**: Press ESC to clear your input and switch targets
  - Costs 1 reset (you start with 1 free reset)
  - Earn 1 additional reset for every 100 points scored
- **Don't Miss**: If a ball reaches the bottom, you lose a life (starts with 3 lives)
- **Pause**: Press CTRL+P to pause/resume the game
- **Fullscreen**: Press CTRL+ENTER to toggle fullscreen mode

**Scoring:**

- **Top 10 Scores**: If your score makes the top 10, you'll be prompted to enter your initials (3 letters)
- **View Leaderboard**: Press H from the welcome screen to view high scores with initials, date, and difficulty

## Controls

### Welcome Screen

- **1, 2, 3, 4**: Select difficulty (Easy, Medium, Hard, Insanity)
- **Arrow Keys**: Cycle through difficulty levels (Up/Left = previous, Down/Right = next)
- **SPACE**: Start game with selected difficulty
- **H**: View high scores
- **CTRL+ENTER**: Toggle fullscreen

### During Gameplay

- **Letter Keys (A-Z)**: Type words on the basketballs
- **ENTER**: Fire at the target (must match the word exactly)
- **ESC**: Clear current input and switch targets (costs 1 reset)
- **CTRL+P**: Pause/Resume game
- **CTRL+ENTER**: Toggle fullscreen

### High Score Entry

- **Letter Keys (A-Z)**: Enter your initials (3 letters)
- **BACKSPACE**: Delete last letter
- **ENTER**: Submit initials (requires exactly 3 letters)

### High Score Screen

- **SPACE**: Return to main menu
- **ESC**: Return to main menu

## Game Configuration

The game includes four pre-configured difficulty levels in `src/config/gameConfig.ts`:

### Difficulty Presets

Each difficulty level has unique settings for:

- `maxSimultaneousBalls`: Maximum balls on screen at once
- `ballSpawnInterval`: Initial time between ball spawns (in milliseconds)
- `minSpawnInterval`: Minimum spawn interval as difficulty progresses
- `ballStartSpeed`: Initial falling speed
- `ballMaxSpeed`: Maximum falling speed cap
- `ballAcceleration`: Speed increase per difficulty tier

**Easy**: 2 balls max, 3000ms spawn, 40-100 speed range
**Medium**: 3 balls max, 2000ms spawn, 50-150 speed range
**Hard**: 4 balls max, 1500ms spawn, 70-200 speed range
**Insanity**: 8 balls max, 750ms spawn, 140-400 speed range

### General Settings

- `startingLives`: Number of lives (default: 3)
- `difficultyIncreaseInterval`: Time between difficulty increases (default: 30000ms)
- `pointsPerHit`: Score per successful hit (default: 10)

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

```md
src/
├── config/
│   └── gameConfig.ts         # Game configuration and difficulty presets
├── data/
│   └── words.json            # Word list for the game
├── scenes/
│   ├── WelcomeScene.ts       # Main menu with difficulty selection
│   ├── GameScene.ts          # Main gameplay
│   ├── InitialsInputScene.ts # Initials entry for top 10 scores
│   └── HighScoreScene.ts     # High scores leaderboard
├── utils/
│   └── SoundManager.ts       # 8-bit sound effect generator
├── main.ts                   # Phaser game initialization
└── style.css                 # Global styles
```
