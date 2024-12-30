/**
 * 游戏统计管理类
 */
export class Statistics {
    constructor() {
        this.stats = this.loadStats();
        this.initializeDialogs();
    }

    /**
     * 加载统计数据
     */
    loadStats() {
        const defaultStats = {
            beginner: { games: 0, wins: 0, bestTime: null },
            intermediate: { games: 0, wins: 0, bestTime: null },
            expert: { games: 0, wins: 0, bestTime: null }
        };
        
        const savedStats = localStorage.getItem('minesweeper_stats');
        return savedStats ? JSON.parse(savedStats) : defaultStats;
    }

    /**
     * 初始化对话框
     */
    initializeDialogs() {
        // 统计对话框
        this.statsDialog = document.getElementById('stats-dialog');
        document.getElementById('stats').addEventListener('click', () => this.showStats());
        document.getElementById('close-stats').addEventListener('click', () => this.statsDialog.close());

        // 排行榜对话框
        this.leaderboardDialog = document.getElementById('leaderboard-dialog');
        document.getElementById('leaderboard').addEventListener('click', () => this.showLeaderboard('beginner'));
        document.getElementById('close-leaderboard').addEventListener('click', () => this.leaderboardDialog.close());

        // 排行榜难度切换
        const tabs = document.querySelectorAll('.tab-button');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.showLeaderboard(e.target.dataset.difficulty);
            });
        });
    }

    /**
     * 记录游戏结果
     * @param {string} difficulty - 难度级别
     * @param {boolean} isWin - 是否获胜
     * @param {number} time - 完成时间（秒）
     * @param {string} playerName - 玩家名称
     */
    recordGame(difficulty, isWin, time, playerName) {
        // 更新统计
        this.stats[difficulty].games++;
        if (isWin) {
            this.stats[difficulty].wins++;
            if (!this.stats[difficulty].bestTime || time < this.stats[difficulty].bestTime) {
                this.stats[difficulty].bestTime = time;
            }
        }

        // 保存统计
        localStorage.setItem('minesweeper_stats', JSON.stringify(this.stats));

        // 如果获胜，更新排行榜
        if (isWin) {
            this.updateLeaderboard(difficulty, {
                name: playerName,
                time: time,
                date: new Date().toISOString()
            });
        }
    }

    /**
     * 更新排行榜
     * @param {string} difficulty - 难度级别
     * @param {Object} score - 分数记录
     */
    updateLeaderboard(difficulty, score) {
        const key = `minesweeper_leaderboard_${difficulty}`;
        const leaderboard = JSON.parse(localStorage.getItem(key) || '[]');
        
        leaderboard.push(score);
        leaderboard.sort((a, b) => a.time - b.time);
        leaderboard.splice(10); // 只保留前10名
        
        localStorage.setItem(key, JSON.stringify(leaderboard));
    }

    /**
     * 显示统计信息
     */
    showStats() {
        // 更新统计显示
        for (const [difficulty, data] of Object.entries(this.stats)) {
            document.getElementById(`${difficulty}-games`).textContent = data.games;
            document.getElementById(`${difficulty}-wins`).textContent = data.wins;
            document.getElementById(`${difficulty}-best`).textContent = 
                data.bestTime ? `${data.bestTime}秒` : '-';
        }
        
        this.statsDialog.showModal();
    }

    /**
     * 显示排行榜
     * @param {string} difficulty - 难度级别
     */
    showLeaderboard(difficulty) {
        const key = `minesweeper_leaderboard_${difficulty}`;
        const leaderboard = JSON.parse(localStorage.getItem(key) || '[]');
        const tbody = document.getElementById('leaderboard-body');
        
        tbody.innerHTML = '';
        leaderboard.forEach((score, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${score.name}</td>
                <td>${score.time}秒</td>
                <td>${new Date(score.date).toLocaleDateString()}</td>
            `;
            tbody.appendChild(row);
        });
        
        this.leaderboardDialog.showModal();
    }
} 