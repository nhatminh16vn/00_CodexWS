const moleGrid = document.getElementById('mole-grid');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const status = document.getElementById('status');
let score = 0;
let timeLeft = 30;
let activeHole = -1;
let running = false;
let clockTimer;
let moleTimer;

function makeHoles() {
    moleGrid.replaceChildren();
    for (let index = 0; index < 9; index++) {
        const hole = document.createElement('button');
        hole.type = 'button';
        hole.className = 'mole-cell';
        hole.setAttribute('aria-label', FeatureI18n.translate('holeLabel', { n: index + 1 }));
        hole.addEventListener('click', () => hitHole(index));
        moleGrid.appendChild(hole);
    }
}

function showMole() {
    const holes = Array.from(moleGrid.children);
    if (activeHole >= 0) {
        holes[activeHole].classList.remove('is-active');
        holes[activeHole].textContent = '';
    }
    let nextHole = Math.floor(Math.random() * holes.length);
    if (holes.length > 1 && nextHole === activeHole) nextHole = (nextHole + 1) % holes.length;
    activeHole = nextHole;
    holes[activeHole].classList.add('is-active');
    holes[activeHole].textContent = '🐭';
}

function hitHole(index) {
    if (!running) return;
    if (index === activeHole) {
        const hole = moleGrid.children[index];
        hole.classList.remove('is-active');
        hole.textContent = '';
        activeHole = -1;
        score++;
        scoreDisplay.textContent = score;
        window.playGameSound('success');
        showMole();
    } else {
        window.playGameSound('miss');
    }
}

function endGame() {
    running = false;
    clearInterval(clockTimer);
    clearInterval(moleTimer);
    if (activeHole >= 0) moleGrid.children[activeHole].classList.remove('is-active');
    activeHole = -1;
    status.textContent = FeatureI18n.translate('moleResult', { n: score });
    window.playGameSound('win');
    document.getElementById('start').textContent = FeatureI18n.translate('replay');
}

function startGame() {
    clearInterval(clockTimer);
    clearInterval(moleTimer);
    running = true;
    score = 0;
    timeLeft = 30;
    activeHole = -1;
    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;
    status.textContent = FeatureI18n.translate('startMole');
    document.getElementById('start').textContent = FeatureI18n.translate('replay');
    Array.from(moleGrid.children).forEach((hole) => { hole.textContent = ''; hole.classList.remove('is-active'); });
    window.playGameSound('start');
    showMole();
    moleTimer = setInterval(showMole, 850);
    clockTimer = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        if (timeLeft <= 0) endGame();
    }, 1000);
}

makeHoles();
document.getElementById('start').addEventListener('click', startGame);
