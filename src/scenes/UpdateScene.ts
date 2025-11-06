import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

export class UpdateScene extends Phaser.Scene {
  private updateCallback?: () => void;
  private selectedOption: 'reload' | 'later' = 'reload';
  private reloadText?: Phaser.GameObjects.Text;
  private laterText?: Phaser.GameObjects.Text;
  private previousSceneKey?: string;

  constructor() {
    super({ key: 'UpdateScene' });
  }

  init(data: { updateCallback?: () => void; previousSceneKey?: string }) {
    this.updateCallback = data.updateCallback;
    this.previousSceneKey = data.previousSceneKey;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Semi-transparent background overlay
    this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);

    // Title with pulse animation
    const title = this.add.text(width / 2, height / 2 - 80, 'UPDATE AVAILABLE', {
      fontSize: GAME_CONFIG.fontSize.title,
      color: GAME_CONFIG.colors.primary,
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scale: { from: 1, to: 1.1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Description
    this.add.text(width / 2, height / 2 - 20, 'A new version is ready.', {
      fontSize: GAME_CONFIG.fontSize.menu,
      color: GAME_CONFIG.colors.text,
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 10, 'Reload to update?', {
      fontSize: GAME_CONFIG.fontSize.menu,
      color: GAME_CONFIG.colors.text,
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Options
    this.reloadText = this.add.text(width / 2, height / 2 + 60,
      '[R] RELOAD NOW', {
      fontSize: GAME_CONFIG.fontSize.menu,
      color: GAME_CONFIG.colors.text,
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.laterText = this.add.text(width / 2, height / 2 + 95,
      '[L] LATER', {
      fontSize: GAME_CONFIG.fontSize.menu,
      color: GAME_CONFIG.colors.text,
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Update highlight
    this.updateHighlight();

    // Instructions
    this.add.text(width / 2, height / 2 + 150, 'Press ENTER to confirm', {
      fontSize: GAME_CONFIG.fontSize.small,
      color: GAME_CONFIG.colors.text,
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Input handlers
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === 'r') {
        this.selectedOption = 'reload';
        this.updateHighlight();
      } else if (key === 'l') {
        this.selectedOption = 'later';
        this.updateHighlight();
      } else if (key === 'arrowup' || key === 'arrowleft') {
        this.selectedOption = this.selectedOption === 'later' ? 'reload' : 'later';
        this.updateHighlight();
      } else if (key === 'arrowdown' || key === 'arrowright') {
        this.selectedOption = this.selectedOption === 'reload' ? 'later' : 'reload';
        this.updateHighlight();
      }
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.selectedOption === 'reload') {
        // Call the update callback to reload the page
        if (this.updateCallback) {
          this.updateCallback();
        }
      } else {
        // Resume the previous scene
        this.dismissAndResume();
      }
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      // Dismiss and resume previous scene
      this.dismissAndResume();
    });
  }

  private dismissAndResume() {
    this.scene.stop();
    if (this.previousSceneKey) {
      this.scene.resume(this.previousSceneKey);
    } else {
      // Fallback to WelcomeScene if no previous scene was specified
      this.scene.start('WelcomeScene');
    }
  }

  private updateHighlight() {
    // Reset all to default
    this.reloadText?.setColor(GAME_CONFIG.colors.text);
    this.reloadText?.setScale(1);
    this.laterText?.setColor(GAME_CONFIG.colors.text);
    this.laterText?.setScale(1);

    // Highlight selected
    if (this.selectedOption === 'reload') {
      this.reloadText?.setColor(GAME_CONFIG.colors.secondary);
      this.reloadText?.setScale(1.2);
    } else {
      this.laterText?.setColor(GAME_CONFIG.colors.secondary);
      this.laterText?.setScale(1.2);
    }
  }
}
