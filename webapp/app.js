const casesContainer = document.getElementById("cases");
const resultBox = document.getElementById("result");

async function loadCases() {
  try {
    const response = await fetch("https://droplixbot.onrender.com/api/cases");
    const cases = await response.json();

    casesContainer.innerHTML = ""; // очистить

    cases.forEach(c => {
      const btn = document.createElement("button");
      btn.innerText = c.name;
      btn.className = "case-button";  // для стилей, если нужно
      btn.onclick = () => openCase(c.id);
      casesContainer.appendChild(btn);
    });
  } catch (err) {
    resultBox.innerText = "❌ Ошибка при загрузке кейсов";
  }
}

async function openCase(caseId) {
  resultBox.innerText = "Открываем кейс... 🎲";

  try {
    const response = await fetch(`https://droplixbot.onrender.com/api/open-case?case_id=${caseId}`);
    const data = await response.json();

    if(data.error) {
      resultBox.innerText = "❌ " + data.error;
    } else {
      resultBox.innerText = `🔥 Вам выпало: ${data.prize}`;
    }
  } catch (err) {
    resultBox.innerText = "❌ Ошибка при открытии кейса";
  }
}

// Запускаем загрузку кейсов после загрузки страницы
window.Telegram.WebApp.ready();
loadCases();
