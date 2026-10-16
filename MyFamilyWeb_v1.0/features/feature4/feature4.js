// Game configuration
const config = {
    gridSize: 5,
    initialTime: 10,
    maxMistakes: 3,
    timeDecreasePerLevel: 2,
    baseScorePerCorrect: 10
};

// Game elements
const elements = {
    hiraganaBoard: document.getElementById('hiraganaBoard'),
    ball: document.getElementById('ball'),
    romajiDisplay: document.getElementById('romaji'),
    message: document.getElementById('message'),
    timeDisplay: document.getElementById('time'),
    scoreDisplay: document.getElementById('score'),
    mistakesDisplay: document.getElementById('mistakes'),
    progressBar: document.getElementById('progress'),
    gameOverScreen: document.getElementById('gameOver'),
    finalScoreDisplay: document.getElementById('finalScore'),
    finalLevelDisplay: document.getElementById('finalLevel'),
    restartButton: document.getElementById('restartButton')
};

// Game state
let state = {
    currentCharacter: null,
    score: 0,
    level: 1,
    timeLeft: config.initialTime,
    mistakes: 0,
    timer: null,
    gameActive: true,
    roundActive: true,
    cells: [],
    hiraganaData: []
};

// Initialize the game
async function initGame() {
    try {
        const response = await fetch('../../data/JSON/hiragana-basic.json');
        const data = await response.json();
        state.hiraganaData = data.filter(item => !item.character.startsWith('('));
        
        resetGameState();
        setupEventListeners();
        startNewRound();
    } catch (error) {
        console.error('Error loading hiragana data:', error);
        elements.message.textContent = 'Error loading game data. Please try again.';
    }
}

function resetGameState() {
    state.gameActive = true;
    state.roundActive = true;
    state.score = 0;
    state.level = 1;
    state.mistakes = 0;
    state.timeLeft = config.initialTime;
    clearInterval(state.timer);
    elements.gameOverScreen.style.display = 'none';
    updateDisplays();
}

function setupEventListeners() {
    elements.ball.addEventListener('dragstart', handleDragStart);
    elements.ball.addEventListener('dragend', () => {
        elements.ball.classList.remove('dragging');
    });
    elements.ball.addEventListener('touchstart', (e) => {
        if (!state.gameActive || !state.roundActive) return;
        elements.ball.classList.add('dragging');
    });
    elements.ball.addEventListener('touchend', () => {
        elements.ball.classList.remove('dragging');
    });
    elements.restartButton.addEventListener('click', () => {
        resetGameState();
        initGame();
    });
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());
}

function startNewRound() {
    state.roundActive = true;
    clearInterval(state.timer);
    updateDisplays();
    
    elements.hiraganaBoard.innerHTML = '';
    state.cells = [];
    
    const totalCells = config.gridSize * config.gridSize;
    const selectedCharacters = getRandomCharacters(totalCells);
    
    selectedCharacters.forEach(char => {
        const cell = document.createElement('div');
        cell.className = 'hiragana-cell';
        cell.textContent = char.character;
        cell.dataset.character = char.character;
        cell.dataset.romaji = char.romaji;
        
        cell.addEventListener('dragover', (e) => e.preventDefault());
        cell.addEventListener('drop', (e) => handleAnswer(e, cell));
        cell.addEventListener('click', () => handleAnswer(null, cell));
        
        elements.hiraganaBoard.appendChild(cell);
        state.cells.push(cell);
    });
    
    const randomIndex = Math.floor(Math.random() * totalCells);
    state.currentCharacter = selectedCharacters[randomIndex];
    elements.ball.textContent = state.currentCharacter.character;
    
    if (elements.romajiDisplay) {
        elements.romajiDisplay.textContent = state.currentCharacter.romaji;
    }
    
    state.timer = setInterval(updateTimer, 100);
    elements.message.textContent = `Find: ${state.currentCharacter.character}`;
    elements.message.style.color = '#ffffff';
}

function getRandomCharacters(count) {
    const shuffled = [...state.hiraganaData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function handleDragStart(e) {
    if (!state.gameActive || !state.roundActive) {
        e.preventDefault();
        return;
    }
    elements.ball.classList.add('dragging');
    e.dataTransfer.setData('text/plain', state.currentCharacter.character);
}

function handleAnswer(e, cell) {
    if (e) e.preventDefault();
    if (!state.gameActive || !state.roundActive) return;
    
    const selectedCharacter = cell.dataset.character;
    
    if (selectedCharacter === state.currentCharacter.character) {
        cell.classList.add('correct');
        state.score += config.baseScorePerCorrect * state.level;
        updateDisplays();
        
        const newLevel = Math.floor(state.score / 100) + 1;
        if (newLevel > state.level) {
            state.level = newLevel;
            state.timeLeft = Math.max(5, config.initialTime - (state.level * config.timeDecreasePerLevel));
            elements.message.textContent = `Level Up! Now level ${state.level}`;
        } else {
            elements.message.textContent = `Correct! +${config.baseScorePerCorrect * state.level} points`;
        }
        
        endRound(true);
    } else {
        cell.classList.add('wrong');
        state.mistakes++;
        updateDisplays();
        
        cell.style.pointerEvents = 'none';
        setTimeout(() => {
            cell.style.pointerEvents = 'auto';
            cell.classList.remove('wrong');
        }, 1000);
        
        state.timeLeft = Math.max(1, state.timeLeft - 2);
        
        if (state.mistakes >= config.maxMistakes) {
            endGame();
            return;
        }
        
        elements.message.textContent = 'Wrong! Try again';
    }
}

function updateTimer() {
    if (!state.gameActive || !state.roundActive) return;
    
    state.timeLeft -= 0.1;
    updateDisplays();
    
    const maxTime = config.initialTime - (state.level * config.timeDecreasePerLevel);
    const percentage = (state.timeLeft / maxTime) * 100;
    elements.progressBar.style.width = `${Math.max(0, percentage)}%`;
    
    if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.mistakes++;
        updateDisplays();
        
        if (state.mistakes >= config.maxMistakes) {
            endGame();
        } else {
            endRound(false);
        }
    }
}

function updateDisplays() {
    elements.timeDisplay.textContent = Math.max(0, Math.ceil(state.timeLeft));
    elements.scoreDisplay.textContent = state.score;
    elements.mistakesDisplay.textContent = `${state.mistakes}/${config.maxMistakes}`;
}

function endRound(success) {
    state.roundActive = false;
    clearInterval(state.timer);
    
    if (!success) {
        elements.message.textContent = `Time's up! ${config.maxMistakes - state.mistakes} mistakes left`;
        
        state.cells.forEach(cell => {
            if (cell.dataset.character === state.currentCharacter.character) {
                cell.classList.add('correct');
            }
        });
    }
    
    setTimeout(() => {
        if (state.gameActive) {
            state.timeLeft = Math.max(5, config.initialTime - (state.level * config.timeDecreasePerLevel));
            startNewRound();
        }
    }, success ? 1500 : 3000);
}

function endGame() {
    state.gameActive = false;
    state.roundActive = false;
    clearInterval(state.timer);
    
    elements.finalScoreDisplay.textContent = state.score;
    elements.finalLevelDisplay.textContent = state.level;
    elements.gameOverScreen.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', initGame);