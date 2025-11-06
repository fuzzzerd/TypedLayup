import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import type { DifficultyLevel } from '../config/gameConfig';
import { version } from '../../package.json';

export class WelcomeScene extends Phaser.Scene {
  private selectedDifficulty: DifficultyLevel = 'medium';
  private difficultyTexts: Map<DifficultyLevel, Phaser.GameObjects.Text> = new Map();
  private updateIndicator?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'WelcomeScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(0, 0, width, height, 0x0a0a0a).setOrigin(0);

    // Title
    const title = this.add.text(width / 2, 100, 'TYPED LAYUP', {
      fontSize: GAME_CONFIG.fontSize.title,
      color: GAME_CONFIG.colors.primary,
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Add a pulsing effect to the title
    this.tweens.add({
      targets: title,
      scale: { from: 1, to: 1.1 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtitle
    this.add.text(width / 2, 160, 'Type to Destroy!', {
      fontSize: GAME_CONFIG.fontSize.menu,
      color: GAME_CONFIG.colors.secondary,
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Difficulty selection header
    this.add.text(width / 2, 220, 'SELECT DIFFICULTY:', {
      fontSize: GAME_CONFIG.fontSize.menu,
      color: GAME_CONFIG.colors.primary,
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Difficulty options
    const difficulties: Array<{level: DifficultyLevel, key: string, name: string}> = [
      { level: 'easy', key: '1', name: 'EASY' },
      { level: 'medium', key: '2', name: 'MEDIUM' },
      { level: 'hard', key: '3', name: 'HARD' },
      { level: 'insanity', key: '4', name: 'INSANITY' }
    ];

    difficulties.forEach((diff, index) => {
      const diffText = this.add.text(width / 2, 270 + (index * 35),
        `[${diff.key}] ${diff.name}`, {
        fontSize: GAME_CONFIG.fontSize.menu,
        color: GAME_CONFIG.colors.text,
        fontFamily: 'monospace'
      }).setOrigin(0.5);

      this.difficultyTexts.set(diff.level, diffText);
    });

    // Update highlight
    this.updateDifficultyHighlight();

    // Instructions
    const instructions = [
      '',
      'Press SPACE to Start',
      'Press H for High Scores',
      'CTRL+ENTER for Fullscreen'
    ];

    instructions.forEach((text, index) => {
      this.add.text(width / 2, 420 + (index * 25), text, {
        fontSize: GAME_CONFIG.fontSize.small,
        color: GAME_CONFIG.colors.text,
        fontFamily: 'monospace'
      }).setOrigin(0.5);
    });

    // Update indicator (shown when update is available)
    this.updateIndicator = this.add.text(width / 2, 520, 'Press U to Update Now', {
      fontSize: GAME_CONFIG.fontSize.small,
      color: GAME_CONFIG.colors.secondary,
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Add pulsing animation to update indicator
    this.tweens.add({
      targets: this.updateIndicator,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Check if update is available on creation
    this.updateIndicator.setVisible((window as any).gameUpdateAvailable === true);

    // Version
    this.add.text(width / 2, height - 30, `v${version}`, {
      fontSize: GAME_CONFIG.fontSize.small,
      color: '#666666',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Input handlers
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const key = event.key;

      // Difficulty selection with number keys
      if (key === '1') {
        this.selectedDifficulty = 'easy';
        this.updateDifficultyHighlight();
      } else if (key === '2') {
        this.selectedDifficulty = 'medium';
        this.updateDifficultyHighlight();
      } else if (key === '3') {
        this.selectedDifficulty = 'hard';
        this.updateDifficultyHighlight();
      } else if (key === '4') {
        this.selectedDifficulty = 'insanity';
        this.updateDifficultyHighlight();
      }

      // Difficulty selection with arrow keys
      else if (key === 'ArrowUp' || key === 'ArrowLeft') {
        this.cycleDifficulty(-1);
      } else if (key === 'ArrowDown' || key === 'ArrowRight') {
        this.cycleDifficulty(1);
      }
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.scene.start('GameScene', { difficulty: this.selectedDifficulty });
    });

    this.input.keyboard?.on('keydown-H', () => {
      this.scene.start('HighScoreScene');
    });

    this.input.keyboard?.on('keydown-U', () => {
      // Immediately trigger update if available
      if ((window as any).gameUpdateAvailable && (window as any).gameUpdateCallback) {
        (window as any).gameUpdateCallback();
      }
    });
  }

  private cycleDifficulty(direction: number) {
    const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'insanity'];
    const currentIndex = difficulties.indexOf(this.selectedDifficulty);
    let newIndex = currentIndex + direction;

    // Wrap around
    if (newIndex < 0) {
      newIndex = difficulties.length - 1;
    } else if (newIndex >= difficulties.length) {
      newIndex = 0;
    }

    this.selectedDifficulty = difficulties[newIndex];
    this.updateDifficultyHighlight();
  }

  update() {
    // Continuously check for update availability
    if (this.updateIndicator) {
      this.updateIndicator.setVisible((window as any).gameUpdateAvailable === true);
    }
  }

  private updateDifficultyHighlight() {
    // Reset all to white
    this.difficultyTexts.forEach((text) => {
      text.setColor(GAME_CONFIG.colors.text);
      text.setScale(1);
    });

    // Highlight selected
    const selectedText = this.difficultyTexts.get(this.selectedDifficulty);
    if (selectedText) {
      selectedText.setColor(GAME_CONFIG.colors.secondary);
      selectedText.setScale(1.2);
    }
  }
}
