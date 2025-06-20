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

balanceBtn.addEventListener("click", async () => {
  clearActive();
  balanceBtn.classList.add("active");

  const user = await loadUser();

  if (!user) {
    container.innerHTML = "<p>Ошибка загрузки данных пользователя</p>";
    return;
  }
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

  const user = window.Telegram.WebApp.initDataUnsafe?.user || {
    username: "username",
    id: "id"
  };

container.innerHTML = `
  <div class="profile-page scrollable">
    <img src="https://t.me/i/userpic/320/${user.id}.jpg" alt="Аватар" class="profile-avatar" />
    <p class="username">@${user.username || "неизвестно"}</p>

    <div class="profile-actions">
  <button class="profile-btn">
    <span class="icon">✉️</span>
    <span class="label">Поддержка</span>
  </button>
  <div class="divider"></div>
  <button class="profile-btn">
    <span class="icon">💬</span>
    <span class="label">Наш чат</span>
  </button>
  <div class="divider"></div>
  <button class="profile-btn">
    <span class="icon">🌐</span>
    <span class="label">Язык</span>
  </button>
</div>


    <h3 class="section-title">🎉 История призов</h3>
    <ul class="history-list">
      <li>Мишка 🧸 — 18.06.2025</li>
      <li>Telegram Premium 🎁 — 17.06.2025</li>
      <li>Пусто 🙁 — 16.06.2025</li>
    </ul>
  </div>
`;


  document.querySelector(".support-btn").addEventListener("click", () => {
    window.open("https://t.me/your_support_bot", "_blank");
  });
});

async function loadUser() {
  // Получаем telegram_id и username из Telegram WebApp или заглушку
  const user = window.Telegram.WebApp.initDataUnsafe?.user || { id: 123456789, username: "username" };

  try {
    const response = await fetch("http://localhost:8000/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telegram_id: user.id,
        username: user.username
      })
    });

    if (!response.ok) throw new Error("Ошибка загрузки пользователя");

    const data = await response.json();
    return data; // {telegram_id, username, balance, history}
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function updateBalance(telegram_id, amount) {
  try {
    const response = await fetch("http://localhost:8000/api/user/balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegram_id, amount })
    });
    if (!response.ok) throw new Error("Ошибка обновления баланса");
    const data = await response.json();
    return data.balance;
  } catch (e) {
    console.error(e);
    return null;
  }
}


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
