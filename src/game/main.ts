import { AUTO, Game, Scale, Types } from 'phaser';
import { MainGame } from './scenes/MainGame';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Types.Core.GameConfig = {
  type: AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#028af8',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 300 },
      debug: false,
    },
  },
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  scene: [MainGame],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
