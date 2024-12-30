import { Game } from './models/Game.js';

let game = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，初始化游戏');
    game = new Game();
}); 