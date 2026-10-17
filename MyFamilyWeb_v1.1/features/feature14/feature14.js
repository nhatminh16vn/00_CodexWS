// ======================
// GAME CONSTANTS
// ======================
const DIFFICULTY = {
  INITIAL_BALL_SPEED: 7,
  SPEED_INCREASE_PER_LEVEL: 1.25,
  BRICK_DURABILITY: 2,
  GRAVITY: 0,
  BOUNCE_DECAY: 1,
  TIME_LIMIT: 100, // 100 seconds
  TIME_DECREASE_PER_LEVEL: 5,
  BALL_GROWTH_PER_LEVEL: 0.5,
  RANDOM_TELEPORT_CHANCE: 0,
  SPEED_MULTIPLIER: 1.2,
  PADDLE_SHRINK_PER_SECOND: 0.75, // Paddle shrinks by 0.75 pixels per second
  TIMER_WARNING_THRESHOLD: 10, // 10 seconds
  COMBO_THRESHOLD: 2, // Combo starts at 2 hits
  COMBO_DECAY_TIME: 1200,
  POWER_UP_CHANCE: 0.2,
  POWER_UP_SPEED: 2, // Speed of power-ups falling
  SCREEN_SHAKE_DURATION: 350
};

// Power-up types
const POWER_UPS = {
  WIDEN_PADDLE: { color: '#0f0', symbol: 'W', duration: 10000 },
  EXTRA_LIFE: { color: '#f00', symbol: 'L', duration: 0 },
  SLOW_TIME: { color: '#0ff', symbol: 'S', duration: 8000 },
  MULTI_BALL: { color: '#ff0', symbol: 'M', duration: 10000 }
};

// ======================
// GAME STATE
// ======================
let gameRunning = false;
let score = 0;
let lives = 3;
let level = 1;
let timeLeft = DIFFICULTY.TIME_LIMIT;
let animationId;
let lastTime = 0;
let paddleControlReversed = false;
let timeUntilControlNormal = 0;
let lastSecondUpdate = 0;
let comboCount = 0;
let lastComboTime = 0;
let screenShakeEndTime = 0;
let activePowerUps = [];
let balls = []; // Array to hold multiple balls
let particles = [];
let gameOverShown = false;

// ======================
// DOM ELEMENTS
// ======================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameContainer = document.getElementById('gameContainer');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const timeElement = document.getElementById('time');
const timerWarning = document.getElementById('timerWarning');
const comboDisplay = document.getElementById('comboDisplay');
const comboCountElement = document.getElementById('comboCount');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const finalLevelElement = document.getElementById('finalLevel');
const restartButton = document.getElementById('restartButton');

// Audio elements
const brickHitSound = document.getElementById('brickHitSound');
const powerUpSound = document.getElementById('powerUpSound');
const lifeLostSound = document.getElementById('lifeLostSound');
const levelUpSound = document.getElementById('levelUpSound');

// ======================
// GAME OBJECT CLASSES
// ======================
class Paddle {
  constructor() {
    this.width = 80;
    this.height = 10;
    this.x = canvas.width / 2 - 40;
    this.y = canvas.height - 30;
    this.speed = 15;
    this.color = '#f00';
    this.originalWidth = 80;
  }

  draw() {
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, this.width, this.height, 5);
    ctx.fillStyle = paddleControlReversed ? '#0f0' : this.color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = paddleControlReversed ? '#0f0' : this.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  reset() {
    this.width = this.originalWidth;
    this.x = canvas.width / 2 - this.width / 2;
  }
}

class Ball {
  constructor(x, y, speedX, speedY) {
    this.radius = 6;
    this.x = x || canvas.width / 2;
    this.y = y || canvas.height / 2;
    this.speedX = speedX || DIFFICULTY.INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    this.speedY = speedY || -DIFFICULTY.INITIAL_BALL_SPEED;
    this.color = '#fff';
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += DIFFICULTY.GRAVITY;
  }
}

class Brick {
  constructor(x, y, durability, isSpecial, isReverse, isSpeedUp) {
    this.x = x;
    this.y = y;
    this.durability = durability;
    this.maxDurability = durability;
    this.color = `hsl(${Math.random() * 60}, 100%, 50%)`;
    this.isSpecial = isSpecial;
    this.isSpeedUp = isSpeedUp;
  }

  draw() {
    ctx.beginPath();
    ctx.roundRect(this.x, this.y, brickConfig.width, brickConfig.height, 2);

    if (this.isSpecial) {
      ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = ctx.fillStyle;
    } else if (this.isReverse) {
      ctx.fillStyle = '#0f0';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#0f0';
    } else if (this.isSpeedUp) {
      ctx.fillStyle = '#ff0';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff0';
    } else {
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 0;
    }

    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.durability.toString(), this.x + brickConfig.width / 2, this.y + brickConfig.height / 2 + 3);
  }
}

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 20;
    this.height = 20;
    this.speedY = DIFFICULTY.POWER_UP_SPEED;
    this.active = true;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
    ctx.fillStyle = this.type.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.type.color;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.type.symbol, this.x, this.y + 5);
  }

  update() {
    this.y += this.speedY;
    if (this.y > canvas.height) {
      this.active = false;
    }
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color || `hsl(${Math.random() * 360}, 100%, 50%)`;
    this.size = Math.random() * 5 + 2;
    this.speedX = Math.random() * 6 - 3;
    this.speedY = Math.random() * 6 - 3;
    this.life = 100;
    this.decay = Math.random() * 3 + 1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= this.decay;
  }

  draw() {
    ctx.globalAlpha = this.life / 100;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ======================
// GAME OBJECTS
// ======================
const paddle = new Paddle();
let bricks = [];
const brickConfig = {
  rows: 10,
  cols: 14,
  width: 50,
  height: 15,
  padding: 3,
  offsetTop: 40,
  offsetLeft: 15
};

// Initialize the first ball
balls.push(new Ball());

// ======================
// GAME FUNCTIONS
// ======================
function initBricks() {
  bricks = [];
  for (let c = 0; c < brickConfig.cols; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickConfig.rows; r++) {
      const durability = Math.floor(Math.random() * DIFFICULTY.BRICK_DURABILITY) + 1;
      const brickX = c * (brickConfig.width + brickConfig.padding) + brickConfig.offsetLeft;
      const brickY = r * (brickConfig.height + brickConfig.padding) + brickConfig.offsetTop;

      const isSpecial = Math.random() < 0.1;
      const isReverse = Math.random() < 0.05;
      const isSpeedUp = Math.random() < 0.05;

      bricks[c][r] = new Brick(
        brickX, brickY,
        durability,
        isSpecial,
        isReverse,
        isSpeedUp
      );
    }
  }
}

function createParticles(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color));
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();

    if (particles[i].life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function updatePowerUps() {
  for (let i = activePowerUps.length - 1; i >= 0; i--) {
    const powerUp = activePowerUps[i];

    // Update position
    powerUp.update();

    // Check collision with paddle
    if (
      powerUp.y + powerUp.height > paddle.y &&
      powerUp.y < paddle.y + paddle.height &&
      powerUp.x + powerUp.width > paddle.x &&
      powerUp.x < paddle.x + paddle.width
    ) {
      activatePowerUp(powerUp.type);
      powerUp.active = false;
      powerUpSound.currentTime = 0;
      powerUpSound.play();
    }

    // Draw if still active
    if (powerUp.active) {
      powerUp.draw();
    } else {
      activePowerUps.splice(i, 1);
    }
  }
}

function activatePowerUp(type) {
  switch (type.symbol) {
    case 'W': // Widen paddle
      paddle.width = paddle.originalWidth * 1.5;
      setTimeout(() => {
        paddle.width = paddle.originalWidth;
      }, type.duration);
      break;

    case 'L': // Extra life
      lives++;
      livesElement.textContent = lives;
      break;

    case 'S': // Slow time
      balls.forEach(ball => {
        ball.speedX *= 0.5;
        ball.speedY *= 0.5;
      });
      setTimeout(() => {
        balls.forEach(ball => {
          ball.speedX *= 2;
          ball.speedY *= 2;
        });
      }, type.duration);
      break;

    case 'M': // Multi-ball
      const newBalls = [];
      balls.forEach(ball => {
        for (let i = 0; i < 2; i++) {
          newBalls.push(new Ball(
            ball.x,
            ball.y,
            ball.speedX * (Math.random() > 0.5 ? 1 : -1),
            ball.speedY * (Math.random() > 0.5 ? 1 : -1)
          ));
        }
      });
      balls = balls.concat(newBalls);
      break;
  }
}

function dropPowerUp(x, y) {
  if (Math.random() < DIFFICULTY.POWER_UP_CHANCE) {
    const powerUpTypes = Object.values(POWER_UPS);
    const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    activePowerUps.push(new PowerUp(x, y, randomType));
  }
}

function updateCombo(timestamp) {
  if (timestamp - lastComboTime > DIFFICULTY.COMBO_DECAY_TIME) {
    if (comboCount > 1) {
      comboDisplay.style.opacity = '0';
    }
    comboCount = 0;
  } else {
    if (comboCount > 1) {
      comboDisplay.style.opacity = '1';
    }
  }
  comboCountElement.textContent = comboCount;
}

function screenShake(timestamp) {
  if (timestamp < screenShakeEndTime) {
    const intensity = (screenShakeEndTime - timestamp) / DIFFICULTY.SCREEN_SHAKE_DURATION;
    const shakeX = (Math.random() - 0.5) * 20 * intensity;
    const shakeY = (Math.random() - 0.5) * 20 * intensity;
    gameContainer.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
  } else {
    gameContainer.style.transform = 'translate(0, 0)';
  }
}

function checkCollisions() {
  let bricksRemaining = 0;

  for (let c = 0; c < brickConfig.cols; c++) {
    for (let r = 0; r < brickConfig.rows; r++) {
      const brick = bricks[c][r];
      if (brick.durability > 0) {
        bricksRemaining++;

        for (let i = 0; i < balls.length; i++) {
          const ball = balls[i];

          if (
            ball.x > brick.x &&
            ball.x < brick.x + brickConfig.width &&
            ball.y > brick.y &&
            ball.y < brick.y + brickConfig.height
          ) {
            // Hit brick
            brick.durability--;
            score += 10 * (brick.maxDurability - brick.durability);
            scoreElement.textContent = score;

            // Combo system
            comboCount++;
            lastComboTime = performance.now();
            if (comboCount > 1) {
              score += 5 * comboCount; // Bonus points for combos
              scoreElement.textContent = score;
            }

            // Create particles
            createParticles(
              brick.x + brickConfig.width / 2,
              brick.y + brickConfig.height / 2,
              10,
              brick.isSpecial ? null : brick.color
            );

            // Play sound
            brickHitSound.currentTime = 0;
            brickHitSound.play();

            // Special brick effects
            if (brick.isSpecial && brick.durability === 0) {
              if (Math.random() < 0.5) {
                paddleControlReversed = true;
                timeUntilControlNormal = 5;
              } else {
                lives++;
                livesElement.textContent = lives;
              }
            }

            if (brick.isReverse && brick.durability === 0) {
              paddleControlReversed = true;
              timeUntilControlNormal = 10;
            }

            if (brick.isSpeedUp && brick.durability === 0) {
              balls.forEach(b => {
                b.speedX *= DIFFICULTY.SPEED_MULTIPLIER;
                b.speedY *= DIFFICULTY.SPEED_MULTIPLIER;
              });
            }

            // Drop power-up when brick is destroyed
            if (brick.durability === 0) {
              dropPowerUp(brick.x + brickConfig.width / 2, brick.y + brickConfig.height / 2);
            }

            // Reverse ball direction
            const prevSpeedX = ball.speedX;
            const prevSpeedY = ball.speedY;

            // Determine hit side
            const ballLeft = ball.x - ball.radius;
            const ballRight = ball.x + ball.radius;
            const ballTop = ball.y - ball.radius;
            const ballBottom = ball.y + ball.radius;

            // Calculate overlap on each side
            const overlapLeft = ballRight - brick.x;
            const overlapRight = brick.x + brickConfig.width - ballLeft;
            const overlapTop = ballBottom - brick.y;
            const overlapBottom = brick.y + brickConfig.height - ballTop;

            // Find minimum overlap
            const minOverlap = Math.min(
              overlapLeft, overlapRight,
              overlapTop, overlapBottom
            );

            // Bounce based on which side was hit
            if (minOverlap === overlapLeft) {
              ball.speedX = -Math.abs(prevSpeedX) * DIFFICULTY.BOUNCE_DECAY;
            } else if (minOverlap === overlapRight) {
              ball.speedX = Math.abs(prevSpeedX) * DIFFICULTY.BOUNCE_DECAY;
            } else if (minOverlap === overlapTop) {
              ball.speedY = -Math.abs(prevSpeedY) * DIFFICULTY.BOUNCE_DECAY;
            } else {
              ball.speedY = Math.abs(prevSpeedY) * DIFFICULTY.BOUNCE_DECAY;
            }

            // Add gravity effect
            ball.speedY += DIFFICULTY.GRAVITY;

            // Randomize direction slightly
            ball.speedX += (Math.random() - 0.5) * 2;

            break; // Only one ball can hit a brick per frame
          }
        }
      }
    }
  }

  // Check level completion
  if (bricksRemaining === 0) {
    levelUp();
  }

  // Wall collisions for all balls
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];

    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
      ball.speedX = -ball.speedX * DIFFICULTY.BOUNCE_DECAY;
      ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x));
    }

    if (ball.y - ball.radius < 0) {
      ball.speedY = -ball.speedY * DIFFICULTY.BOUNCE_DECAY;
      ball.y = ball.radius;
    }

    // Paddle collision
    if (
      ball.y + ball.radius > paddle.y &&
      ball.y - ball.radius < paddle.y + paddle.height &&
      ball.x + ball.radius > paddle.x &&
      ball.x - ball.radius < paddle.x + paddle.width
    ) {
      // Calculate hit position (0 = left edge, 1 = right edge)
      const hitPos = (ball.x - paddle.x) / paddle.width;

      // Calculate new angle (-0.5 = left, 0 = center, 0.5 = right)
      const angle = (hitPos - 0.5) * Math.PI / 2;

      // Calculate speed
      const speed = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY) * 1.05;

      // Set new direction
      ball.speedX = Math.sin(angle) * speed;
      ball.speedY = -Math.abs(Math.cos(angle) * speed);

      // Add gravity effect
      ball.speedY += DIFFICULTY.GRAVITY;

      // Random teleport chance
      if (Math.random() < DIFFICULTY.RANDOM_TELEPORT_CHANCE) {
        ball.x = Math.random() * (canvas.width - 100) + 50;
        ball.y = Math.random() * (canvas.height / 2) + 50;
      }
    }

    // Bottom collision (missed paddle)
    if (ball.y + ball.radius > canvas.height) {
      balls.splice(i, 1);
      i--;

      if (balls.length === 0) {
        loseLife();
      }
    }
  }
}

function levelUp() {
  level++;
  levelElement.textContent = level;

  // Screen shake
  screenShakeEndTime = performance.now() + DIFFICULTY.SCREEN_SHAKE_DURATION;

  // Play sound
  levelUpSound.currentTime = 0;
  levelUpSound.play();

  // Increase difficulty
  const speedIncrease = DIFFICULTY.INITIAL_BALL_SPEED + (level * DIFFICULTY.SPEED_INCREASE_PER_LEVEL);
  balls.forEach(ball => {
    ball.speedX = speedIncrease * (ball.speedX > 0 ? 1 : -1);
    ball.speedY = -speedIncrease;
  });

  // Shrink paddle
  paddle.originalWidth = Math.max(30, 80 - (level * DIFFICULTY.PADDLE_SHRINK_PER_LEVEL));
  paddle.width = paddle.originalWidth;

  // Increase ball size
  balls.forEach(ball => {
    ball.radius = 6 + (level * DIFFICULTY.BALL_GROWTH_PER_LEVEL);
  });

  // Decrease time limit
  timeLeft = Math.max(10, DIFFICULTY.TIME_LIMIT - (level * DIFFICULTY.TIME_DECREASE_PER_LEVEL));
  timeElement.textContent = timeLeft;

  // Reset ball position (keep only one ball)
  balls = [new Ball()];

  // Create new bricks
  initBricks();
}

function loseLife() {
  lives--;
  livesElement.textContent = lives;

  // Screen shake
  screenShakeEndTime = performance.now() + DIFFICULTY.SCREEN_SHAKE_DURATION;

  // Play sound
  lifeLostSound.currentTime = 0;
  lifeLostSound.play();

  if (lives <= 0) {
    gameOver();
  } else {
    // Reset ball
    balls = [new Ball()];

    // Reset paddle position
    paddle.x = canvas.width / 2 - paddle.width / 2;

    // Penalize time
    timeLeft = Math.max(5, timeLeft - 5);
    timeElement.textContent = timeLeft;
  }
}

function gameOver() {
  gameRunning = false;
  cancelAnimationFrame(animationId);

  // Show dramatic game over screen
  finalScoreElement.textContent = `${FeatureI18n.translate('finalScore')} ${score}`;
  finalLevelElement.textContent = `${FeatureI18n.translate('levelReached')} ${level}`;
  gameOverScreen.style.display = 'flex';

  // Create explosion effect
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle(
      canvas.width / 2,
      canvas.height / 2,
      `hsl(${Math.random() * 60}, 100%, 50%)`
    ));
  }

  gameOverShown = true;
}

function movePaddle(e) {
  if (!gameRunning) return;

  const rect = canvas.getBoundingClientRect();
  let relativeX = (e.clientX - rect.left) * (canvas.width / rect.width);

  if (paddleControlReversed) {
    relativeX = canvas.width - relativeX;
  }

  paddle.x = relativeX - paddle.width / 2;

  // Keep paddle in bounds
  paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, paddle.x));
}

function updateTimer(timestamp) {
  if (!lastTime) {
    lastTime = timestamp;
    return;
  }

  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  // Only update time every second (1000ms)
  if (timestamp - lastSecondUpdate >= 1000) {
    lastSecondUpdate = timestamp;
    timeLeft--;
    timeElement.textContent = timeLeft;

    // Show warning when time is critical
    if (timeLeft <= DIFFICULTY.TIMER_WARNING_THRESHOLD) {
      timerWarning.style.opacity = '1';
      setTimeout(() => {
        timerWarning.style.opacity = '0';
      }, 500);
    }

    if (timeLeft <= 0) {
      gameOver();
      return;
    }

    // Update control reversal timer
    if (timeUntilControlNormal > 0) {
      timeUntilControlNormal--;
      if (timeUntilControlNormal === 0) {
        paddleControlReversed = false;
      }
    }
  }
}

// Main game loop
function gameLoop(timestamp) {
  if (!gameRunning) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update game state
  updateTimer(timestamp);
  updateCombo(timestamp);
  screenShake(timestamp);

  // Draw game objects
  bricks.forEach(col => col.forEach(brick => brick.durability > 0 && brick.draw()));
  paddle.draw();
  balls.forEach(ball => {
    ball.update();
    ball.draw();
  });

  // Update and draw particles
  updateParticles();

  // Update and draw power-ups
  updatePowerUps();

  // Check collisions
  checkCollisions();

  // Continue game loop
  animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
  // Reset game state
  gameRunning = true;
  score = 0;
  lives = 3;
  level = 1;
  timeLeft = DIFFICULTY.TIME_LIMIT;
  paddleControlReversed = false;
  timeUntilControlNormal = 0;
  lastTime = 0;
  lastSecondUpdate = 0;
  comboCount = 0;
  activePowerUps = [];
  particles = [];
  gameOverShown = false;

  // Reset UI
  scoreElement.textContent = '0';
  livesElement.textContent = '3';
  levelElement.textContent = '1';
  timeElement.textContent = timeLeft;
  comboDisplay.style.opacity = '0';

  // Reset game objects
  paddle.reset();
  balls = [new Ball()];

  // Initialize bricks
  initBricks();

  // Hide screens
  startScreen.style.display = 'none';
  gameOverScreen.style.display = 'none';

  // Start game loop
  lastTime = performance.now();
  lastSecondUpdate = lastTime;
  animationId = requestAnimationFrame(gameLoop);
}

// ======================
// EVENT LISTENERS
// ======================
canvas.addEventListener('pointerdown', movePaddle);
canvas.addEventListener('pointermove', movePaddle);
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Initialize game
initBricks();
