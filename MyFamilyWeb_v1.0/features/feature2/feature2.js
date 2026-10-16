// ================ Game Initialization ================
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const finalScore = document.getElementById('finalScore');
const gameOverScreen = document.getElementById('gameOver');
let box = 20; // Kích thước ô vuông (sẽ được điều chỉnh)

// Game state variables
let snake = [];
let food = {};
let direction = null;
let nextDirection = null;
let score = 0;
let gameSpeed = 300;
let gameInterval;
let gameActive = true;
let touchStartX = 0;
let touchStartY = 0;

// ================ Mobile Support ================
function setupMobileControls() {
if (!('ontouchstart' in window)) return;
    
    const controlContainer = document.createElement('div');
    controlContainer.id = 'mobile-controls';
    controlContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        width: 100%;
        display: grid;
        grid-template-areas: 
            ". up ."
            "left . right"
            ". down .";
        gap: 10px;
        justify-content: center;
        z-index: 100;
    `;

const createButton = (text, area) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = `
        grid-area: ${area};
        width: 60px;
        height: 60px;
        border-radius: 50%;
        font-size: 24px;
        background: rgba(255,255,255,0.8);
        border: 2px solid #333;
        touch-action: manipulation;
    `;
    return btn;
};

// Create mobile control buttons using JS
const upBtn = createButton('↑', 'up');
const leftBtn = createButton('←', 'left');
const rightBtn = createButton('→', 'right');
const downBtn = createButton('↓', 'down');

controlContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: grid;
    grid-template-areas: 
        ". up ."
        "left . right"
        ". down .";
    gap: 10px;
    z-index: 100;
`;

    // Add touch/click events
    [upBtn, leftBtn, rightBtn, downBtn].forEach((btn, i) => {
        const directions = ['UP', 'LEFT', 'RIGHT', 'DOWN'];
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (gameActive) nextDirection = directions[i];
        });
        btn.addEventListener('click', () => {
            if (gameActive) nextDirection = directions[i];
        });
    });

    controlContainer.append(upBtn, leftBtn, rightBtn, downBtn);
    document.body.appendChild(controlContainer);

    // Add swipe gestures
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (!gameActive || !touchStartX || !touchStartY) return;
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0 && direction !== 'LEFT') nextDirection = 'RIGHT';
            else if (dx < 0 && direction !== 'RIGHT') nextDirection = 'LEFT';
        } else {
            if (dy > 0 && direction !== 'UP') nextDirection = 'DOWN';
            else if (dy < 0 && direction !== 'DOWN') nextDirection = 'UP';
        }
        
        touchStartX = 0;
        touchStartY = 0;
        e.preventDefault();
    }, { passive: false });
}

// ================ Core Game Functions ================
function generateFood() {
    let newFood;
    const maxPos = Math.floor(canvas.width / box);
    do {
        newFood = {
            x: Math.floor(Math.random() * maxPos) * box,
            y: Math.floor(Math.random() * maxPos) * box
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A';
        ctx.fillRect(segment.x, segment.y, box-1, box-1);
    });

    // Draw food
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(food.x + box/2, food.y + box/2, box/2 - 1, 0, Math.PI * 2);
    ctx.fill();
}

function showGameOver() {
    gameActive = false;
    finalScore.textContent = score;
    gameOverScreen.style.display = 'block';
}

function restartGame() {
    const startPos = Math.floor((canvas.width / box) / 2) * box;
    snake = [{x: startPos, y: startPos}];
    food = generateFood();
    direction = null;
    nextDirection = null;
    score = 0;
    scoreDisplay.textContent = '0';
    gameSpeed = 100;
    gameActive = true;
    gameOverScreen.style.display = 'none';
    
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

function gameLoop() {
    if (!gameActive) return;
    
    if (nextDirection) {
        direction = nextDirection;
        nextDirection = null;
    }
    
    if (!direction) {
        draw();
        return;
    }
    
    const head = {...snake[0]};
    if (direction === 'UP') head.y -= box;
    if (direction === 'DOWN') head.y += box;
    if (direction === 'LEFT') head.x -= box;
    if (direction === 'RIGHT') head.x += box;
    
    // Collision detection
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || 
        snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        clearInterval(gameInterval);
        showGameOver();
        return;
    }
    
    snake.unshift(head);
    
    // Eat food
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.textContent = score;
        food = generateFood();
        
        // Increase speed
        if (score % 3 === 0 && gameSpeed > 60) {
            gameSpeed -= 20;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    } else {
        snake.pop();
    }
    
    draw();
}

// ================ Event Listeners ================
document.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    if (e.key === 'ArrowUp' && direction !== 'DOWN') nextDirection = 'UP';
    if (e.key === 'ArrowDown' && direction !== 'UP') nextDirection = 'DOWN';
    if (e.key === 'ArrowLeft' && direction !== 'RIGHT') nextDirection = 'LEFT';
    if (e.key === 'ArrowRight' && direction !== 'LEFT') nextDirection = 'RIGHT';
});

// (Removed invalid HTML block. Mobile controls are created dynamically in setupMobileControls().)

// Hàm debounce để tránh resize liên tục
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// ================ Initialize Game ================
function initGame() {
    // Setup responsive canvas
function resizeCanvas() {
    const gameContainer = document.getElementById('game-container') || document.body;
    const containerWidth = gameContainer.clientWidth;
    const canvasSize = Math.min(containerWidth, 300);
    
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    box = Math.max(15, Math.floor(canvasSize / 25));
}
    
    // Thực hiện resize ngay lần đầu
    resizeCanvas();
    
    // Thêm event listener với debounce
    window.addEventListener('resize', debounce(resizeCanvas, 100));
    
    // Setup mobile controls if needed
    setupMobileControls();
    
    // Start game
    restartGame(); // Sử dụng hàm restart để khởi tạo game state
}

// Start the game when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}