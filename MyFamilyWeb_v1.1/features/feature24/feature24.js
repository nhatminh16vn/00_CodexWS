const field = document.getElementById('bubble-field');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const status = document.getElementById('status');
let score = 0;
let timeLeft = 30;
let running = false;
let spawnTimer;
let clockTimer;
let motionTimer;

function createBubble() {
    if (!running || field.children.length >= 14) return;
    const bubble = document.createElement('button');
    const size = Math.floor(Math.random() * 28) + 42;
    bubble.type = 'button';
    bubble.className = 'bubble';
    bubble.style.setProperty('--bubble-size', `${size}px`);
    bubble.style.left = `${Math.random() * 82 + 4}%`;
    bubble.style.top = '82%';
    bubble.dataset.rise = String(Math.random() * 0.3 + 0.22);
    bubble.setAttribute('aria-label', 'Bong bóng, chạm để làm vỡ');
    bubble.textContent = 'POP';
    bubble.addEventListener('click', () => {
        if (!running) return;
        bubble.remove();
        score++;
        scoreDisplay.textContent = score;
        window.playGameSound('flip');
    });
    field.appendChild(bubble);
}

function endGame() {
    running = false;
    clearInterval(spawnTimer);
    clearInterval(clockTimer);
    clearInterval(motionTimer);
    field.replaceChildren();
    status.textContent = `Hết giờ! Bạn đã làm vỡ ${score} bong bóng.`;
    window.playGameSound('win');
    document.getElementById('start').textContent = 'Chơi lại';
}

document.getElementById('start').addEventListener('click', () => {
    clearInterval(spawnTimer);
    clearInterval(clockTimer);
    clearInterval(motionTimer);
    field.replaceChildren();
    score = 0;
    timeLeft = 30;
    running = true;
    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;
    status.textContent = 'Chạm bong bóng để ghi điểm!';
    document.getElementById('start').textContent = 'Chơi lại';
    window.playGameSound('start');
    createBubble();
    spawnTimer = setInterval(createBubble, 650);
    motionTimer = setInterval(() => {
        Array.from(field.children).forEach((bubble) => {
            const top = parseFloat(bubble.style.top);
            const nextTop = top - Number(bubble.dataset.rise);
            if (nextTop < -12) bubble.remove();
            else bubble.style.top = `${nextTop}%`;
        });
    }, 40);
    clockTimer = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        if (timeLeft <= 0) endGame();
    }, 1000);
});