import { Game } from './models/Game.js';

// 创建一个全局游戏实例
let game = null;

// 当页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，初始化游戏');
    game = new Game();
}); 