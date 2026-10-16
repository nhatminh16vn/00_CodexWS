document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('vietnameseGrid');
    const status = document.getElementById('audio-status');

    fetch('../../data/JSON/vietnamese-alphabet.json')
        .then((response) => {
            if (!response.ok) throw new Error('Không tải được bảng chữ cái.');
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
            card.setAttribute('aria-label', `Nghe chữ ${letter.character}: ${letter.name}`);

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
            listen.textContent = 'Nghe phát âm';

            card.append(pair, name, listen);
            card.addEventListener('click', () => speakLetter(letter));
            grid.appendChild(card);
        });
    }

    function speakLetter(letter) {
        if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
            status.textContent = 'Trình duyệt này chưa hỗ trợ đọc phát âm.';
            return;
        }

        const vietnameseVoice = window.speechSynthesis.getVoices()
            .find((voice) => /^vi(?:-|$)/i.test(voice.lang));
        if (!vietnameseVoice) {
            status.textContent = 'Chưa có giọng Tiếng Việt trên thiết bị. Trên iPhone: Cài đặt > Trợ năng > Nội dung được đọc > Giọng nói, rồi tải giọng Tiếng Việt.';
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(letter.name);
        utterance.lang = 'vi-VN';
        utterance.rate = 0.85;
        utterance.voice = vietnameseVoice;
        utterance.onstart = () => {
            status.textContent = `Đang đọc chữ ${letter.character}: ${letter.name}`;
        };
        utterance.onend = () => {
            status.textContent = `Đã đọc chữ ${letter.character}. Chạm chữ khác để nghe tiếp.`;
        };
        utterance.onerror = () => {
            status.textContent = 'Không phát được âm thanh. Hãy thử lại.';
        };
        window.speechSynthesis.speak(utterance);
    }
});