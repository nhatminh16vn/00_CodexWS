// Khởi tạo canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Cấu hình game
const config = {
    botCount: 455,
    initialBallSize: 20,
    sizePerBot: 0.5,
    minBotSize: 5,
    maxBotSize: 15,
    minBotSpeed: 1,
    maxBotSpeed: 3
};

// Bóng của người chơi (giờ là hình vuông)
const square = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: config.initialBallSize * 2, // size là chiều dài cạnh
    color: '#FF0000',
    score: 0
};

// Tạo 455 bot (vẫn giữ hình tròn)
const bots = [];
for (let i = 0; i < config.botCount; i++) {
    bots.push(createBot());
}

function createBot() {
    const size = config.minBotSize + Math.random() * (config.maxBotSize - config.minBotSize);
    return {
        x: Math.random() * (canvas.width - size * 2) + size,
        y: Math.random() * (canvas.height - size * 2) + size,
        radius: size,
        dx: (Math.random() - 0.5) * (config.minBotSpeed + Math.random() * (config.maxBotSpeed - config.minBotSpeed)),
        dy: (Math.random() - 0.5) * (config.minBotSpeed + Math.random() * (config.maxBotSpeed - config.minBotSpeed)),
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };
}

// Theo dõi vị trí chuột/chạm
let targetX = square.x;
let targetY = square.y;

canvas.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    targetX = e.touches[0].clientX;
    targetY = e.touches[0].clientY;
}, { passive: false });

// Vẽ hình vuông thay vì bóng
function drawSquare() {
    ctx.beginPath();
    ctx.rect(square.x - square.size / 2, square.y - square.size / 2, square.size, square.size);

    // Gradient cho hình vuông
    const gradient = ctx.createLinearGradient(
        square.x - square.size / 2, square.y - square.size / 2,
        square.x + square.size / 2, square.y + square.size / 2
    );
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(0.5, square.color);
    gradient.addColorStop(1, 'darkred');

    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();
}

// Vẽ bot (giữ nguyên hình tròn)
function drawBot(bot) {
    ctx.beginPath();
    ctx.arc(bot.x, bot.y, bot.radius, 0, Math.PI * 2);
    ctx.fillStyle = bot.color;
    ctx.fill();
    ctx.closePath();
}

// Kiểm tra va chạm giữa hình vuông và hình tròn
function checkCollision(squareX, squareY, squareSize, circleX, circleY, circleRadius) {
    // Tìm điểm gần nhất trên hình vuông so với hình tròn
    const closestX = Math.max(squareX - squareSize / 2, Math.min(circleX, squareX + squareSize / 2));
    const closestY = Math.max(squareY - squareSize / 2, Math.min(circleY, squareY + squareSize / 2));

    // Tính khoảng cách từ điểm đó đến tâm hình tròn
    const distanceX = circleX - closestX;
    const distanceY = circleY - closestY;

    return (distanceX * distanceX + distanceY * distanceY) < (circleRadius * circleRadius);
}

// Di chuyển hình vuông theo chuột
function moveSquare() {
    const dx = targetX - square.x;
    const dy = targetY - square.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Tốc độ di chuyển phụ thuộc vào kích thước
    const speed = Math.max(5 - square.size / 40, 1);

    if (distance > 5) {
        square.x += dx / distance * speed;
        square.y += dy / distance * speed;
    }

    // Giới hạn trong màn hình
    const halfSize = square.size / 2;
    square.x = Math.max(halfSize, Math.min(canvas.width - halfSize, square.x));
    square.y = Math.max(halfSize, Math.min(canvas.height - halfSize, square.y));
}

// Di chuyển bot
function moveBots() {
    bots.forEach(bot => {
        // Di chuyển bot
        bot.x += bot.dx;
        bot.y += bot.dy;

        // Đổi hướng khi chạm biên
        if (bot.x < bot.radius || bot.x > canvas.width - bot.radius) {
            bot.dx = -bot.dx;
            bot.x = Math.max(bot.radius, Math.min(canvas.width - bot.radius, bot.x));
        }
        if (bot.y < bot.radius || bot.y > canvas.height - bot.radius) {
            bot.dy = -bot.dy;
            bot.y = Math.max(bot.radius, Math.min(canvas.height - bot.radius, bot.y));
        }

        // Tránh hình vuông của người chơi
        const distX = square.x - bot.x;
        const distY = square.y - bot.y;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < square.size) {
            const angle = Math.atan2(distY, distX);
            bot.dx = -Math.cos(angle) * bot.dx;
            bot.dy = -Math.sin(angle) * bot.dy;
        }
    });
}

// Kiểm tra ăn bot
function checkEatBots() {
    for (let i = bots.length - 1; i >= 0; i--) {
        const bot = bots[i];
        if (checkCollision(square.x, square.y, square.size, bot.x, bot.y, bot.radius)) {
            // Chỉ ăn được bot nhỏ hơn (so sánh đường chéo hình vuông với đường kính hình tròn)
            if (bot.radius * 2 < square.size * Math.sqrt(2)) {
                // Tăng kích thước hình vuông
                square.size += config.sizePerBot * 2;
                square.score++;

                // Xóa bot
                bots.splice(i, 1);

                // Cập nhật UI
                document.getElementById('botCount').textContent = bots.length;
                document.getElementById('size').textContent = Math.floor(square.size / 2);
            }
        }
    }

    // Kiểm tra chiến thắng
    if (bots.length === 0) {
        document.getElementById('gameOver').style.display = 'block';
    }
}

// Game loop
function gameLoop() {
    // Xóa màn hình
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Di chuyển
    moveSquare();
    moveBots();

    // Kiểm tra va chạm
    checkEatBots();

    // Vẽ
    bots.forEach(drawBot);
    drawSquare();

    // Lặp lại
    requestAnimationFrame(gameLoop);
}

// Xử lý thay đổi kích thước màn hình
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Bắt đầu game
gameLoop();
document.getElementById('botCount').textContent = bots.length;
document.getElementById('size').textContent = Math.floor(square.size / 2);