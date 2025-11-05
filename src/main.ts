import Phaser from 'phaser';
import { WelcomeScene } from './scenes/WelcomeScene';
import { GameScene } from './scenes/GameScene';
import { InitialsInputScene } from './scenes/InitialsInputScene';
import { HighScoreScene } from './scenes/HighScoreScene';
import { GAME_CONFIG } from './config/gameConfig';
import './style.css';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  parent: 'game-container',
  backgroundColor: GAME_CONFIG.colors.background,
  scene: [WelcomeScene, GameScene, InitialsInputScene, HighScoreScene],
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
