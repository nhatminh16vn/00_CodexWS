// feature1.js
document.addEventListener('DOMContentLoaded', function() {
    // Lấy dữ liệu từ file JSON
    fetch('../../data/JSON/hiragana-basic.json')
        .then(response => response.json())
        .then(data => {
            renderHiraganaGrid(data);
        })
        .catch(error => console.error('Error loading Hiragana data:', error));

    function renderHiraganaGrid(hiraganaData) {
        const gridContainer = document.getElementById('hiraganaGrid');
        
        // Tạo 40 ô (5x8) cho bảng Hiragana
        for (let i = 0; i < 48 && i < hiraganaData.length; i++) {
            const charData = hiraganaData[i];
            
            const card = document.createElement('div');
            card.className = 'hiragana-card';
            
            const charElement = document.createElement('div');
            charElement.className = 'hiragana-char';
            charElement.textContent = charData.character;
            
            const romajiElement = document.createElement('div');
            romajiElement.className = 'romaji';
            romajiElement.textContent = charData.romaji;
            
            card.appendChild(charElement);
            card.appendChild(romajiElement);
            gridContainer.appendChild(card);
        }
    }
});