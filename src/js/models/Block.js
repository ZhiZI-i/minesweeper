/**
 * 表示扫雷游戏中的一个方块
 */
export class Block {
    /**
     * @param {number} row - 方块所在行
     * @param {number} col - 方块所在列
     */
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.isMine = false;
        this.isRevealed = false;
        this.isFlagged = false;
        this.neighborMines = 0;
        this.element = this.createElement();
    }

    /**
     * 创建方块的DOM元素
     * @returns {HTMLElement}
     */
    createElement() {
        const element = document.createElement('div');
        element.className = 'block';
        element.dataset.row = this.row;
        element.dataset.col = this.col;
        return element;
    }

    /**
     * 更新方块的显示状态
     */
    updateDisplay() {
        this.element.className = 'block';
        
        if (this.isRevealed) {
            this.element.classList.add('revealed');
            if (this.isMine) {
                this.element.classList.add('mine');
                this.element.textContent = '💣';
            } else if (this.neighborMines > 0) {
                this.element.textContent = this.neighborMines;
                this.element.classList.add(`number-${this.neighborMines}`);
            } else {
                this.element.textContent = '';
            }
        } else if (this.isFlagged) {
            this.element.classList.add('flagged');
            this.element.textContent = '🚩';
        } else {
            this.element.textContent = '';
        }
    }

    /**
     * 揭示方块
     * @returns {boolean} 如果揭示的是地雷，返回true
     */
    reveal() {
        if (!this.isFlagged && !this.isRevealed) {
            this.isRevealed = true;
            this.updateDisplay();
            return this.isMine;
        }
        return false;
    }

    /**
     * 切换方块的标记状态
     * @returns {boolean} 标记状态是否改变
     */
    toggleFlag() {
        if (!this.isRevealed) {
            this.isFlagged = !this.isFlagged;
            this.updateDisplay();
            return true;
        }
        return false;
    }
} 