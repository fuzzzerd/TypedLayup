import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import type { DifficultyLevel } from '../config/gameConfig';

interface HighScoreEntry {
  username: string;
  score: number;
  date: string;
  difficulty: DifficultyLevel;
}

export class HighScoreScene extends Phaser.Scene {
  private newScore?: number;

  constructor() {
    super({ key: 'HighScoreScene' });
  }

  init(data: { newScore?: number }) {
    this.newScore = data.newScore;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x0a0a0a).setOrigin(0);

    // Title
    this.add.text(width / 2, 60, 'HIGH SCORES', {
      fontSize: GAME_CONFIG.fontSize.title,
      color: GAME_CONFIG.colors.primary,
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Get high scores
    const highScores = this.getHighScores();

    // Display new score if present
    if (this.newScore !== undefined) {
      const rank = this.getScoreRank(this.newScore, highScores);
      let message = '';

      if (rank <= 10) {
        if (rank === 1) {
          message = `NEW HIGH SCORE: ${this.newScore}!`;
        } else {
          message = `Your Score: ${this.newScore} (Rank #${rank})`;
        }
      } else {
        message = `Your Score: ${this.newScore}`;
      }

      this.add.text(width / 2, 130, message, {
        fontSize: GAME_CONFIG.fontSize.menu,
        color: GAME_CONFIG.colors.secondary,
        fontFamily: 'monospace'
      }).setOrigin(0.5);
    }

    // Display top 10 scores
    const startY = this.newScore !== undefined ? 180 : 140;

    if (highScores.length === 0) {
      this.add.text(width / 2, startY + 50, 'No scores yet!', {
        fontSize: GAME_CONFIG.fontSize.menu,
        color: GAME_CONFIG.colors.text,
        fontFamily: 'monospace'
      }).setOrigin(0.5);
    } else {
      highScores.forEach((entry, index) => {
        const isNewScore = entry.score === this.newScore && index === this.getScoreRank(this.newScore!, highScores) - 1;
        const color = isNewScore ? GAME_CONFIG.colors.secondary : GAME_CONFIG.colors.text;

        const rankText = `${(index + 1).toString().padStart(2, ' ')}.`;
        const nameText = entry.username.padEnd(3, ' ');
        const scoreText = entry.score.toString().padStart(6, ' ');
        const date = new Date(entry.date);
        const dateText = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().slice(2)}`;

        // Format difficulty as single letter: E, M, H, I
        const difficultyLetter = entry.difficulty.charAt(0).toUpperCase();

        const text = this.add.text(
          width / 2,
          startY + (index * 30),
          `${rankText} ${nameText}  ${scoreText}  ${dateText} ${difficultyLetter}`,
          {
            fontSize: GAME_CONFIG.fontSize.small,
            color: color,
            fontFamily: 'monospace'
          }
        ).setOrigin(0.5);

        // Pulse animation for new score
        if (isNewScore) {
          this.tweens.add({
            targets: text,
            alpha: { from: 1, to: 0.5 },
            duration: 500,
            yoyo: true,
            repeat: -1
          });
        }
      });
    }

    // Instructions
    const instructionsY = Math.max(startY + (highScores.length * 30) + 50, height - 120);

    this.add.text(width / 2, instructionsY, 'Press SPACE for Main Menu', {
      fontSize: GAME_CONFIG.fontSize.menu,
      color: GAME_CONFIG.colors.primary,
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Input handlers
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.scene.start('WelcomeScene');
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('WelcomeScene');
    });
  }

  private getHighScores(): HighScoreEntry[] {
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

  private getScoreRank(score: number, highScores: HighScoreEntry[]): number {
    const scores = highScores.map(entry => entry.score);
    const allScores = [...scores, score].sort((a, b) => b - a);
    return allScores.indexOf(score) + 1;
  }
}
