 let num1, num2, operator, correctAnswer;
        let correctCount = 0;
        let incorrectCount = 0;
        let totalPoints = 0;
        let startTime;
        let timerInterval;
        let currentDifficulty = 1;
        let alreadyAnswered = false;
        let remainingAttempts = 3;
        
        // Các phần tử DOM
        const problemEl = document.getElementById('problem');
        const answerEl = document.getElementById('answer');
        const resultEl = document.getElementById('result');
        const correctEl = document.getElementById('correct');
        const incorrectEl = document.getElementById('incorrect');
        const pointsEl = document.getElementById('points');
        const attemptsEl = document.getElementById('remainingAttempts');
        const newProblemBtn = document.getElementById('newProblem');
        const timeEl = document.getElementById('time');
        
        // Bắt đầu đếm thời gian
        function startTimer() {
            startTime = new Date();
            timerInterval = setInterval(() => {
                const now = new Date();
                const elapsed = Math.floor((now - startTime) / 1000);
                timeEl.textContent = elapsed;
            }, 1000);
        }
        
        // Tạo bài toán mới
        function generateNewProblem() {
            operator = Math.random() < 0.5 ? '+' : '-';
            
            // Điều chỉnh độ khó dựa trên điểm số
            currentDifficulty = Math.min(Math.floor(totalPoints / 100) + 1, 5);
            const baseRange = 100 * currentDifficulty;
            
            if (operator === '+') {
                num1 = Math.floor(Math.random() * Math.min(baseRange, 800)) + 1;
                num2 = Math.floor(Math.random() * Math.min(baseRange, 1000 - num1)) + 1;
                correctAnswer = num1 + num2;
            } else {
                num1 = Math.floor(Math.random() * Math.min(baseRange, 900)) + 100;
                num2 = Math.floor(Math.random() * Math.min(baseRange, num1 - 1)) + 1;
                correctAnswer = num1 - num2;
            }
            
            problemEl.textContent = `${num1} ${operator} ${num2} = ?`;
            answerEl.value = '';
            answerEl.className = 'answer';
            answerEl.disabled = false;
            resultEl.textContent = '';
            answerEl.focus();
            alreadyAnswered = false;
            remainingAttempts = 3;
            attemptsEl.textContent = remainingAttempts;
            
            if (!timerInterval) {
                startTimer();
            }
        }
        
        // Kiểm tra đáp án
        function checkAnswer() {
            if (alreadyAnswered) return;
            
            const userAnswer = parseInt(answerEl.value);
            
            if (isNaN(userAnswer)) {
                resultEl.textContent = 'Vui lòng nhập số!';
                resultEl.className = 'result incorrect feedback';
                return;
            }
            
            remainingAttempts--;
            attemptsEl.textContent = remainingAttempts;
            
            if (userAnswer === correctAnswer) {
                const pointsEarned = currentDifficulty * 10;
                totalPoints += pointsEarned;
                
                resultEl.innerHTML = `<span class="correct">Chính xác! +${pointsEarned} điểm</span>`;
                resultEl.className = 'result correct feedback';
                correctCount++;
                correctEl.textContent = correctCount;
                pointsEl.textContent = totalPoints;
                
                alreadyAnswered = true;
                answerEl.className = 'answer answered';
                answerEl.disabled = true;
                
                // Tự động tạo bài toán mới
                setTimeout(generateNewProblem, 1500);
            } else {
                if (remainingAttempts <= 0) {
                    resultEl.innerHTML = `<span class="incorrect">Sai rồi! Đáp án đúng là: ${correctAnswer}</span><br>
                                        <span>Đã hết lượt thử, chuyển câu mới...</span>`;
                    resultEl.className = 'result incorrect feedback';
                    incorrectCount++;
                    incorrectEl.textContent = incorrectCount;
                    
                    alreadyAnswered = true;
                    answerEl.className = 'answer answered';
                    answerEl.disabled = true;
                    
                    // Tự động chuyển câu mới sau 2 giây
                    setTimeout(generateNewProblem, 2000);
                } else {
                    resultEl.innerHTML = `<span class="incorrect">Sai rồi! Thử lại nhé (còn ${remainingAttempts} lượt)</span>`;
                    resultEl.className = 'result incorrect feedback';
                    incorrectCount++;
                    incorrectEl.textContent = incorrectCount;
                    
                    answerEl.value = '';
                    answerEl.focus();
                }
            }
        }
        
        // Sự kiện click nút
        newProblemBtn.addEventListener('click', generateNewProblem);
        
        // Sự kiện nhấn Enter
        answerEl.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });
        
        // Tạo bài toán đầu tiên khi trang load
        generateNewProblem();