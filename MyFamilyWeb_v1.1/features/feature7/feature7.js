        const target = document.getElementById('target');
        const clicksDisplay = document.getElementById('clicks');
        const timeDisplay = document.getElementById('time');
        const scoreDisplay = document.getElementById('score');
        const resetButton = document.getElementById('reset');
        
        let clicks = 0;
        let timeLeft = 10;
        let timer;
        let gameRunning = false;
        
        target.addEventListener('click', () => {
            if (!gameRunning) {
                startGame();
            } else {
                clicks++;
                clicksDisplay.textContent = clicks;
                scoreDisplay.textContent = clicks * 10;
                
                // Hiệu ứng thay đổi màu ngẫu nhiên
                const r = Math.floor(Math.random() * 256);
                const g = Math.floor(Math.random() * 256);
                const b = Math.floor(Math.random() * 256);
                target.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                
                // Di chuyển ngẫu nhiên một chút
                const x = Math.random() * 20 - 10;
                const y = Math.random() * 20 - 10;
                target.style.transform = `translate(${x}px, ${y}px)`;
                
                setTimeout(() => {
                    target.style.transform = 'translate(0, 0)';
                }, 100);
            }
        });
        
        resetButton.addEventListener('click', resetGame);
        
        function startGame() {
            gameRunning = true;
            clicks = 0;
            timeLeft = 10;
            clicksDisplay.textContent = clicks;
            timeDisplay.textContent = timeLeft;
            scoreDisplay.textContent = 0;
            target.textContent = "Bấm!";
            target.style.backgroundColor = "#e74c3c";
            
            timer = setInterval(() => {
                timeLeft--;
                timeDisplay.textContent = timeLeft;
                
                if (timeLeft <= 0) {
                    endGame();
                }
            }, 1000);
        }
        
        function endGame() {
            clearInterval(timer);
            gameRunning = false;
            target.textContent = "Kết thúc!";
            alert(`Trò chơi kết thúc! Bạn đã bấm ${clicks} lần. Điểm số: ${clicks * 10}`);
        }
        
        function resetGame() {
            clearInterval(timer);
            gameRunning = false;
            clicks = 0;
            timeLeft = 10;
            clicksDisplay.textContent = clicks;
            timeDisplay.textContent = timeLeft;
            scoreDisplay.textContent = 0;
            target.textContent = "Bắt Đầu";
            target.style.backgroundColor = "#e74c3c";
            target.style.transform = 'translate(0, 0)';
        }