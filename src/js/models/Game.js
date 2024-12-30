import { MineField } from './MineField.js';
import { Timer } from '../utils/timer.js';
import { Statistics } from '../utils/statistics.js';

/**
 * 游戏难度配置
 */
const DIFFICULTY_SETTINGS = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 }
};

/**
 * 表情状态
 */
const FACES = {
    normal: '😊',
    worried: '😯',
    dead: '😵',
    win: '😎'
};

/**
 * 扫雷游戏主类
 */
export class Game {
    constructor() {
        this.minefield = null;
        this.timer = new Timer();
        this.statistics = new Statistics();
        
        // 获取DOM元素
        this.container = document.getElementById('minefield');
        this.minesLeftDisplay = document.getElementById('mines-left');
        this.statusDisplay = document.getElementById('game-status');
        this.faceButton = document.getElementById('face-button');
        this.difficulty = 'beginner';
        
        this.setupEventListeners();
        this.startNewGame();
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 难度选择
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.startNewGame();
        });

        // 新游戏按钮和表情按钮
        document.getElementById('new-game').addEventListener('click', () => this.startNewGame());
        this.faceButton.addEventListener('click', () => this.startNewGame());

        // 雷区事件
        this.container.addEventListener('mousedown', () => {
            if (!this.minefield.gameOver) {
                this.setFace('worried');
            }
        });

        this.container.addEventListener('mouseup', () => {
            if (!this.minefield.gameOver) {
                this.setFace('normal');
            }
        });

        this.container.addEventListener('mouseleave', () => {
            if (!this.minefield.gameOver) {
                this.setFace('normal');
            }
        });

        // 左键点击
        this.container.addEventListener('click', (e) => {
            const block = e.target.closest('.block');
            if (block) {
                const row = parseInt(block.dataset.row);
                const col = parseInt(block.dataset.col);
                this.handleClick(row, col);
            }
        });

        // 右键点击
        this.container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const block = e.target.closest('.block');
            if (block) {
                const row = parseInt(block.dataset.row);
                const col = parseInt(block.dataset.col);
                this.handleRightClick(row, col);
            }
        });

        // 双击快速打开
        this.container.addEventListener('dblclick', (e) => {
            const block = e.target.closest('.block');
            if (block) {
                const row = parseInt(block.dataset.row);
                const col = parseInt(block.dataset.col);
                this.handleDoubleClick(row, col);
            }
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case ' ':
                    // 空格键：新游戏
                    this.startNewGame();
                    break;
                case '1':
                    // 1键：初级难度
                    this.difficulty = 'beginner';
                    this.startNewGame();
                    break;
                case '2':
                    // 2键：中级难度
                    this.difficulty = 'intermediate';
                    this.startNewGame();
                    break;
                case '3':
                    // 3键：高级难度
                    this.difficulty = 'expert';
                    this.startNewGame();
                    break;
            }
        });
    }

    /**
     * 开始新游戏
     */
    startNewGame() {
        const settings = DIFFICULTY_SETTINGS[this.difficulty];
        this.minefield = new MineField(settings.rows, settings.cols, settings.mines);
        
        // 设置网格样式
        this.container.style.gridTemplateColumns = `repeat(${settings.cols}, 30px)`;
        
        // 清空容器
        this.container.innerHTML = '';
        
        // 添加方块元素
        for (let row = 0; row < settings.rows; row++) {
            for (let col = 0; col < settings.cols; col++) {
                this.container.appendChild(this.minefield.blocks[row][col].element);
            }
        }

        // 重置显示
        this.updateMinesLeft();
        this.statusDisplay.textContent = '';
        this.timer.reset();
        this.setFace('normal');
    }

    /**
     * 处理左键点击
     */
    handleClick(row, col) {
        if (this.minefield.gameOver) {
            return;
        }

        // 第一次点击时开始计时
        if (this.minefield.firstClick) {
            this.timer.start();
        }

        if (this.minefield.revealBlock(row, col)) {
            // 点到地雷，游戏结束
            this.gameOver(false);
        } else if (this.minefield.checkWin()) {
            // 获胜
            this.gameOver(true);
        }

        this.updateMinesLeft();
    }

    /**
     * 处理右键点击
     */
    handleRightClick(row, col) {
        if (this.minefield.gameOver) {
            return;
        }

        if (this.minefield.toggleFlag(row, col)) {
            this.updateMinesLeft();
        }
    }

    /**
     * 处理双击快速打开
     */
    handleDoubleClick(row, col) {
        if (this.minefield.gameOver) {
            return;
        }

        const block = this.minefield.blocks[row][col];
        if (!block.isRevealed || block.neighborMines === 0) {
            return;
        }

        // 计算周围标记的数量
        let flagCount = 0;
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                const newRow = row + r;
                const newCol = col + c;
                if (this.minefield.isValidPosition(newRow, newCol) && 
                    this.minefield.blocks[newRow][newCol].isFlagged) {
                    flagCount++;
                }
            }
        }

        // 如果标记数量等于数字，打开周围未标记的方块
        if (flagCount === block.neighborMines) {
            let hitMine = false;
            for (let r = -1; r <= 1; r++) {
                for (let c = -1; c <= 1; c++) {
                    const newRow = row + r;
                    const newCol = col + c;
                    if (this.minefield.isValidPosition(newRow, newCol)) {
                        const neighbor = this.minefield.blocks[newRow][newCol];
                        if (!neighbor.isFlagged && !neighbor.isRevealed) {
                            if (this.minefield.revealBlock(newRow, newCol)) {
                                hitMine = true;
                            }
                        }
                    }
                }
            }

            if (hitMine) {
                this.gameOver(false);
            } else if (this.minefield.checkWin()) {
                this.gameOver(true);
            }

            this.updateMinesLeft();
        }
    }

    /**
     * 更新剩余地雷显示
     */
    updateMinesLeft() {
        this.minesLeftDisplay.textContent = this.minefield.getRemainingMines();
    }

    /**
     * 设置表情
     */
    setFace(face) {
        this.faceButton.textContent = FACES[face];
    }

    /**
     * 游戏结束
     */
    gameOver(isWin) {
        this.timer.stop();
        this.minefield.gameOver = true;
        
        if (isWin) {
            this.setFace('win');
            this.statusDisplay.textContent = '恭喜你赢了！';
            const time = this.timer.getTime();
            const name = prompt(`恭喜你在 ${time} 秒内完成了游戏！\n请输入你的名字：`);
            if (name) {
                this.statistics.recordGame(this.difficulty, true, time, name);
            }
        } else {
            this.setFace('dead');
            this.statusDisplay.textContent = '游戏结束！';
            this.minefield.revealAllMines();
            this.statistics.recordGame(this.difficulty, false, this.timer.getTime());
        }
    }
} 