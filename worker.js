// --- worker.js ---

let timerTimeout = null;
let targetTime = 0;
let nextPingTime = 0;
let currentState = 'idle'; // working, short_break, long_break, paused

// 智能计时器核心
function tick() {
    const now = Date.now();
    const remainingMilliseconds = targetTime - now;

    if (remainingMilliseconds <= 0) {
        self.postMessage({ type: 'tick', remainingSeconds: 0 }); // 发送最后一次0秒的报告
        self.postMessage({ type: 'state_end', state: currentState }); // 报告状态结束
        return;
    }
    
    const remainingSeconds = Math.ceil(remainingMilliseconds / 1000);
    self.postMessage({ type: 'tick', remainingSeconds: remainingSeconds });

    // 检查是否该触发随机提示
    if (currentState === 'working' && nextPingTime > 0 && now >= nextPingTime) {
        self.postMessage({ type: 'random_ping' });
        nextPingTime = 0; // 避免重复触发
    }

    const delay = remainingMilliseconds % 1000;
    timerTimeout = setTimeout(tick, delay > 0 ? delay : 1000);
}

// 监听主页面的指令
self.onmessage = function(e) {
    const { command, data } = e.data;

    switch (command) {
        case 'start':
            targetTime = data.targetTime;
            nextPingTime = data.nextPingTime;
            currentState = data.state;
            tick();
            break;

        case 'pause':
            clearTimeout(timerTimeout);
            break;
            
        case 'resume':
            targetTime = data.targetTime;
            nextPingTime = data.nextPingTime;
            currentState = data.state;
            tick();
            break;
            
        case 'update_ping':
            nextPingTime = data.nextPingTime;
            currentState = data.state;
            break;

        case 'stop':
            clearTimeout(timerTimeout);
            targetTime = 0;
            nextPingTime = 0;
            currentState = 'idle';
            break;
    }
};