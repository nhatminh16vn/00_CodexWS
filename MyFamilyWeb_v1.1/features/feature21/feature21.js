const colors = ['red', 'blue', 'yellow', 'green'];
const frequencies = { red: 392, blue: 494, yellow: 587, green: 659 };
const simonGrid = document.getElementById('simon-grid');
const status = document.getElementById('status');
const levelDisplay = document.getElementById('level');
let sequence = [];
let inputIndex = 0;
let playing = false;
let showing = false;
const pads = {};

colors.forEach((color) => {
    const pad = document.createElement('button');
    pad.type = 'button';
    pad.className = 'simon-pad';
    pad.dataset.color = color;
    pad.setAttribute('aria-label', color);
    pad.addEventListener('click', () => chooseColor(color));
    pads[color] = pad;
    simonGrid.appendChild(pad);
});

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function flash(color, duration = 280) {
    pads[color].classList.add('is-lit');
    window.playGameTone?.(frequencies[color]);
    await delay(duration);
    pads[color].classList.remove('is-lit');
}

async function showSequence() {
    showing = true;
    status.textContent = 'Hãy nghe và ghi nhớ chuỗi màu.';
    await delay(350);
    for (const color of sequence) {
        await flash(color);
        await delay(140);
    }
    showing = false;
    inputIndex = 0;
    status.textContent = 'Đến lượt bạn lặp lại chuỗi.';
}

function nextRound() {
    sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    levelDisplay.textContent = sequence.length;
    showSequence();
}

function chooseColor(color) {
    if (!playing || showing) return;
    flash(color, 170);
    if (sequence[inputIndex] !== color) {
        playing = false;
        status.textContent = `Sai mất rồi! Bạn nhớ được ${sequence.length - 1} màu.`;
        window.playGameSound('miss');
        document.getElementById('start').textContent = 'Chơi lại';
        return;
    }
    inputIndex++;
    if (inputIndex === sequence.length) {
        window.playGameSound('success');
        status.textContent = 'Chính xác! Chuỗi tiếp theo dài hơn.';
        setTimeout(nextRound, 650);
    }
}

document.getElementById('start').addEventListener('click', () => {
    sequence = [];
    inputIndex = 0;
    playing = true;
    status.textContent = 'Bắt đầu nhớ màu nhé.';
    document.getElementById('start').textContent = 'Chơi lại';
    window.playGameSound('start');
    nextRound();
});