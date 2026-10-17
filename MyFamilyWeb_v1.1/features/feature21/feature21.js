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
    const colorTranslation = {
        red: 'colorRed', blue: 'colorBlue', yellow: 'colorYellow', green: 'green'
    };
    pad.setAttribute('aria-label', FeatureI18n.translate(colorTranslation[color]).toLocaleLowerCase());
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
    status.textContent = FeatureI18n.translate('listen');
    await delay(350);
    for (const color of sequence) {
        await flash(color);
        await delay(140);
    }
    showing = false;
    inputIndex = 0;
    status.textContent = FeatureI18n.translate('repeat');
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
        status.textContent = FeatureI18n.translate('simonError', { n: sequence.length - 1 });
        window.playGameSound('miss');
        document.getElementById('start').textContent = FeatureI18n.translate('replay');
        return;
    }
    inputIndex++;
    if (inputIndex === sequence.length) {
        window.playGameSound('success');
        status.textContent = FeatureI18n.translate('correct');
        setTimeout(nextRound, 650);
    }
}

document.getElementById('start').addEventListener('click', () => {
    sequence = [];
    inputIndex = 0;
    playing = true;
    status.textContent = FeatureI18n.translate('simonStart');
    document.getElementById('start').textContent = FeatureI18n.translate('replay');
    window.playGameSound('start');
    nextRound();
});
