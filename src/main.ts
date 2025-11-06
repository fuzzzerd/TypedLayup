import Phaser from 'phaser';
import { WelcomeScene } from './scenes/WelcomeScene';
import { GameScene } from './scenes/GameScene';
import { InitialsInputScene } from './scenes/InitialsInputScene';
import { HighScoreScene } from './scenes/HighScoreScene';
import { UpdateScene } from './scenes/UpdateScene';
import { GAME_CONFIG } from './config/gameConfig';
import './style.css';
import { registerSW } from 'virtual:pwa-register';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  parent: 'game-container',
  backgroundColor: GAME_CONFIG.colors.background,
  scene: [WelcomeScene, GameScene, InitialsInputScene, HighScoreScene, UpdateScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height
  }
};

new Phaser.Game(config);

// Global state for update availability
(window as any).gameUpdateAvailable = false;
(window as any).gameUpdateCallback = null;

// Service Worker Update Detection
const updateSW = registerSW({
  onNeedRefresh() {
    // Store update availability flag instead of immediately showing the prompt
    (window as any).gameUpdateAvailable = true;
    (window as any).gameUpdateCallback = () => {
      updateSW(true);
    };
    console.log('Update available - will prompt on main menu');
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});
