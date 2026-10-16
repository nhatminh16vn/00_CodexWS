        // Game elements
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        const scoreDisplay = document.getElementById('score-display');
        const startScreen = document.getElementById('start-screen');
        const gameOverScreen = document.getElementById('game-over');
        const finalScoreDisplay = document.getElementById('final-score');
        const startButton = document.getElementById('start-button');
        const restartButton = document.getElementById('restart-button');

        // Game variables
        let bird = {
            x: 200,
            y: 300,
            width: 40,
            height: 40,
            velocity: 19,
            gravity: 0.15,
            jumpForce: -4.5,
            color: '#f8d347'
        };

        let pipes = [];
        let score = 0;
        let gameRunning = false;
        let animationFrameId;
        let pipeGap = 150;
        let pipeWidth = 50;
        let pipeFrequency = 3000; // milliseconds
        let lastPipeTime = 0;
        let groundHeight = 50;
        let scrollSpeed = 2;

        // Background elements
        let background = {
            x: 0,
            width: canvas.width,
            height: canvas.height - groundHeight,
            color: '#70c5ce'
        };

        let ground = {
            x: 0,
            y: canvas.height - groundHeight,
            width: canvas.width,
            height: groundHeight,
            color: '#ddb347'
        };

        // Event listeners
        canvas.addEventListener('click', flap);
        document.addEventListener('keydown', function(e) {
            if (e.code === 'Space') {
                flap();
            }
        });
        startButton.addEventListener('click', startGame);
        restartButton.addEventListener('click', startGame);

        // Game functions
        function startGame() {
            // Reset game state
            bird.y = 300;
            bird.velocity = 0;
            pipes = [];
            scoreDisplay.textContent = '0';
            score = 0;
            lastPipeTime = 0;
            gameRunning = true;
            
            // Hide screens
            startScreen.style.display = 'none';
            gameOverScreen.style.display = 'none';
            
            // Setup canvas and start game loop
            setupCanvas();
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            gameLoop();
        }

        function gameLoop(timestamp) {
            if (!gameRunning) return;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Update game state
            updateBird();
            updatePipes(timestamp);
            updateGround();
            
            // Check collisions
            if (checkCollisions()) {
                gameOver();
                return;
            }
            
            // Draw everything
            drawBackground();
            drawPipes();
            drawBird();
            drawGround();
            drawScore();
            
            // Continue loop
            animationFrameId = requestAnimationFrame(gameLoop);
        }

        function updateBird() {
            // Apply gravity
            bird.velocity += bird.gravity;
            bird.y += bird.velocity;
            
            // Prevent bird from going above canvas
            if (bird.y < 0) {
                bird.y = 0;
                bird.velocity = 0;
            }
        }

        function updatePipes(timestamp) {
            // Add new pipes
            if (timestamp - lastPipeTime > pipeFrequency) {
                addPipe();
                lastPipeTime = timestamp;
            }
            
            // Move pipes and check if passed
            for (let i = pipes.length - 1; i >= 0; i--) {
                pipes[i].x -= scrollSpeed;
                
                // Check if bird passed the pipe
                if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
                    pipes[i].passed = true;
                    score++;
                    scoreDisplay.textContent = score;
                }
                
                // Remove pipes that are off screen
                if (pipes[i].x + pipeWidth < 0) {
                    pipes.splice(i, 1);
                }
            }
        }

        function updateGround() {
            ground.x -= scrollSpeed;
            if (ground.x <= -canvas.width) {
                ground.x = 0;
            }
        }

        function addPipe() {
            const minHeight = 50;
            const maxHeight = canvas.height - groundHeight - pipeGap - minHeight;
            const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
            
            pipes.push({
                x: canvas.width,
                topHeight: topHeight,
                bottomY: topHeight + pipeGap,
                width: pipeWidth,
                passed: false
            });
        }

        function checkCollisions() {
            // Check ground collision
            if (bird.y + bird.height > ground.y) {
                return true;
            }
            
            // Check pipe collisions
            for (let pipe of pipes) {
                if (
                    bird.x + bird.width > pipe.x && 
                    bird.x < pipe.x + pipe.width && 
                    (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY)
                ) {
                    return true;
                }
            }
            
            return false;
        }

        function gameOver() {
            gameRunning = false;
            finalScoreDisplay.textContent = score;
            gameOverScreen.style.display = 'block';
            cancelAnimationFrame(animationFrameId);
        }

        function flap() {
            if (!gameRunning && startScreen.style.display === 'none') {
                startGame();
            }
            bird.velocity = bird.jumpForce;
        }

        // Drawing functions
        function drawBackground() {
            ctx.fillStyle = background.color;
            ctx.fillRect(background.x, background.y, background.width, background.height);
        }

        function drawGround() {
            ctx.fillStyle = ground.color;
            
            // Draw two ground segments for seamless scrolling
            ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
            ctx.fillRect(ground.x + canvas.width, ground.y, ground.width, ground.height);
            
            // Add some ground details
            ctx.fillStyle = '#c9a227';
            ctx.fillRect(0, ground.y, canvas.width, 10);
        }

        function drawBird() {
            ctx.fillStyle = bird.color;
            
            // Draw bird body
            ctx.beginPath();
            ctx.ellipse(
                bird.x + bird.width / 2, 
                bird.y + bird.height / 2, 
                bird.width / 2, 
                bird.height / 2, 
                0, 0, Math.PI * 2
            );
            ctx.fill();
            
            // Draw bird eye
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(bird.x + bird.width - 10, bird.y + 10, 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(bird.x + bird.width - 10, bird.y + 10, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw bird beak
            ctx.fillStyle = '#ff8c00';
            ctx.beginPath();
            ctx.moveTo(bird.x + bird.width, bird.y + 15);
            ctx.lineTo(bird.x + bird.width + 10, bird.y + 15);
            ctx.lineTo(bird.x + bird.width, bird.y + 20);
            ctx.fill();
        }

        function drawPipes() {
            ctx.fillStyle = '#5cb85c';
            
            for (let pipe of pipes) {
                // Top pipe
                ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
                
                // Bottom pipe
                ctx.fillRect(
                    pipe.x, 
                    pipe.bottomY, 
                    pipe.width, 
                    canvas.height - groundHeight - pipe.bottomY
                );
                
                // Pipe edges
                ctx.fillStyle = '#4cae4c';
                ctx.fillRect(pipe.x - 3, 0, 3, pipe.topHeight);
                ctx.fillRect(pipe.x + pipe.width, 0, 3, pipe.topHeight);
                ctx.fillRect(pipe.x - 3, pipe.bottomY, 3, canvas.height - groundHeight - pipe.bottomY);
                ctx.fillRect(pipe.x + pipe.width, pipe.bottomY, 3, canvas.height - groundHeight - pipe.bottomY);
                ctx.fillStyle = '#5cb85c';
            }
        }

        function setupCanvas() {
            ctx.font = '80px Arial';
            ctx.textAlign = 'center';
        }

        function drawScore() {
            ctx.fillStyle = 'white';
            ctx.fillText(score, canvas.width / 2, 80);
        }

        // Initial draw
        drawBackground();
        drawGround();
        drawBird();