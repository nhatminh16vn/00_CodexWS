        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const difficultyElement = document.getElementById('difficulty');
        const instructionsElement = document.getElementById('instructions');
        const tierSelectElement = document.getElementById('tier-select');
        const tierDescriptionElement = document.getElementById('tier-description');
        const gameTitleElement = document.getElementById('game-title');
        const gameMessageElement = document.getElementById('game-message');
        const startButtonElement = document.getElementById('start-button');
        
        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Game variables
        let gameRunning = false;
        let score = 0;
        let speed = 3;
        let selectedTier = 1;

        const obstacleProfiles = {
            veryEasy: { minRadius: 10, maxRadius: 16, speedMultiplier: 0.5, color: '#2ecc71' },
            easy: { minRadius: 14, maxRadius: 21, speedMultiplier: 0.72, color: '#55c7d9' },
            medium: { minRadius: 18, maxRadius: 27, speedMultiplier: 1, color: '#f1c40f' },
            hard: { minRadius: 19, maxRadius: 29, speedMultiplier: 1.3, color: '#e67e22' },
            expert: { minRadius: 15, maxRadius: 25, speedMultiplier: 1.65, color: '#e74c3c' }
        };

        const tierDefinitions = {
            1: { summary: '100% very easy', distribution: [['veryEasy', 1]] },
            2: { summary: '100% easy', distribution: [['easy', 1]] },
            3: { summary: '50% easy, 50% medium', distribution: [['easy', 0.5], ['medium', 0.5]] },
            4: { summary: '25% easy, 75% medium', distribution: [['easy', 0.25], ['medium', 0.75]] },
            5: { summary: '100% medium', distribution: [['medium', 1]] },
            6: { summary: '50% medium, 50% hard', distribution: [['medium', 0.5], ['hard', 0.5]] },
            7: { summary: '25% medium, 75% hard', distribution: [['medium', 0.25], ['hard', 0.75]] },
            8: { summary: '100% hard', distribution: [['hard', 1]] },
            9: { summary: '50% hard, 50% expert', distribution: [['hard', 0.5], ['expert', 0.5]] },
            10: { summary: '100% expert', distribution: [['expert', 1]] }
        };
        
        // Player ball
        const player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: 20,
            color: '#3498db',
            dx: 0,
            dy: 0,
            speed: 5
        };
        let pointerControlActive = false;
        let targetX = player.x;
        let targetY = player.y;
        
        // Obstacles
        let obstacles = [];
        
        // Keys
        const keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            w: false,
            a: false,
            s: false,
            d: false
        };
        
        // Event listeners
        window.addEventListener('keydown', (e) => {
            if (keys.hasOwnProperty(e.key)) {
                pointerControlActive = false;
                keys[e.key] = true;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (keys.hasOwnProperty(e.key)) {
                keys[e.key] = false;
            }
        });
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            targetX = Math.min(canvas.width - player.radius, Math.max(player.radius, targetX));
            targetY = Math.min(canvas.height - player.radius, Math.max(player.radius, targetY));
        });

        function updatePointerTarget(event) {
            const bounds = canvas.getBoundingClientRect();
            targetX = (event.clientX - bounds.left) * (canvas.width / bounds.width);
            targetY = (event.clientY - bounds.top) * (canvas.height / bounds.height);
            targetX = Math.max(player.radius, Math.min(canvas.width - player.radius, targetX));
            targetY = Math.max(player.radius, Math.min(canvas.height - player.radius, targetY));
            pointerControlActive = true;
        }

        canvas.addEventListener('pointerdown', updatePointerTarget);
        canvas.addEventListener('pointermove', updatePointerTarget);
        
        tierSelectElement.addEventListener('change', updateTierDescription);
        startButtonElement.addEventListener('click', startGame);
        function updateTierDescription() {
            const tier = Number(tierSelectElement.value);
            tierDescriptionElement.textContent = `Tier ${tier}: ${tierDefinitions[tier].summary} obstacles.`;
        }
        
        function startGame() {
            gameRunning = true;
            score = 0;
            speed = 3;
            selectedTier = Number(tierSelectElement.value);
            player.x = canvas.width / 2;
            player.y = canvas.height / 2;
            targetX = player.x;
            targetY = player.y;
            pointerControlActive = false;
            obstacles = [];
            instructionsElement.style.display = 'none';
            scoreElement.textContent = 'Score: 0';
            difficultyElement.textContent = `Tier ${selectedTier}: ${tierDefinitions[selectedTier].summary}`;
            animate();
        }
        
        function createObstacle() {
            const distribution = tierDefinitions[selectedTier].distribution;
            const roll = Math.random();
            let cumulativeProbability = 0;
            let profile = obstacleProfiles[distribution[distribution.length - 1][0]];

            for (const [profileName, probability] of distribution) {
                cumulativeProbability += probability;
                if (roll < cumulativeProbability) {
                    profile = obstacleProfiles[profileName];
                    break;
                }
            }

            const size = Math.random() * (profile.maxRadius - profile.minRadius) + profile.minRadius;
            let x, y;
            
            // Place obstacle outside canvas
            if (Math.random() < 0.5) {
                x = Math.random() < 0.5 ? -size : canvas.width + size;
                y = Math.random() * canvas.height;
            } else {
                x = Math.random() * canvas.width;
                y = Math.random() < 0.5 ? -size : canvas.height + size;
            }

            const targetX = canvas.width * (0.2 + Math.random() * 0.6);
            const targetY = canvas.height * (0.2 + Math.random() * 0.6);
            
            obstacles.push({
                x: x,
                y: y,
                radius: size,
                color: profile.color,
                dx: (targetX - x) / 100 * speed * profile.speedMultiplier,
                dy: (targetY - y) / 100 * speed * profile.speedMultiplier
            });
        }
        
        function updatePlayer() {
            player.dx = 0;
            player.dy = 0;

            if (pointerControlActive) {
                const dx = targetX - player.x;
                const dy = targetY - player.y;
                const distance = Math.hypot(dx, dy);
                if (distance > player.speed) {
                    player.dx = dx / distance * player.speed;
                    player.dy = dy / distance * player.speed;
                } else {
                    player.dx = dx;
                    player.dy = dy;
                }
            } else {
                if (keys.ArrowUp || keys.w) player.dy = -player.speed;
                if (keys.ArrowDown || keys.s) player.dy = player.speed;
                if (keys.ArrowLeft || keys.a) player.dx = -player.speed;
                if (keys.ArrowRight || keys.d) player.dx = player.speed;
            
                if (player.dx !== 0 && player.dy !== 0) {
                    player.dx *= 0.7071;
                    player.dy *= 0.7071;
                }
            }
            
            // Update position with bounds checking
            player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x + player.dx));
            player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y + player.dy));
        }
        
        function updateObstacles() {
            const spawnChance = 0.008 + selectedTier * 0.0012;

            if (Math.random() < spawnChance) {
                createObstacle();
            }
            
            // Update obstacle positions
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obs = obstacles[i];
                obs.x += obs.dx;
                obs.y += obs.dy;
                
                // Remove if out of bounds
                if (obs.x < -obs.radius * 2 || obs.x > canvas.width + obs.radius * 2 ||
                    obs.y < -obs.radius * 2 || obs.y > canvas.height + obs.radius * 2) {
                    obstacles.splice(i, 1);
                    score++;
                    scoreElement.textContent = `Score: ${score}`;
                    
                }
                
                // Check collision with player
                const dx = player.x - obs.x;
                const dy = player.y - obs.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < player.radius + obs.radius) {
                    gameOver();
                }
            }
        }
        
        function gameOver() {
            gameRunning = false;
            gameTitleElement.textContent = 'Game Over';
            gameMessageElement.textContent = `Your score: ${score}. Choose a tier and play again.`;
            startButtonElement.textContent = 'Play again';
            instructionsElement.style.display = 'block';
        }
        
        function draw() {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw player
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
            ctx.fillStyle = player.color;
            ctx.fill();
            ctx.closePath();
            
            // Draw obstacles
            obstacles.forEach(obs => {
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
                ctx.fillStyle = obs.color;
                ctx.fill();
                ctx.closePath();
            });
        }
        
        function animate() {
            if (!gameRunning) return;
            
            updatePlayer();
            updateObstacles();
            draw();
            
            requestAnimationFrame(animate);
        }