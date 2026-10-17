const colorNames = ['colorRed', 'colorBlue', 'colorYellow', 'colorPurple'].map((key) => FeatureI18n.translate(key));
const colorValues = ['#d9413a', '#2378c8', '#d49a08', '#8053bd'];
const prompt = document.getElementById('prompt');
const choices = document.getElementById('choices');
const scoreDisplay = document.getElementById('score');
const remainingDisplay = document.getElementById('remaining');
const status = document.getElementById('status');
let score = 0;
let remaining = 20;
let targetColor = 0;
let running = false;

function nextPrompt() {
    const word = Math.floor(Math.random() * colorNames.length);
    targetColor = Math.floor(Math.random() * colorValues.length);
    if (targetColor === word) targetColor = (targetColor + 1) % colorValues.length;
    prompt.textContent = colorNames[word];
    prompt.style.color = colorValues[targetColor];
}

function endGame() {
    running = false;
    prompt.textContent = FeatureI18n.translate('colorEnd');
    prompt.style.color = '#283652';
    status.textContent = FeatureI18n.translate('colorResult', { score });
    window.playGameSound('win');
    document.getElementById('start').textContent = FeatureI18n.translate('replay');
}

colorNames.forEach((name, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'color-choice';
    button.textContent = name;
    button.style.backgroundColor = colorValues[index];
    button.addEventListener('click', () => {
        if (!running) return;
        if (index === targetColor) {
            score++;
            status.textContent = FeatureI18n.translate('colorMatch');
            window.playGameSound('success');
        } else {
            status.textContent = FeatureI18n.translate('colorHint');
            window.playGameSound('miss');
        }
        scoreDisplay.textContent = score;
        remaining--;
        remainingDisplay.textContent = remaining;
        if (remaining === 0) endGame();
        else nextPrompt();
    });
    choices.appendChild(button);
});

document.getElementById('start').addEventListener('click', () => {
    score = 0;
    remaining = 20;
    running = true;
    scoreDisplay.textContent = score;
    remainingDisplay.textContent = remaining;
    status.textContent = FeatureI18n.translate('colorTarget');
    document.getElementById('start').textContent = FeatureI18n.translate('replay');
    window.playGameSound('start');
    nextPrompt();
});
