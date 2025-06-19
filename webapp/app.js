window.Telegram.WebApp.ready();

const balanceBtn = document.getElementById("balanceBtn");
const casesBtn = document.getElementById("casesBtn");
const profileBtn = document.getElementById("profileBtn");
const container = document.querySelector(".container");

function clearActive() {
  balanceBtn.classList.remove("active");
  casesBtn.classList.remove("active");
  profileBtn.classList.remove("active");
}

balanceBtn.addEventListener("click", () => {
  clearActive(); // если у тебя есть функция для снятия активности с кнопок
  balanceBtn.classList.add("active");
  container.innerHTML = `
    <img src="https://i.postimg.cc/3xL5hMSJ/20250619-1524-Droplix-Logo-Design-simple-compose-01jy429003e9srnd7yx1qqfdvj.png" alt="Логотип" class="logo" />
    <h1>🎁 DroplixBot</h1>
    <p class="project-description">Открой кейсы и получи ценные призы прямо в Telegram!</p>
    <div class="balance-page">
      <div class="balance-display">
        <span>Баланс:</span>
        <span class="balance-amount">1000💰</span>
      </div>
      <button id="topUpBtn" class="btn-topup">Пополнить баланс</button>
    </div>
  `;

  document.getElementById("topUpBtn").addEventListener("click", () => {
    alert("Функция пополнения пока не реализована.");
  });
});


casesBtn.addEventListener("click", () => {
  clearActive();
  casesBtn.classList.add("active");

  // Меняем содержимое
  container.innerHTML = `
    <h2>Кейсы</h2>
    <div id="cases"></div>
    <div id="result" class="result-box"></div>
  `;

  // Подождем, пока DOM обновится, и вызовем функцию
  setTimeout(() => {
    loadCases();
  }, 0);
});


profileBtn.addEventListener("click", () => {
  clearActive();
  profileBtn.classList.add("active");
  container.innerHTML = `
    <h2>Профиль</h2>
    <p>Имя: Никита</p>
    <p>Email: nikita@example.com</p>
  `;
});

// Функция для загрузки кейсов с сервера и создания кнопок
async function loadCases() {
  const casesContainer = document.getElementById("cases");
  const resultBox = document.getElementById("result");
  try {
    const response = await fetch("https://droplixbot.onrender.com/api/cases");
    const cases = await response.json();

    casesContainer.innerHTML = ""; // очистить контейнер

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

// Функция открытия выбранного кейса
async function openCase(caseId) {
  const resultBox = document.getElementById("result");
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

// По умолчанию показываем вкладку Баланс
balanceBtn.click();
