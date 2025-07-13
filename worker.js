// --- worker.js (全新架构版，单一职责) ---

let timerTimeout = null;

function tick(targetTime, state) {
    const now = Date.now();
    const remainingMilliseconds = targetTime - now;

    if (remainingMilliseconds <= 0) {
        self.postMessage({ type: 'tick', remainingSeconds: 0 });
        self.postMessage({ type: 'state_end', state: state });
        return;
    }

    self.postMessage({ type: 'tick', remainingSeconds: Math.ceil(remainingMilliseconds / 1000) });
    const delay = remainingMilliseconds % 1000;
    timerTimeout = setTimeout(() => tick(targetTime, state), delay > 0 ? delay : 1000);
}

self.onmessage = function(e) {
    const { command, data } = e.data;
    
    clearTimeout(timerTimeout); // 收到任何指令前，先清除旧的计时器

    if (command === 'start') {
        tick(data.targetTime, data.state);
    }
    // 'stop' 和 'pause' 只是简单地清除计时器，不再做任何其他事
};
