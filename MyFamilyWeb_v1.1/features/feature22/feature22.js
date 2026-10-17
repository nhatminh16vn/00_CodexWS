const questionDisplay = document.getElementById('question');
const answerInput = document.getElementById('answer');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const status = document.getElementById('status');
let answer = 0;
let score = 0;
let timeLeft = 60;
let running = false;
let clockTimer;

function nextQuestion() {
    const first = Math.floor(Math.random() * 20) + 1;
    const second = Math.floor(Math.random() * 20) + 1;
    const useAddition = Math.random() < 0.5;
    const left = useAddition ? first : Math.max(first, second);
    const right = useAddition ? second : Math.min(first, second);
    const operator = useAddition ? '+' : '−';
    answer = useAddition ? left + right : left - right;
    questionDisplay.textContent = `${left} ${operator} ${right} = ?`;
    answerInput.value = '';
    answerInput.focus();
}

function finishGame() {
    running = false;
    clearInterval(clockTimer);
    questionDisplay.textContent = FeatureI18n.translate('gameOver');
    status.textContent = FeatureI18n.translate('mathResult', { n: score });
    window.playGameSound('win');
    document.getElementById('start').textContent = FeatureI18n.translate('replay');
}

document.getElementById('answer-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!running || answerInput.value === '') return;
    if (Number(answerInput.value) === answer) {
        score++;
        scoreDisplay.textContent = score;
        status.textContent = FeatureI18n.translate('mathCorrect');
        window.playGameSound('success');
    } else {
        status.textContent = FeatureI18n.translate('mathWrong');
        window.playGameSound('miss');
    }
    nextQuestion();
});

document.getElementById('start').addEventListener('click', () => {
    clearInterval(clockTimer);
    running = true;
    score = 0;
    timeLeft = 60;
    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;
    status.textContent = FeatureI18n.translate('mathGo');
    document.getElementById('start').textContent = FeatureI18n.translate('replay');
    window.playGameSound('start');
    nextQuestion();
    clockTimer = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        if (timeLeft <= 0) finishGame();
    }, 1000);
});
