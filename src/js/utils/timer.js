/**
 * 游戏计时器类
 */
export class Timer {
    constructor() {
        this.startTime = 0;
        this.interval = null;
        this.display = document.getElementById('time');
    }

    /**
     * 开始计时
     */
    start() {
        this.stop();
        this.startTime = Date.now();
        this.interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.display.textContent = elapsed;
        }, 1000);
    }

    /**
     * 停止计时
     */
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /**
     * 重置计时器
     */
    reset() {
        this.stop();
        this.display.textContent = '0';
    }

    /**
     * 获取当前时间（秒）
     * @returns {number}
     */
    getTime() {
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
} 