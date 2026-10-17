    let secretNumber = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;

    function checkGuess() {
      const guess = Number(document.getElementById('guessInput').value);
      const resultEl = document.getElementById('result');
      attempts++;

      if (guess < 1 || guess > 100 || isNaN(guess)) {
        resultEl.textContent = `⚠️ ${FeatureI18n.translate('guessInvalid')}`;
        resultEl.style.color = "#fffacd";
      } else if (guess < secretNumber) {
        resultEl.textContent = `🔽 ${FeatureI18n.translate('guessLow')}`;
        resultEl.style.color = "#ffd700";
      } else if (guess > secretNumber) {
        resultEl.textContent = `🔼 ${FeatureI18n.translate('guessHigh')}`;
        resultEl.style.color = "#ffa07a";
      } else {
        resultEl.textContent = `🎉 ${FeatureI18n.translate('guessWin', { n: attempts })}`;
        resultEl.style.color = "#00ffcc";
      }
    }
