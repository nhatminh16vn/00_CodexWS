(() => {
    let audioContext;
    const sounds = {
        tap: { notes: [520], type: 'sine', duration: 0.07, volume: 0.12 },
        flip: { notes: [420, 620], type: 'triangle', duration: 0.09, volume: 0.13 },
        success: { notes: [523, 659, 784], type: 'sine', duration: 0.16, volume: 0.18 },
        win: { notes: [523, 659, 784, 1047], type: 'triangle', duration: 0.18, volume: 0.2 },
        miss: { notes: [260, 190], type: 'sawtooth', duration: 0.12, volume: 0.09 },
        start: { notes: [392, 523, 659], type: 'triangle', duration: 0.11, volume: 0.15 }
    };

    window.playGameSound = function (name) {
        const sound = sounds[name] || sounds.tap;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        try {
            audioContext ||= new AudioContextClass();
            if (audioContext.state === 'suspended') audioContext.resume();
            sound.notes.forEach((frequency, index) => {
                const startTime = audioContext.currentTime + index * sound.duration * 0.82;
                const oscillator = audioContext.createOscillator();
                const envelope = audioContext.createGain();
                oscillator.type = sound.type;
                oscillator.frequency.setValueAtTime(frequency, startTime);
                envelope.gain.setValueAtTime(0.0001, startTime);
                envelope.gain.exponentialRampToValueAtTime(sound.volume, startTime + 0.015);
                envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + sound.duration);
                oscillator.connect(envelope);
                envelope.connect(audioContext.destination);
                oscillator.start(startTime);
                oscillator.stop(startTime + sound.duration + 0.02);
            });
        } catch (error) {
            console.warn('Game sound could not play:', error);
        }
    };

    window.playGameTone = function (frequency) {
        if (!Number.isFinite(frequency) || frequency < 100 || frequency > 1500) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        try {
            audioContext ||= new AudioContextClass();
            if (audioContext.state === 'suspended') audioContext.resume();
            const oscillator = audioContext.createOscillator();
            const envelope = audioContext.createGain();
            const startTime = audioContext.currentTime;
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, startTime);
            envelope.gain.setValueAtTime(0.0001, startTime);
            envelope.gain.exponentialRampToValueAtTime(0.18, startTime + 0.02);
            envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.24);
            oscillator.connect(envelope);
            envelope.connect(audioContext.destination);
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.26);
        } catch (error) {
            console.warn('Game tone could not play:', error);
        }
    };
})();