        const state = {
            lastTopic: null,
            memory: {
                name: null
            }
        };

        function normalizeText(input) {
            return String(input || '').trim().toLowerCase();
        }

        function classifyIntent(message) {
            const text = normalizeText(message);
            if (/\b(hi|hello|hey|good morning|good evening|sup)\b/.test(text)) return 'greeting';
            if (/\b(what can you do|who are you|help|assistant)\b/.test(text)) return 'help';
            if (/\b(math|calculate|plus|minus|times|divide|sum|total|equation|add|subtract|multiply)\b/.test(text) || /\d\s*[+*/-]\s*\d/.test(text)) return 'math';
            if (/\b(study|learn|teach|japanese|hiragana|katakana|lesson|quiz|language|vocab)\b/.test(text)) return 'study';
            if (/\b(tech|computer|wifi|internet|printer|phone|software|device|bug|error)\b/.test(text)) return 'tech';
            if (/\b(recommend|book|movie|suggest|watch|read|pick)\b/.test(text)) return 'recommendation';
            if (/\b(joke|funny|laugh|humor|haha)\b/.test(text)) return 'joke';
            if (/\b(time|date|today|day|clock)\b/.test(text)) return 'time';
            if (/\b(bye|goodbye|later|see you|thanks|thank you)\b/.test(text)) return 'goodbye';
            return 'general';
        }

        document.getElementById('send-button').addEventListener('click', sendMessage);
        document.getElementById('user-input').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        function quickQuestion(question) {
            const input = document.getElementById('user-input');
            input.value = question;
            sendMessage();
        }

        function sendMessage() {
            const userInput = document.getElementById('user-input');
            const message = userInput.value.trim();

            if (!message) {
                return;
            }

            addMessage(message, 'user-message');
            userInput.value = '';
            const botResponse = getBotResponse(message);
            addMessage(botResponse.text, 'bot-message');

            if (botResponse.suggestions.length) {
                const suggestionsDiv = document.createElement('div');
                suggestionsDiv.className = 'suggestions';
                botResponse.suggestions.forEach((suggestion) => {
                    const suggestionElement = document.createElement('div');
                    suggestionElement.className = 'suggestion';
                    suggestionElement.textContent = suggestion;
                    suggestionElement.addEventListener('click', () => quickQuestion(suggestion));
                    suggestionsDiv.appendChild(suggestionElement);
                });
                document.getElementById('chat-messages').lastChild.appendChild(suggestionsDiv);
            }
        }

        function addMessage(text, className) {
            const chatMessages = document.getElementById('chat-messages');
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', className);
            messageElement.textContent = text;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function getRandomResponse(responses) {
            return responses[Math.floor(Math.random() * responses.length)];
        }

        function safeMathEvaluate(expression) {
            const clean = expression
                .replace(/x/gi, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-')
                .replace(/\s+/g, '');

            if (!/^[0-9+\-*/().]+$/.test(clean)) {
                return null;
            }

            try {
                const result = Function(`"use strict"; return (${clean});`)();
                return Number.isFinite(result) ? result : null;
            } catch (error) {
                return null;
            }
        }

        function extractMathExpression(message) {
            const normalized = normalizeText(message);

            const direct = normalized.match(/(-?\d+(?:\.\d+)?)\s*(?:\+|plus|minus|-|\*|times|\/|divided by)\s*(-?\d+(?:\.\d+)?)/);
            if (direct) {
                const a = direct[1];
                const b = direct[2];
                const operator = normalized.includes('plus') ? '+' :
                    normalized.includes('minus') || normalized.includes('-') ? '-' :
                    normalized.includes('times') || normalized.includes('*') ? '*' :
                    normalized.includes('divided by') || normalized.includes('/') ? '/' :
                    '+';

                return `${a}${operator}${b}`;
            }

            const simple = normalized.match(/what is\s+(.+)/i);
            if (simple) {
                const candidate = simple[1].replace(/\?/g, '').trim();
                const calc = safeMathEvaluate(candidate);
                if (calc !== null) {
                    return candidate;
                }
            }

            const plain = normalized.match(/([\d+\-*/().\s]+)/);
            if (plain) {
                const candidate = plain[1].replace(/\s+/g, '');
                if (safeMathEvaluate(candidate) !== null) {
                    return candidate;
                }
            }

            return null;
        }

        function getBotResponse(userMessage) {
            const message = userMessage.trim();
            const msg = normalizeText(message);
            let response = { text: '', suggestions: [] };
            const predictedIntent = classifyIntent(message);

            const nameMatch = message.match(/my name is\s+([a-zA-Z]+)/i);
            if (nameMatch) {
                state.memory.name = nameMatch[1];
                response.text = `Nice to meet you, ${nameMatch[1]}! I’m your family chatbot. I can help with study, math, and ideas.`;
                response.suggestions = ['What can you do?', 'Teach me Japanese', 'Solve 6 * 7'];
                return response;
            }

            if (predictedIntent === 'greeting') {
                state.lastTopic = null;
                response.text = state.memory.name
                    ? `Hi ${state.memory.name}! I’m ready to help with questions, study, math, and creativity.`
                    : 'Hi! I’m your family chatbot. I can help with math, study, tech, recommendations, and quick ideas.';
                response.suggestions = ['What can you do?', 'Calculate 15 + 27', 'Teach me Japanese'];
                return response;
            }

            if (predictedIntent === 'help') {
                state.lastTopic = 'help';
                response.text = 'I’m a simple chatbot built into this website. I can do quick math, explain study topics, answer general questions, help with tech issues, and suggest books, jokes, or learning ideas.';
                response.suggestions = ['Solve 8 * 9', 'Teach me Japanese', 'Book recommendation'];
                return response;
            }

            if (predictedIntent === 'study') {
                state.lastTopic = 'study';
                response.text = 'Let’s study Japanese in a simple way: start with Hiragana, then Katakana, then common words. Try this: あ = a, き = ki, し = shi, ら = ra. Want a quick lesson or a quiz?';
                response.suggestions = ['Teach me hiragana', 'How to say hello in Japanese', 'Give me a quiz'];
                return response;
            }

            if (predictedIntent === 'math') {
                state.lastTopic = 'math';
                const mathExpression = extractMathExpression(message);
                if (mathExpression) {
                    const result = safeMathEvaluate(mathExpression);
                    if (result !== null) {
                        response.text = `${mathExpression} = ${result}`;
                        response.suggestions = ['Another calculation', 'What can you do?', 'Teach me Japanese'];
                        return response;
                    }
                }
                response.text = 'I can help with mathematics. Try examples like 15 + 27, 48 / 6, or 9 * 8.';
                response.suggestions = ['Calculate 15 + 27', 'What can you do?', 'Teach me Japanese'];
                return response;
            }

            if (predictedIntent === 'recommendation') {
                state.lastTopic = 'recommend';
                response.text = 'Here are a few good picks: for books, try The Name of the Wind or Project Hail Mary; for movies, try Interstellar or The Grand Budapest Hotel. If you want something more playful, I can suggest for kids, family, or learning.';
                response.suggestions = ['Book recommendation', 'Movie recommendation', 'Tell me a joke'];
                return response;
            }

            if (predictedIntent === 'joke') {
                response.text = getRandomResponse([
                    'Why don’t skeletons fight each other? They don’t have the guts!',
                    'What did one wall say to the other? “I’ll meet you at the corner!”',
                    'Why was the math book sad? Because it had too many problems.'
                ]);
                response.suggestions = ['Another joke', 'Book recommendation', 'Teach me Japanese'];
                return response;
            }

            if (predictedIntent === 'tech') {
                state.lastTopic = 'tech';
                response.text = 'A good troubleshooting flow is: restart the device, check the connection, update software, and test with one other device. If it is a Wi‑Fi issue, restart the modem and router, then reconnect.';
                response.suggestions = ['Fix Wi‑Fi', 'Fix printer', 'What can you do?'];
                return response;
            }

            if (predictedIntent === 'time') {
                const now = new Date();
                response.text = `Right now it is ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on ${now.toLocaleDateString()}.`;
                response.suggestions = ['What can you do?', 'Teach me Japanese', 'Tell me a joke'];
                return response;
            }

            if (predictedIntent === 'goodbye') {
                response.text = 'Goodbye! Come back anytime — I’m here for quick questions, study help, and creative ideas.';
                response.suggestions = ['What can you do?', 'Teach me Japanese'];
                return response;
            }

            if (/(hello in japanese|how do you say.*japanese|say.*hello)/.test(msg)) {
                response.text = 'A common way to say hello in Japanese is こんにちは (konnichiwa). If you want a more casual greeting, you can say こんばんは (konbanwa).';
                response.suggestions = ['Teach me hiragana', 'How to say thank you?', 'Give me a quiz'];
                return response;
            }

            if (/(thank you|thanks)/.test(msg)) {
                response.text = 'You’re welcome! I’m happy to help. Ask me a math question, a study prompt, or another idea.';
                response.suggestions = ['Teach me Japanese', 'Solve 12 + 25', 'Tell me a joke'];
                return response;
            }

            const generalResponses = [
                'That sounds interesting. I can help with learning, math, tech questions, or fun ideas. What would you like to explore?',
                'I’m following your question. Try asking me for a math problem, a study topic, or a recommendation.',
                'I can help with that. Ask me a simple question and I’ll turn it into a clear answer.'
            ];

            response.text = getRandomResponse(generalResponses);
            response.suggestions = ['What can you do?', 'Calculate 25 + 37', 'Teach me Japanese'];
            return response;
        }