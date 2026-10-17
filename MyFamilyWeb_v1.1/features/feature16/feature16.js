        const questions = {
            n6: [
                { question: "What is the hiragana for 'a'?", options: ["あ", "い", "う", "え"], answer: "あ" },
                { question: "What does ありがとう mean?", options: ["Hello", "Thank you", "Goodbye", "Please"], answer: "Thank you" },
                { question: "What is the katakana for 'ko'?", options: ["コ", "カ", "キ", "ケ"], answer: "コ" },
                { question: "Translate: ねこ", options: ["Dog", "Cat", "Fish", "Bird"], answer: "Cat" },
                { question: "What particle marks the topic?", options: ["を", "は", "が", "に"], answer: "は" }
            ],
            n5: [
                { question: "What is the kanji for 'sun'?", options: ["日", "月", "火", "水"], answer: "日" },
                { question: "Conjugate 食べる to polite past tense", options: ["食べました", "食べます", "食べる", "食べない"], answer: "食べました" },
                { question: "What does 学校 mean?", options: ["House", "School", "Store", "Park"], answer: "School" },
                { question: "What is the plain form of 行きます?", options: ["行く", "行った", "行かない", "行き"], answer: "行く" },
                { question: "What does お元気ですか mean?", options: ["How much?", "How are you?", "Where are you?", "What time is it?"], answer: "How are you?" }
            ],
            n4: [
                { question: "What is the kanji for 'economy'?", options: ["経済", "環境", "政治", "社会"], answer: "経済" },
                { question: "Humble form of する?", options: ["いたします", "します", "なさる", "おする"], answer: "いたします" },
                { question: "Honorific form of 行く?", options: ["いらっしゃる", "行く", "お行き", "行きます"], answer: "いらっしゃる" },
                { question: "What does 環境 mean?", options: ["Environment", "Economy", "Politics", "Society"], answer: "Environment" },
                { question: "Translate: 会議に出席する", options: ["Attend a meeting", "Cancel a meeting", "Plan a meeting", "End a meeting"], answer: "Attend a meeting" }
            ],
            n3: [
                { question: "What is the kanji for 'culture'?", options: ["文化", "教育", "社会", "歴史"], answer: "文化" },
                { question: "What does 経済学 mean?", options: ["Economics", "Politics", "History", "Culture"], answer: "Economics" },
                { question: "What is the polite form of 見る?", options: ["見ます", "見ました", "見る", "見ない"], answer: "見ます" },
                { question: "What does 知識 mean?", options: ["Knowledge", "Wisdom", "Information", "Data"], answer: "Knowledge" },
                { question: "Translate: 彼は日本に住んでいます", options: ["He lives in Japan", "He studies in Japan", "He works in Japan", "He travels to Japan"], answer: "He lives in Japan" }
            ],
            n2: [
                { question: "What is the kanji for 'government'?", options: ["政府", "政治", "法律", "経済"], answer: "政府" },
                { question: "What does 統計 mean?", options: ["Statistics", "Economy", "Politics", "Culture"], answer: "Statistics" },
                { question: "What is the plain form of 話します?", options: ["話す", "話した", "話さない", "話している"], answer: "話す" },
                { question: "Translate: 彼女は医者ですか？", options: ["Is she a doctor?", "Is she a teacher?", "Is she a student?", "Is she a nurse?"], answer: "Is she a doctor?" },
                { question: "What does 環境保護 mean?", options: ["Environmental protection", "Economic growth", "Political stability", "Cultural exchange"], answer: "Environmental protection" }
            ],
            n1: [
                { question: "What is the kanji for 'philosophy'?", options: ["哲学", "科学", "文学", "歴史"], answer: "哲学" },
                { question: "What does 国際関係 mean?", options: ["International relations", "Domestic affairs", "Cultural exchange", "Economic policy"], answer: "International relations" },
                { question: "What is the polite form of 読む?", options: ["読みます", "読んだ", "読む", "読まない"], answer: "読みます" },
                { question: "Translate: 彼は文学を専攻しています", options: ["He majors in literature", "He studies economics", "He works in politics", "He teaches history"], answer: "He majors in literature" },
                { question: "What does 社会科学 mean?", options: ["Social sciences", "Natural sciences", "Formal sciences", "Applied sciences"], answer: "Social sciences" }
            ]
        };

        let currentLevel = null;
        let currentQuestion = 0;
        let score = 0;

        const levelTitle = document.getElementById('levelTitle');
        const questionEl = document.getElementById('question');
        const optionsEl = document.getElementById('options');
        const feedbackEl = document.getElementById('feedback');
        const scoreValueEl = document.getElementById('scoreValue');
        const nextBtn = document.getElementById('nextBtn');
        const gameArea = document.getElementById('gameArea');
        const instructions = document.getElementById('instructions');

        document.getElementById('n6Btn').addEventListener('click', () => startGame('n6', `N6 — ${FeatureI18n.translate('jlptBeginner')}`));
        document.getElementById('n5Btn').addEventListener('click', () => startGame('n5', `N5 — ${FeatureI18n.translate('jlptNovice')}`));
        document.getElementById('n4Btn').addEventListener('click', () => startGame('n4', `N4 — ${FeatureI18n.translate('jlptNovice')}`));
        document.getElementById('n3Btn').addEventListener('click', () => startGame('n3', `N3 — ${FeatureI18n.translate('jlptIntermediate')}`));
        document.getElementById('n2Btn').addEventListener('click', () => startGame('n2', `N2 — ${FeatureI18n.translate('jlptAdvanced')}`));
        document.getElementById('n1Btn').addEventListener('click', () => startGame('n1', `N1 — ${FeatureI18n.translate('jlptAdvanced')}`));
        nextBtn.addEventListener('click', loadNextQuestion);

        function startGame(level, title) {
            try {
                currentLevel = level;
                currentQuestion = 0;
                score = 0;
                scoreValueEl.textContent = score;
                gameArea.classList.remove('hidden');
                instructions.classList.add('hidden');
                levelTitle.textContent = title;
                loadQuestion();
            } catch (e) {
                console.error('Error starting game:', e);
                feedbackEl.textContent = FeatureI18n.translate('genericError');
            }
        }

        function loadQuestion() {
            const q = questions[currentLevel][currentQuestion];
            questionEl.textContent = localizeQuestion(q.question);
            optionsEl.innerHTML = '';
            feedbackEl.textContent = '';
            nextBtn.classList.add('hidden');

            q.options.forEach(option => {
                const btn = document.createElement('button');
                btn.textContent = localizeOption(option);
                btn.dataset.answer = option;
                btn.classList.add('option', 'px-4', 'py-3', 'bg-gray-100', 'rounded-lg', 'text-left', 'border', 'border-gray-300', 'w-full', 'text-sm', 'sm:text-base');
                btn.addEventListener('click', () => checkAnswer(option, q.answer));
                optionsEl.appendChild(btn);
            });

        }

        function localizeQuestion(question) {
            const copy = window.Feature16PromptI18n?.[FeatureI18n.language];
            if (!copy) return question;

            const rules = [
                [/^What is the hiragana for '([^']+)'\?$/, 'hiragana', false],
                [/^What does (.+) mean\?$/, 'meaning', false],
                [/^What is the katakana for '([^']+)'\?$/, 'katakana', false],
                [/^Translate: (.+)$/, 'translate', false],
                [/^What particle marks the topic\?$/, 'topic', false],
                [/^What is the kanji for '([^']+)'\?$/, 'kanji', true],
                [/^Conjugate (.+) to polite past tense$/, 'past', false],
                [/^What is the plain form of (.+)\?$/, 'plain', false],
                [/^Humble form of (.+)\?$/, 'humble', false],
                [/^Honorific form of (.+)\?$/, 'honorific', false],
                [/^What is the polite form of (.+)\?$/, 'polite', false]
            ];

            for (const [pattern, key, translateTerm] of rules) {
                const match = question.match(pattern);
                if (!match) continue;
                let item = match[1] || '';
                if (translateTerm) item = copy.terms[item] || item;
                return copy[key].replace('{item}', item);
            }
            return question;
        }

        function localizeOption(option) {
            const index = window.Feature16OptionOrder?.indexOf(option) ?? -1;
            return index >= 0
                ? (window.Feature16OptionLabels?.[FeatureI18n.language]?.[index] || option)
                : option;
        }

        function playSound(type) {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(type === 'correct' ? 800 : 400, ctx.currentTime);
                gainNode.gain.setValueAtTime(0.2, ctx.currentTime); // Reduced volume to 20%
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                oscillator.start();
                oscillator.stop(ctx.currentTime + 0.3);
            } catch (e) {
                console.warn('Audio playback failed:', e);
            }
        }

        function checkAnswer(selected, correct) {
            const buttons = optionsEl.querySelectorAll('.option');
            buttons.forEach(btn => {
                btn.disabled = true;
                if (btn.dataset.answer === correct) {
                    btn.classList.add('correct');
                }
                if (btn.dataset.answer === selected && selected !== correct) {
                    btn.classList.add('incorrect');
                }
            });

            if (selected === correct) {
                score += 10;
                scoreValueEl.textContent = score;
                feedbackEl.textContent = FeatureI18n.translate('correctFeedback');
                feedbackEl.classList.add('text-green-600');
                playSound('correct');
            } else {
                feedbackEl.textContent = FeatureI18n.translate('incorrectFeedback', { answer: localizeOption(correct) });
                feedbackEl.classList.add('text-red-600');
                playSound('incorrect');
            }

            nextBtn.classList.remove('hidden');
        }

        function loadNextQuestion() {
            currentQuestion++;
            if (currentQuestion < questions[currentLevel].length) {
                loadQuestion();
            } else {
                questionEl.textContent = FeatureI18n.translate('jlptGameOver');
                optionsEl.innerHTML = '';
                feedbackEl.textContent = FeatureI18n.translate('jlptFinalScore', { score });
                nextBtn.classList.add('hidden');
            }
        }
