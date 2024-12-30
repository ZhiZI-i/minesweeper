import { Block } from './Block.js';

/**
 * 表示扫雷游戏的雷区
 */
export class MineField {
    /**
     * @param {number} rows - 行数
     * @param {number} cols - 列数
     * @param {number} mineCount - 地雷数量
     */
    constructor(rows, cols, mineCount) {
        this.rows = rows;
        this.cols = cols;
        this.mineCount = mineCount;
        this.blocks = [];
        this.firstClick = true;
        this.gameOver = false;
        this.flaggedCount = 0;
        this.revealedCount = 0;
        
        this.initializeField();
    }

    /**
     * 初始化雷区
     */
    initializeField() {
        // 创建方块
        for (let row = 0; row < this.rows; row++) {
            this.blocks[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.blocks[row][col] = new Block(row, col);
            }
        }
    }

    /**
     * 在首次点击后布置地雷
     * @param {number} firstRow - 首次点击的行
     * @param {number} firstCol - 首次点击的列
     */
    placeMines(firstRow, firstCol) {
        let minesPlaced = 0;
        while (minesPlaced < this.mineCount) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // 确保不在首次点击的位置及其周围放置地雷
            if (!this.blocks[row][col].isMine && 
                (Math.abs(row - firstRow) > 1 || Math.abs(col - firstCol) > 1)) {
                this.blocks[row][col].isMine = true;
                minesPlaced++;
            }
        }

        // 计算每个方块周围的地雷数
        this.calculateNeighborMines();
    }

    /**
     * 计算每个方块周围的地雷数
     */
    calculateNeighborMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.blocks[row][col].isMine) {
                    this.blocks[row][col].neighborMines = this.countNeighborMines(row, col);
                }
            }
        }
    }

    /**
     * 计算指定位置周围的地雷数
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {number} 周围地雷数
     */
    countNeighborMines(row, col) {
        let count = 0;
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                const newRow = row + r;
                const newCol = col + c;
                if (this.isValidPosition(newRow, newCol) && this.blocks[newRow][newCol].isMine) {
                    count++;
                }
            }
        }
        return count;
    }

    /**
     * 检查位置是否有效
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {boolean}
     */
    isValidPosition(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    /**
     * 揭示方块
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {boolean} 如果点击到地雷返回true
     */
    revealBlock(row, col) {
        if (!this.isValidPosition(row, col) || this.gameOver) {
            return false;
        }

        const block = this.blocks[row][col];
        
        if (block.isRevealed || block.isFlagged) {
            return false;
        }

        if (this.firstClick) {
            this.firstClick = false;
            this.placeMines(row, col);
        }

        if (block.reveal()) {
            this.gameOver = true;
            this.revealAllMines();
            return true;
        }

        this.revealedCount++;

        // 如果是空白方块，递归揭示周围方块
        if (block.neighborMines === 0) {
            this.revealNeighbors(row, col);
        }

        return false;
    }

    /**
     * 揭示指定位置周围的方块
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     */
    revealNeighbors(row, col) {
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                const newRow = row + r;
                const newCol = col + c;
                if (this.isValidPosition(newRow, newCol)) {
                    this.revealBlock(newRow, newCol);
                }
            }
        }
    }

    /**
     * 切换方块的标记状态
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {boolean} 标记状态是否改变
     */
    toggleFlag(row, col) {
        if (!this.isValidPosition(row, col) || this.gameOver) {
            return false;
        }

        const block = this.blocks[row][col];
        if (block.toggleFlag()) {
            this.flaggedCount += block.isFlagged ? 1 : -1;
            return true;
        }
        return false;
    }

    /**
     * 揭示所有地雷
     */
    revealAllMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const block = this.blocks[row][col];
                if (block.isMine) {
                    block.isRevealed = true;
                    block.updateDisplay();
                }
            }
        }
    }

    /**
     * 检查是否获胜
     * @returns {boolean}
     */
    checkWin() {
        return this.revealedCount === (this.rows * this.cols - this.mineCount);
    }

    /**
     * 获取剩余地雷数
     * @returns {number}
     */
    getRemainingMines() {
        return this.mineCount - this.flaggedCount;
    }
} 