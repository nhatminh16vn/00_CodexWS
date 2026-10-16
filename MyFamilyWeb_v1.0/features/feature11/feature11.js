const dataUrl = '../../data/JSON/hiragana-basic.json';
let hiragana = [];
let history = [];
let statistics = {};
let timerRunning = false;
let startTimestamp = 0;
let animationFrame = null;

function pad(value) {
    return String(value).padStart(2, '0');
}

function renderTimer() {
    if (!timerRunning) return;
    const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    document.getElementById('timer').textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    animationFrame = requestAnimationFrame(renderTimer);
}

function renderHistory() {
    const container = document.getElementById('historyContainer');
    container.innerHTML = '';
    history.forEach(item => {
        const entry = document.createElement('div');
        entry.className = 'history-item';
        entry.textContent = item.character;
        entry.title = item.romaji;
        const badge = document.createElement('span');
        badge.className = 'count-badge';
        badge.textContent = statistics[item.character];
        entry.appendChild(badge);
        container.appendChild(entry);
    });
}

function renderCharacterList() {
    const list = document.getElementById('hiraganaList');
    list.innerHTML = '';
    hiragana.forEach(item => {
        const entry = document.createElement('li');
        entry.textContent = `${item.character} — ${item.romaji}`;
        list.appendChild(entry);
    });
}

function generateNewCharacter() {
    if (!hiragana.length) return;
    const item = hiragana[Math.floor(Math.random() * hiragana.length)];
    document.getElementById('main-character').textContent = item.character;
    statistics[item.character] = (statistics[item.character] || 0) + 1;
    history.unshift(item);
    history = history.slice(0, 50);
    renderHistory();

    if (!timerRunning) {
        timerRunning = true;
        startTimestamp = Date.now();
        renderTimer();
    }
}

function resetAll() {
    timerRunning = false;
    cancelAnimationFrame(animationFrame);
    document.getElementById('timer').textContent = '00:00:00';
    document.getElementById('main-character').textContent = '?';
    history = [];
    statistics = {};
    renderHistory();
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(dataUrl);
        if (!response.ok) throw new Error(`Could not load Hiragana data (${response.status})`);
        hiragana = await response.json();
        renderCharacterList();
    } catch (error) {
        console.error(error);
        document.getElementById('main-character').textContent = '!';
    }
});
