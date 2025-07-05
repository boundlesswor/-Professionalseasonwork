// Разблокировка через секретный ключ в URL
const params = new URLSearchParams(window.location.search);
if (params.get("key") === "letmein") {
  localStorage.removeItem("testBlocked");
}

// Проверка блокировки при загрузке страницы
if (localStorage.getItem("testBlocked") === "true") {
  document.getElementById("test-container").innerHTML = "<h1>Тест заблокирован из-за ухода со страницы.</h1>";
}

// Анти-чит: блокировка при покидании страницы
window.addEventListener("blur", () => {
  localStorage.setItem("testBlocked", "true");
  location.reload();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    localStorage.setItem("testBlocked", "true");
    location.reload();
  }
});

// Правильные ответы
const correctAnswers = {
  q1: "B",
  q2: "C",
  q3: "B",
  q4: "B",
  q5: "A",
  q6: "C",
  q7: "A",
  q8: "B",
  q9: "B",
  q10: "C"
};

// Таймер
let timerInterval;
function startTimer() {
  let timeLeft = 600; // 5 минут в секундах
  const timerDisplay = document.getElementById("time-left");
  document.getElementById("timer").style.display = "block";

  timerInterval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timerInterval);
      document.getElementById("test-form").dispatchEvent(new Event("submit"));
    }
  }, 1000);
}

// Начало теста
function startTest() {
  const fullnameInput = document.getElementById("fullname");
  if (!fullnameInput.value.match(/^[A-Za-z\s]+$/)) {
    alert("ФИО должно содержать только латинские буквы и пробелы!");
    return;
  }
  document.getElementById("name-section").style.display = "none";
  document.getElementById("test-form").style.display = "block";
  localStorage.setItem("fullname", fullnameInput.value);
  startTimer(); // Запускаем таймер
}

// Обработка отправки формы
document.getElementById("test-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  clearInterval(timerInterval); // Останавливаем таймер
  let score = 0;
  const formData = new FormData(e.target);

  // Подсчёт баллов
  for (let i = 1; i <= 10; i++) {
    if (formData.get(`q${i}`) === correctAnswers[`q${i}`]) {
      score++;
    }
  }

  // Получение открытых ответов
  const openAnswers = [
    formData.get("q11") || "",
    formData.get("q12") || "",
    formData.get("q13") || "",
    formData.get("q14") || "",
    formData.get("q15") || ""
  ];

  // Отправка в Google Таблицу
  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbyLTpiCPzOLIilclU4ct06SOZNfDPRWdMthlxc2Y7bSk3Ezo1AO9Ec-cuhvtC2ei9nb_A/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        fullname: localStorage.getItem("fullname"),
        score: score,
        q11: openAnswers[0],
        q12: openAnswers[1],
        q13: openAnswers[2],
        q14: openAnswers[3],
        q15: openAnswers[4]
      })
    });

    if (response.ok) {
      document.getElementById("test-form").style.display = "none";
      document.getElementById("result").style.display = "block";
      document.getElementById("result").innerHTML = `Ваш результат: ${score}/10. Данные отправлены!`;
    } else {
      alert("Ошибка при отправке данных в Google Таблицу.");
    }
  } catch (error) {
    alert("Сетевая ошибка: " + error.message);
  }

  localStorage.removeItem("testBlocked");
  localStorage.removeItem("fullname");
});