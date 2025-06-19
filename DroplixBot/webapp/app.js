document.getElementById("openCase").addEventListener("click", async () => {
  const resultBox = document.getElementById("result");

  resultBox.innerText = "Открываем кейс... 🎲";

  try {
    const response = await fetch("http://localhost:8000/api/open-case");
    const data = await response.json();
    resultBox.innerText = `🔥 Вам выпало: ${data.prize}`;
  } catch (err) {
    resultBox.innerText = "❌ Ошибка при открытии кейса";
  }
});

window.Telegram.WebApp.ready();