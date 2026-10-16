    let secretNumber = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;

    function checkGuess() {
      const guess = Number(document.getElementById('guessInput').value);
      const resultEl = document.getElementById('result');
      attempts++;

      if (guess < 1 || guess > 100 || isNaN(guess)) {
        resultEl.textContent = "⚠️ Vui lòng nhập số từ 1 đến 100!";
        resultEl.style.color = "#fffacd";
      } else if (guess < secretNumber) {
        resultEl.textContent = "🔽 Số bạn đoán quá nhỏ!";
        resultEl.style.color = "#ffd700";
      } else if (guess > secretNumber) {
        resultEl.textContent = "🔼 Số bạn đoán quá lớn!";
        resultEl.style.color = "#ffa07a";
      } else {
        resultEl.textContent = `🎉 Chính xác! Bạn đoán đúng sau ${attempts} lần!`;
        resultEl.style.color = "#00ffcc";
      }
    }