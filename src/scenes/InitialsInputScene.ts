import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import type { DifficultyLevel } from '../config/gameConfig';

export class InitialsInputScene extends Phaser.Scene {
  private initials: string = '';
  private initialsText!: Phaser.GameObjects.Text;
  private score!: number;
  private difficulty!: DifficultyLevel;

  constructor() {
    super({ key: 'InitialsInputScene' });
  }

  init(data: { score: number; difficulty: DifficultyLevel }) {
    this.score = data.score;
    this.difficulty = data.difficulty;
    this.initials = '';
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x0a0a0a).setOrigin(0);

    // Title
    this.add.text(width / 2, 150, 'NEW HIGH SCORE!', {
      fontSize: GAME_CONFIG.fontSize.title,
      color: GAME_CONFIG.colors.primary,
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Score
    this.add.text(width / 2, 220, `Score: ${this.score}`, {
      fontSize: GAME_CONFIG.fontSize.menu,
      color: GAME_CONFIG.colors.secondary,
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Prompt
    this.add.text(width / 2, 280, 'ENTER YOUR INITIALS:', {
      fontSize: GAME_CONFIG.fontSize.menu,
      color: GAME_CONFIG.colors.primary,
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Initials display
    this.initialsText = this.add.text(width / 2, 340, '___', {
      fontSize: '48px',
      color: GAME_CONFIG.colors.secondary,
      fontFamily: 'monospace',
      fontStyle: 'bold',
      backgroundColor: '#222222',
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5);

    // Add pulsing effect
    this.tweens.add({
      targets: this.initialsText,
      alpha: { from: 1, to: 0.6 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Instructions
    this.add.text(width / 2, 440, 'Type 3 letters, then press ENTER', {
      fontSize: GAME_CONFIG.fontSize.small,
      color: GAME_CONFIG.colors.text,
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(width / 2, 470, 'Press BACKSPACE to delete', {
      fontSize: GAME_CONFIG.fontSize.small,
      color: GAME_CONFIG.colors.text,
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Input handlers
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const key = event.key;

      // Letter input
      if (key.length === 1 && key.match(/[a-zA-Z]/)) {
        if (this.initials.length < 3) {
          this.initials += key.toUpperCase();
          this.updateDisplay();
        }
      }
      // Backspace
      else if (key === 'Backspace') {
        if (this.initials.length > 0) {
          this.initials = this.initials.slice(0, -1);
          this.updateDisplay();
        }
      }
      // Enter to confirm
      else if (key === 'Enter') {
        if (this.initials.length === 3) {
          this.saveAndContinue();
        } else {
          // Flash to indicate need 3 letters
          this.tweens.add({
            targets: this.initialsText,
            scale: { from: 1, to: 1.2 },
            duration: 100,
            yoyo: true,
            repeat: 2
          });
        }
      }
    });
  }

  private updateDisplay() {
    const displayText = this.initials.padEnd(3, '_');
    this.initialsText.setText(displayText);
  }

  private saveAndContinue() {
    // Save high score with initials
    const highScores = this.getHighScores();
    highScores.push({
      username: this.initials,
      score: this.score,
      date: new Date().toISOString(),
      difficulty: this.difficulty
    });
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(10); // Keep top 10

    localStorage.setItem('highScores', JSON.stringify(highScores));

    // Go to high score scene
    this.scene.start('HighScoreScene', { newScore: this.score });
  }

  private getHighScores(): Array<{ username: string; score: number; date: string; difficulty: DifficultyLevel }> {
    const stored = localStorage.getItem('highScores');
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored);
      // Handle legacy format (array of numbers)
      if (parsed.length > 0 && typeof parsed[0] === 'number') {
        return parsed.map((score: number) => ({
          username: 'AAA',
          score,
          date: new Date().toISOString(),
          difficulty: 'medium' as DifficultyLevel
        }));
      }
      // Handle entries without difficulty field
      return parsed.map((entry: any) => ({
        username: entry.username,
        score: entry.score,
        date: entry.date,
        difficulty: entry.difficulty || 'medium' as DifficultyLevel
      }));
    } catch {
      return [];
    }
  }
}
