(() => {
    const volumeMaximum = 5.0;
    const defaultVolume = 2.3;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = new URL('../css/site-music.css', document.currentScript.src).href;
    document.head.appendChild(stylesheet);

    const player = document.createElement('div');
    player.className = 'site-music';
    player.setAttribute('role', 'group');
    const featureMatch = window.location.pathname.match(/feature(\d+)(?:\/|\.html)/i);
    const featureNumber = featureMatch ? Number(featureMatch[1]) : 0;
    const trackName = featureNumber ? `Feature ${featureNumber} theme` : 'Site theme';
    player.setAttribute('aria-label', `Background music controls, ${trackName}`);
    player.dataset.track = String(featureNumber);
    player.innerHTML = `<button class="site-music-toggle" type="button" aria-label="Play background music" title="Play background music">♫</button><span class="site-music-status" aria-live="polite">Music off</span><input class="site-music-volume" type="range" min="0" max="${volumeMaximum}" step="0.01" value="${defaultVolume}" aria-label="Music volume" title="Music volume">`;
    document.body.appendChild(player);

    const toggle = player.querySelector('.site-music-toggle');
    const status = player.querySelector('.site-music-status');
    const volumeControl = player.querySelector('.site-music-volume');
    const volumeSettingVersion = '4';
    const savedVolumeSetting = localStorage.getItem('myfamily-music-volume');
    if (savedVolumeSetting !== null) {
        let savedVolume = Number(savedVolumeSetting);
        if (localStorage.getItem('myfamily-music-volume-version') !== volumeSettingVersion && Number.isFinite(savedVolume) && savedVolume >= 0) {
            savedVolume = defaultVolume;
            localStorage.setItem('myfamily-music-volume', String(savedVolume));
        }
        localStorage.setItem('myfamily-music-volume-version', volumeSettingVersion);
        if (Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= volumeMaximum) {
            volumeControl.value = String(savedVolume);
        }
    } else {
        localStorage.setItem('myfamily-music-volume-version', volumeSettingVersion);
    }

    let audioContext;
    let masterGain;
    let outputCompressor;
    let beatTimer;
    let suspendTimer;
    let beatIndex = 0;
    let isPlaying = false;

    function createTrack(trackNumber) {
        let randomState = ((trackNumber + 1) * 0x6d2b79f5) >>> 0;
        const random = () => {
            randomState = (randomState + 0x6d2b79f5) >>> 0;
            let value = randomState;
            value = Math.imul(value ^ (value >>> 15), value | 1);
            value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
            return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
        };
        const scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
        const melodyContour = trackNumber === 7
            ? [0, 4, 7, 9, 7, 4, 2, 4, 0, 4, 7, 12, 9, 7, 4, 2]
            : [0, 2, 4, 2, 1, 2, 5, 4, 0, 2, 4, 5, 7, 5, 4, 2];
        const rootMidi = trackNumber === 7 ? 55 : 48 + ((trackNumber * 5) % 12);
        const toFrequency = (midiNote) => 440 * Math.pow(2, (midiNote - 69) / 12);
        const melody = melodyContour.map((degree) => {
            const variation = Math.floor(random() * 3) - 1;
            const scaleIndex = Math.max(0, Math.min(scale.length - 1, degree + variation));
            return toFrequency(rootMidi + 12 + scale[scaleIndex]);
        });
        const bassProgression = [0, 5, 3, 4].map((degree) => {
            const variation = Math.floor(random() * 2);
            return toFrequency(rootMidi - 12 + scale[(degree + variation) % scale.length]);
        });

        return {
            melody,
            bassProgression,
            beatDuration: 60 / (trackNumber === 7 ? 124 : 88 + ((trackNumber * 7) % 33)),
            melodyType: trackNumber === 7 || trackNumber % 3 === 0 ? 'triangle' : 'sine'
        };
    }

    const track = createTrack(featureNumber);
    player.dataset.tempo = String(Math.round(60 / track.beatDuration));

    function playNote(frequency, startTime, duration, volume, type) {
        const oscillator = audioContext.createOscillator();
        const envelope = audioContext.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, startTime);
        envelope.gain.setValueAtTime(0.0001, startTime);
        envelope.gain.exponentialRampToValueAtTime(volume, startTime + 0.025);
        envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        oscillator.connect(envelope);
        envelope.connect(masterGain);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration + 0.03);
    }

    function scheduleBeat() {
        const step = beatIndex % 16;
        const chord = Math.floor(beatIndex / 16) % track.bassProgression.length;
        const startTime = audioContext.currentTime + 0.04;
        if (step % 2 === 0) {
            playNote(track.bassProgression[chord], startTime, track.beatDuration * 1.7, 0.42, 'sine');
        }
        playNote(track.melody[step], startTime, track.beatDuration * 0.72, 0.3, track.melodyType);
        beatIndex += 1;
    }

    async function startMusic() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) {
                throw new Error('Audio is not supported in this browser.');
            }
            if (!audioContext) {
                audioContext = new AudioContextClass();
                masterGain = audioContext.createGain();
                outputCompressor = audioContext.createDynamicsCompressor();
                outputCompressor.threshold.value = -2;
                outputCompressor.knee.value = 4;
                outputCompressor.ratio.value = 20;
                outputCompressor.attack.value = 0.004;
                outputCompressor.release.value = 0.15;
                masterGain.gain.value = Number(volumeControl.value);
                masterGain.connect(outputCompressor);
                outputCompressor.connect(audioContext.destination);
            }
            clearTimeout(suspendTimer);
            await audioContext.resume();
            isPlaying = true;
            localStorage.setItem('myfamily-music-enabled', 'true');
            masterGain.gain.setTargetAtTime(Number(volumeControl.value), audioContext.currentTime, 0.08);
            if (!beatTimer) {
                scheduleBeat();
                beatTimer = setInterval(scheduleBeat, track.beatDuration * 1000);
            }
            toggle.setAttribute('aria-label', 'Pause background music');
            toggle.title = 'Pause background music';
            toggle.setAttribute('aria-pressed', 'true');
            status.textContent = `Music on · ${trackName}`;
        } catch (error) {
            isPlaying = false;
            localStorage.setItem('myfamily-music-enabled', 'false');
            status.textContent = error.message || 'Music unavailable';
        }
    }

    function stopMusic() {
        isPlaying = false;
        localStorage.setItem('myfamily-music-enabled', 'false');
        clearInterval(beatTimer);
        beatTimer = null;
        if (audioContext && masterGain) {
            masterGain.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.06);
            suspendTimer = setTimeout(() => {
                if (!isPlaying) audioContext.suspend();
            }, 250);
        }
        toggle.setAttribute('aria-label', 'Play background music');
        toggle.title = 'Play background music';
        toggle.setAttribute('aria-pressed', 'false');
        status.textContent = 'Music off';
    }

    toggle.addEventListener('click', () => {
        if (isPlaying) stopMusic();
        else startMusic();
    });

    volumeControl.addEventListener('input', () => {
        const volume = Number(volumeControl.value);
        localStorage.setItem('myfamily-music-volume', String(volume));
        if (isPlaying && masterGain) {
            masterGain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.04);
        }
    });

    if (localStorage.getItem('myfamily-music-enabled') === 'true') {
        startMusic();
    }
})();