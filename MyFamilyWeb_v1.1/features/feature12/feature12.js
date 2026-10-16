        // Game data with categories
        const gameData = {
            science: [
                { statement: "A human could swim through the blood vessels of a blue whale.", answer: "fact", explanation: "A blue whale's aorta is so large that a small human could theoretically swim through it." },
                { statement: "The smell of rain is called petrichor.", answer: "fact", explanation: "Petrichor is the earthy scent produced when rain falls on dry soil." },
                { statement: "Humans only use 10% of their brains.", answer: "fiction", explanation: "This is a myth - brain scans show activity throughout the entire brain." },
                { statement: "Lightning never strikes the same place twice.", answer: "fiction", explanation: "Lightning often strikes tall structures repeatedly." },
                { statement: "Bananas are berries, but strawberries aren't.", answer: "fact", explanation: "Botanically, bananas qualify as berries while strawberries don't meet the criteria." }
            ],
            history: [
                { statement: "The Great Wall of China is visible from space.", answer: "fiction", explanation: "It's not visible to the naked eye from space despite the common myth." },
                { statement: "Napoleon Bonaparte was unusually short.", answer: "fiction", explanation: "At 5'7\", he was actually average height for his time." },
                { statement: "The Titanic was advertised as 'unsinkable'.", answer: "fiction", explanation: "While considered very safe, it was never officially called unsinkable." },
                { statement: "Ancient Romans used urine as mouthwash.", answer: "fact", explanation: "The ammonia in urine acted as a cleaning agent." },
                { statement: "The Hundred Years' War lasted exactly 100 years.", answer: "fiction", explanation: "It actually lasted 116 years (1337-1453)." }
            ],
            nature: [
                { statement: "A group of crows is called a murder.", answer: "fact", explanation: "This poetic term dates back to 15th century English folklore." },
                { statement: "Bulls are angered by the color red.", answer: "fiction", explanation: "Bulls are colorblind to red - they react to movement." },
                { statement: "Polar bears have black skin under their fur.", answer: "fact", explanation: "The black skin helps absorb heat from sunlight." },
                { statement: "Camels store water in their humps.", answer: "fiction", explanation: "They store fat in humps; water is stored throughout their bodies." },
                { statement: "Octopuses have three hearts.", answer: "fact", explanation: "Two pump blood to the gills, one to the rest of the body." }
            ],
            tech: [
                { statement: "The first computer programmer was a woman.", answer: "fact", explanation: "Ada Lovelace wrote algorithms for Charles Babbage's Analytical Engine." },
                { statement: "The 'Q' in QWERTY stands for 'Quick'.", answer: "fiction", explanation: "It's just the name of the keyboard layout's first letters." },
                { statement: "The first website is still online.", answer: "fact", explanation: "Tim Berners-Lee's 1991 website at info.cern.ch is still accessible." },
                { statement: "Smartphones have more computing power than NASA had for the moon landing.", answer: "fact", explanation: "Modern phones are millions of times more powerful." },
                { statement: "The inventor of WiFi was inspired by chocolate.", answer: "fact", explanation: "The idea for frequency hopping came from chocolate melting issues." }
            ]
        };

        // Game state
        const state = {
            questions: [],
            currentIndex: 0,
            score: 0,
            gameActive: false,
            selectedCategory: 'all',
            answered: false
        };

        // DOM elements
        const elements = {
            statement: document.getElementById('statement'),
            factBtn: document.getElementById('fact-btn'),
            fictionBtn: document.getElementById('fiction-btn'),
            nextBtn: document.getElementById('next-btn'),
            restartBtn: document.getElementById('restart-btn'),
            score: document.getElementById('score'),
            feedback: document.getElementById('feedback'),
            explanation: document.getElementById('explanation'),
            questionCount: document.getElementById('question-count'),
            totalQuestions: document.getElementById('total-questions'),
            progressBar: document.getElementById('progress-bar'),
            categorySelect: document.getElementById('category-select')
        };

        // Initialize game
        function init() {
            // Event listeners
            elements.factBtn.addEventListener('click', () => checkAnswer('fact'));
            elements.fictionBtn.addEventListener('click', () => checkAnswer('fiction'));
            elements.nextBtn.addEventListener('click', nextQuestion);
            elements.restartBtn.addEventListener('click', startGame);
            elements.categorySelect.addEventListener('change', changeCategory);
            
            // Start the game
            startGame();
        }

        // Start a new game
        function startGame() {
            // Reset state
            state.currentIndex = 0;
            state.score = 0;
            state.gameActive = true;
            state.answered = false;
            
            // Load questions
            loadQuestions();
            
            // Update UI
            updateScore();
            elements.questionCount.textContent = 1;
            elements.totalQuestions.textContent = state.questions.length;
            elements.progressBar.style.width = '0%';
            elements.feedback.textContent = '';
            elements.explanation.textContent = '';
            elements.explanation.style.display = 'none';
            elements.factBtn.disabled = false;
            elements.fictionBtn.disabled = false;
            elements.nextBtn.style.display = 'none';
            elements.restartBtn.style.display = 'none';
            elements.factBtn.style.display = 'block';
            elements.fictionBtn.style.display = 'block';
            
            // Show first question
            showQuestion();
        }

        // Load questions based on selected category
        function loadQuestions() {
            if (state.selectedCategory === 'all') {
                // Combine all questions
                state.questions = Object.values(gameData).flat();
            } else {
                // Get questions for selected category
                state.questions = [...gameData[state.selectedCategory]];
            }
            
            // Shuffle questions
            shuffleArray(state.questions);
        }

        // Shuffle array using Fisher-Yates algorithm
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        // Show current question
        function showQuestion() {
            if (!state.gameActive || state.currentIndex >= state.questions.length) {
                endGame();
                return;
            }
            
            const question = state.questions[state.currentIndex];
            elements.statement.textContent = question.statement;
            
            // Update progress
            elements.questionCount.textContent = state.currentIndex + 1;
            elements.progressBar.style.width = `${((state.currentIndex + 1) / state.questions.length) * 100}%`;
            
            // Reset UI for new question
            elements.feedback.textContent = '';
            elements.explanation.textContent = '';
            elements.explanation.style.display = 'none';
            elements.nextBtn.style.display = 'none';
            elements.factBtn.disabled = false;
            elements.fictionBtn.disabled = false;
            state.answered = false;
        }

        // Check if answer is correct
        function checkAnswer(guess) {
            if (!state.gameActive || state.answered) return;
            
            state.answered = true;
            const question = state.questions[state.currentIndex];
            const isCorrect = guess === question.answer;
            
            // Update score
            if (isCorrect) {
                state.score++;
                updateScore();
                elements.feedback.textContent = 'Correct! 🎉';
                elements.feedback.className = 'feedback correct';
                createConfetti();
            } else {
                elements.feedback.textContent = `Incorrect! It's ${question.answer === 'fact' ? 'a FACT' : 'FICTION'}.`;
                elements.feedback.className = 'feedback incorrect';
            }
            
            // Show explanation
            elements.explanation.textContent = question.explanation;
            elements.explanation.style.display = 'block';
            
            // Disable answer buttons
            elements.factBtn.disabled = true;
            elements.fictionBtn.disabled = true;
            
            // Show next button
            elements.nextBtn.style.display = 'block';
        }

        // Move to next question
        function nextQuestion() {
            state.currentIndex++;
            if (state.currentIndex < state.questions.length) {
                showQuestion();
            } else {
                endGame();
            }
        }

        // End the game
        function endGame() {
            state.gameActive = false;
            
            // Show final score
            elements.statement.innerHTML = `
                <div class="game-over">Game Over!</div>
                <div class="final-score">${state.score}/${state.questions.length}</div>
            `;
            
            // Hide answer buttons
            elements.factBtn.style.display = 'none';
            elements.fictionBtn.style.display = 'none';
            elements.nextBtn.style.display = 'none';
            
            // Show restart button
            elements.restartBtn.style.display = 'block';
            
            // Special message for perfect score
            if (state.score === state.questions.length) {
                elements.statement.innerHTML += `<div style="margin-top: 1rem;">Perfect! You're a fact master! 🏆</div>`;
                createConfetti(true);
            }
        }

        // Update score display
        function updateScore() {
            elements.score.textContent = state.score;
        }

        // Change category
        function changeCategory(e) {
            state.selectedCategory = e.target.value;
            startGame();
        }

        // Create confetti effect
        function createConfetti(intense = false) {
            const colors = ['#4cc9f0', '#f72585', '#b5179e', '#7209b7', '#560bad', '#480ca8'];
            const container = document.querySelector('.game-container');
            
            const count = intense ? 100 : 30;
            
            for (let i = 0; i < count; i++) {
                const confetti = document.createElement('div');
                confetti.style.position = 'absolute';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.borderRadius = '50%';
                confetti.style.left = `${Math.random() * 100}%`;
                confetti.style.top = '-10px';
                confetti.style.zIndex = '100';
                confetti.style.pointerEvents = 'none';
                container.appendChild(confetti);
                
                const animation = confetti.animate([
                    { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
                    { transform: `translate(${Math.random() * 200 - 100}px, ${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
                ], {
                    duration: Math.random() * 3000 + 2000,
                    easing: 'cubic-bezier(0.1, 0.8, 0.9, 1)'
                });
                
                animation.onfinish = () => confetti.remove();
            }
        }

        // Start the game when page loads
        window.addEventListener('load', init);
