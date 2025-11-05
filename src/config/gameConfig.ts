export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'insanity';

export interface DifficultySettings {
  maxSimultaneousBalls: number;
  ballSpawnInterval: number;
  minSpawnInterval: number;
  ballStartSpeed: number;
  ballMaxSpeed: number;
  ballAcceleration: number;
}

export const DIFFICULTY_PRESETS: Record<DifficultyLevel, DifficultySettings> = {
  easy: {
    maxSimultaneousBalls: 2,
    ballSpawnInterval: 3000,
    minSpawnInterval: 1500,
    ballStartSpeed: 40,
    ballMaxSpeed: 100,
    ballAcceleration: 5,
  },
  medium: {
    maxSimultaneousBalls: 3,
    ballSpawnInterval: 2000,
    minSpawnInterval: 800,
    ballStartSpeed: 50,
    ballMaxSpeed: 150,
    ballAcceleration: 10,
  },
  hard: {
    maxSimultaneousBalls: 4,
    ballSpawnInterval: 1500,
    minSpawnInterval: 500,
    ballStartSpeed: 70,
    ballMaxSpeed: 200,
    ballAcceleration: 15,
  },
  insanity: {
    maxSimultaneousBalls: 8,
    ballSpawnInterval: 750,
    minSpawnInterval: 250,
    ballStartSpeed: 140,
    ballMaxSpeed: 400,
    ballAcceleration: 30,
  }
};

export const GAME_CONFIG = {
  // Canvas size
  width: 800,
  height: 600,

  // Gameplay settings
  startingLives: 3,

  // Difficulty progression
  difficultyIncreaseInterval: 30000, // milliseconds between difficulty increases

  // Ball visual settings
  ballRadius: 40,
  ballColor: 0xff6600,
  ballTextStyle: {
    fontSize: '18px',
    fontFamily: 'Arial, sans-serif',
    color: '#ffffff',
    fontStyle: 'bold'
  },

  // Blaster settings
  blasterWidth: 60,
  blasterHeight: 40,
  blasterColor: 0x00ff00,
  blasterY: 550, // Y position from top

  // Shot settings
  shotSpeed: 400,
  shotRadius: 5,
  shotColor: 0xffff00,

  // Score settings
  pointsPerHit: 10,
  comboMultiplier: 1.5,
  misfirePenalty: 5,

  // UI settings
  fontSize: {
    title: '48px',
    menu: '24px',
    hud: '20px',
    small: '16px'
  },

  colors: {
    primary: '#00ff00',
    secondary: '#ff6600',
    danger: '#ff0000',
    text: '#ffffff',
    background: '#0a0a0a'
  }
};
