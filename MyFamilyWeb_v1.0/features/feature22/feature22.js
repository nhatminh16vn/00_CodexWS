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
    questionDisplay.textContent = 'Hết giờ!';
    status.textContent = `Bạn trả lời đúng ${score} câu.`;
    window.playGameSound('win');
    document.getElementById('start').textContent = 'Chơi lại';
}

document.getElementById('answer-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!running || answerInput.value === '') return;
    if (Number(answerInput.value) === answer) {
        score++;
        scoreDisplay.textContent = score;
        status.textContent = 'Đúng rồi!';
        window.playGameSound('success');
    } else {
        status.textContent = 'Chưa đúng, thử câu tiếp theo nhé.';
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
    status.textContent = 'Tính nhanh nào!';
    document.getElementById('start').textContent = 'Chơi lại';
    window.playGameSound('start');
    nextQuestion();
    clockTimer = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        if (timeLeft <= 0) finishGame();
    }, 1000);
});