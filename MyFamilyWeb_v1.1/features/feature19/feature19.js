const board = document.getElementById('board');
const status = document.getElementById('status');
const modeSelect = document.getElementById('mode');
const difficultySelect = document.getElementById('difficulty');
const difficultySetting = document.getElementById('difficulty-setting');
const winningLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
let cells = Array(9).fill('');
let currentPlayer = 'X';
let gameOver = false;
let aiThinking = false;
let aiTimer;

function resetGame() {
    clearTimeout(aiTimer);
    cells = Array(9).fill('');
    currentPlayer = 'X';
    gameOver = false;
    aiThinking = false;
    status.textContent = 'Lượt của X';
    board.replaceChildren();
    cells.forEach((_, index) => {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'game-cell';
        cell.setAttribute('aria-label', `Ô ${index + 1}, trống`);
        cell.addEventListener('click', () => makeMove(index, cell));
        board.appendChild(cell);
    });
}

function makeMove(index, cell) {
    if (gameOver || aiThinking || cells[index]) return;
    applyMove(index, cell);
    if (gameOver) return;

    if (modeSelect.value === 'ai' && currentPlayer === 'O') {
        aiThinking = true;
        status.textContent = `Máy đang nghĩ (${difficultySelect.selectedOptions[0].text})…`;
        Array.from(board.children).forEach((button) => { button.disabled = true; });
        aiTimer = setTimeout(makeAIMove, 260);
        return;
    }
    status.textContent = `Lượt của ${currentPlayer}`;
}

function applyMove(index, cell) {
    cells[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.setAttribute('aria-label', `Ô ${index + 1}, ${currentPlayer}`);
    window.playGameSound('tap');

    if (winningLines.some((line) => line.every((position) => cells[position] === currentPlayer))) {
        gameOver = true;
        status.textContent = `Người chơi ${currentPlayer} chiến thắng!`;
        window.playGameSound('win');
        return;
    }
    if (cells.every(Boolean)) {
        gameOver = true;
        status.textContent = 'Hòa! Hai bạn chơi rất hay.';
        window.playGameSound('success');
        return;
    }
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

function getAvailableMoves(position = cells) {
    return position.map((value, index) => value ? -1 : index).filter((index) => index >= 0);
}

function winningMove(mark, position = cells) {
    for (const index of getAvailableMoves(position)) {
        position[index] = mark;
        const wins = winningLines.some((line) => line.every((cellIndex) => position[cellIndex] === mark));
        position[index] = '';
        if (wins) return index;
    }
    return -1;
}

function chooseAIMove() {
    const available = getAvailableMoves();
    if (difficultySelect.value === 'easy') {
        return available[Math.floor(Math.random() * available.length)];
    }

    const win = winningMove('O');
    if (win >= 0) return win;
    const block = winningMove('X');
    if (block >= 0) return block;

    if (difficultySelect.value === 'medium') {
        if (cells[4] === '' && Math.random() < 0.5) return 4;
        const corners = [0, 2, 6, 8].filter((index) => cells[index] === '');
        if (corners.length && Math.random() < 0.65) return corners[Math.floor(Math.random() * corners.length)];
        return available[Math.floor(Math.random() * available.length)];
    }

    let bestScore = -Infinity;
    let bestMove = available[0];
    for (const index of available) {
        cells[index] = 'O';
        const score = minimax(cells, false, 1);
        cells[index] = '';
        if (score > bestScore) {
            bestScore = score;
            bestMove = index;
        }
    }
    return bestMove;
}

function minimax(position, maximizing, depth) {
    if (winningLines.some((line) => line.every((index) => position[index] === 'O'))) return 10 - depth;
    if (winningLines.some((line) => line.every((index) => position[index] === 'X'))) return depth - 10;
    const available = getAvailableMoves(position);
    if (!available.length) return 0;

    let bestScore = maximizing ? -Infinity : Infinity;
    for (const index of available) {
        position[index] = maximizing ? 'O' : 'X';
        const score = minimax(position, !maximizing, depth + 1);
        position[index] = '';
        bestScore = maximizing ? Math.max(bestScore, score) : Math.min(bestScore, score);
    }
    return bestScore;
}

function makeAIMove() {
    if (gameOver) return;
    const index = chooseAIMove();
    if (index < 0) return;
    aiThinking = false;
    const cell = board.children[index];
    applyMove(index, cell);
    Array.from(board.children).forEach((button, buttonIndex) => {
        button.disabled = gameOver || cells[buttonIndex] !== '';
    });
    if (!gameOver) status.textContent = 'Lượt của bạn (X)';
}

document.getElementById('restart').addEventListener('click', resetGame);
modeSelect.addEventListener('change', () => {
    difficultySetting.hidden = modeSelect.value !== 'ai';
    resetGame();
});
difficultySelect.addEventListener('change', resetGame);
if (modeSelect.value !== 'ai') difficultySetting.hidden = true;
resetGame();