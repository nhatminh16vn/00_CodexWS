document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('vietnameseGrid');
    const status = document.getElementById('audio-status');

    fetch('../../data/JSON/vietnamese-alphabet.json')
        .then((response) => {
            if (!response.ok) throw new Error(FeatureI18n.translate('alphabetLoadError'));
            return response.json();
        })
        .then(renderAlphabet)
        .catch((error) => {
            status.textContent = error.message;
        });

    function renderAlphabet(letters) {
        letters.forEach((letter) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'letter-card';
            card.setAttribute('aria-label', FeatureI18n.translate('letterAria', { letter: letter.character, name: letter.name }));

            const pair = document.createElement('span');
            pair.className = 'letter-pair';
            const uppercase = document.createElement('span');
            uppercase.className = 'uppercase-letter';
            uppercase.textContent = letter.character;
            const lowercase = document.createElement('span');
            lowercase.className = 'lowercase-letter';
            lowercase.textContent = letter.character.toLocaleLowerCase('vi-VN');
            pair.append(uppercase, lowercase);

            const name = document.createElement('span');
            name.className = 'letter-name';
            name.textContent = letter.name;

            const listen = document.createElement('span');
            listen.className = 'listen-label';
            listen.textContent = FeatureI18n.translate('listenPractice');

            card.append(pair, name, listen);
            card.addEventListener('click', () => speakLetter(letter));
            grid.appendChild(card);
        });
    }

    function speakLetter(letter) {
        if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
            status.textContent = FeatureI18n.translate('speechUnsupported');
            return;
        }

        const vietnameseVoice = window.speechSynthesis.getVoices()
            .find((voice) => /^vi(?:-|$)/i.test(voice.lang));
        if (!vietnameseVoice) {
            status.textContent = FeatureI18n.translate('noVietnameseVoice');
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(letter.name);
        utterance.lang = 'vi-VN';
        utterance.rate = 0.85;
        utterance.voice = vietnameseVoice;
        utterance.onstart = () => {
            status.textContent = FeatureI18n.translate('speakingLetter', { letter: letter.character, name: letter.name });
        };
        utterance.onend = () => {
            status.textContent = FeatureI18n.translate('spokenLetter', { letter: letter.character });
        };
        utterance.onerror = () => {
            status.textContent = FeatureI18n.translate('speechError');
        };
        window.speechSynthesis.speak(utterance);
    }
});
