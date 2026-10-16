const grid = document.getElementById('memory-grid');
const status = document.getElementById('status');
const movesDisplay = document.getElementById('moves');
const pairsDisplay = document.getElementById('pairs');
const symbols = ['🍎', '🚀', '🐱', '🌟', '🎈', '🍀', '⚽', '🎵'];
let openCards = [];
let matchedPairs = 0;
let moves = 0;
let locked = false;
let mismatchTimer;

function shuffle(items) {
    for (let index = items.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
    }
    return items;
}

function startGame() {
    clearTimeout(mismatchTimer);
    openCards = [];
    matchedPairs = 0;
    moves = 0;
    locked = false;
    movesDisplay.textContent = moves;
    pairsDisplay.textContent = matchedPairs;
    status.textContent = 'Chọn hai thẻ để tìm một cặp giống nhau.';
    grid.replaceChildren();
    shuffle([...symbols, ...symbols]).forEach((symbol) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'memory-card';
        card.textContent = '?';
        card.setAttribute('aria-label', 'Thẻ chưa lật');
        card.dataset.symbol = symbol;
        card.addEventListener('click', () => flipCard(card));
        grid.appendChild(card);
    });
    window.playGameSound('start');
}

function flipCard(card) {
    if (locked || card.classList.contains('is-open') || card.classList.contains('is-matched')) return;
    card.textContent = card.dataset.symbol;
    card.setAttribute('aria-label', card.dataset.symbol);
    card.classList.add('is-open');
    openCards.push(card);
    window.playGameSound('flip');

    if (openCards.length < 2) return;
    moves++;
    movesDisplay.textContent = moves;
    const [first, second] = openCards;
    if (first.dataset.symbol === second.dataset.symbol) {
        first.classList.replace('is-open', 'is-matched');
        second.classList.replace('is-open', 'is-matched');
        first.disabled = true;
        second.disabled = true;
        matchedPairs++;
        pairsDisplay.textContent = matchedPairs;
        openCards = [];
        window.playGameSound('success');
        if (matchedPairs === symbols.length) {
            status.textContent = `Bạn thắng với ${moves} lượt lật!`;
            window.playGameSound('win');
        }
        return;
    }

    locked = true;
    window.playGameSound('miss');
    mismatchTimer = setTimeout(() => {
        [first, second].forEach((item) => {
            item.textContent = '?';
            item.setAttribute('aria-label', 'Thẻ chưa lật');
            item.classList.remove('is-open');
        });
        openCards = [];
        locked = false;
    }, 750);
}

document.getElementById('restart').addEventListener('click', startGame);
startGame();