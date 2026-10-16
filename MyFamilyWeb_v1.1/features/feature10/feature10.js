// feature10.js
document.addEventListener('DOMContentLoaded', function() {
    // Lấy dữ liệu từ file JSON
    fetch('../../data/JSON/alphabet-basic.json')
        .then(response => response.json())
        .then(data => {
            renderAlphabetGrid(data);
        })
        .catch(error => console.error('Error loading Alphabet data:', error));

    function renderAlphabetGrid(alphabetData) {
        const gridContainer = document.getElementById('alphabetGrid');

        // Tạo 52 ô (13x4) cho bảng Alphabet
        for (let i = 0; i < 52 && i < alphabetData.length; i++) {
            const charData = alphabetData[i];

            const card = document.createElement('div');
            card.className = 'alphabet-card';

            const charElement = document.createElement('div');
            charElement.className = 'alphabet-char';
            charElement.textContent = charData.character;

            const descriptionElement = document.createElement('div');
            descriptionElement.className = 'alphabet-description';
            descriptionElement.textContent = charData.description;

            card.appendChild(charElement);
            card.appendChild(descriptionElement);
            gridContainer.appendChild(card);
        }
    }
});