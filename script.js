// --- Game Defaults ---
const defaultData = [
  {
    category: "Characters",
    questions: [
      { value: 100, question: "What is ひらがな?", answer: "Hiragana" },
      { value: 200, question: "What is カタカナ?", answer: "Katakana" },
      { value: 300, question: "What is 漢字?", answer: "Kanji" },
      { value: 400, question: "How many kana exist?", answer: "46 each" },
      {
        value: 500,
        question: "What’s the kanji for 'mountain'?",
        answer: "山 (yama)",
      },
    ],
  },
  {
    category: "Grammar",
    questions: [
      {
        value: 100,
        question: "What does です mean?",
        answer: "To be (polite copula)",
      },
      {
        value: 200,
        question: "When do you use は vs が?",
        answer: "Topic vs subject",
      },
      {
        value: 300,
        question: "What’s the function of の?",
        answer: "Possession / nominalizer",
      },
      {
        value: 400,
        question: "What’s the て-form used for?",
        answer: "Connecting verbs or requests",
      },
      {
        value: 500,
        question: "What’s the plain form of 食べます?",
        answer: "食べる (taberu)",
      },
    ],
  },
  {
    category: "Vocabulary",
    questions: [
      { value: 100, question: "What does 水 mean?", answer: "Water" },
      { value: 200, question: "What does 山 mean?", answer: "Mountain" },
      { value: 300, question: "What does 学校 mean?", answer: "School" },
      { value: 400, question: "What does 先生 mean?", answer: "Teacher" },
      { value: 500, question: "What does 大学 mean?", answer: "University" },
    ],
  },
  {
    category: "Particles",
    questions: [
      {
        value: 100,
        question: "What does で indicate?",
        answer: "Location of action",
      },
      {
        value: 200,
        question: "What does に indicate?",
        answer: "Direction or time",
      },
      {
        value: 300,
        question: "What does を indicate?",
        answer: "Direct object",
      },
      { value: 400, question: "What does と indicate?", answer: "With / and" },
      {
        value: 500,
        question: "What does から mean?",
        answer: "From / because",
      },
    ],
  },
  {
    category: "Culture",
    questions: [
      { value: 100, question: "What is おにぎり?", answer: "Rice ball" },
      {
        value: 200,
        question: "What is the capital of Japan?",
        answer: "Tokyo",
      },
      { value: 300, question: "What is おはよう?", answer: "Good morning" },
      { value: 400, question: "What is ありがとう?", answer: "Thank you" },
      { value: 500, question: "What is さようなら?", answer: "Goodbye" },
    ],
  },
];

// --- Game State ---
let gameData = JSON.parse(localStorage.getItem("jeopardyData")) || defaultData;
let editMode = false;
let teamScores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
let autoFlipTimer = null;
let countdownTimer = null;
let timeLeft = 30;

// --- Settings ---
let settings = JSON.parse(localStorage.getItem("jeopardySettings")) || {
  revealDelay: 0, // 0 = no auto reveal
  timerLength: 30, // adjustable countdown
};

// --- DOM References ---
const board = document.getElementById("board");
const modal = document.getElementById("modal");
const questionText = document.getElementById("question-text");
const answerText = document.getElementById("answer-text");
const questionEditor = document.getElementById("question-editor");
const answerEditor = document.getElementById("answer-editor");
const modalTitle = document.getElementById("modal-title");
const saveBtn = document.getElementById("save-btn");
const closeBtn = document.getElementById("close-btn");
const modeToggle = document.getElementById("mode-toggle");
const resetBtn = document.getElementById("reset-btn");
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFile = document.getElementById("import-file");
const score1 = document.getElementById("score1");
const score2 = document.getElementById("score2");
const score3 = document.getElementById("score3");
const score4 = document.getElementById("score4");
const score5 = document.getElementById("score5");
const award1 = document.getElementById("award1");
const award2 = document.getElementById("award2");
const award3 = document.getElementById("award3");
const award4 = document.getElementById("award4");
const award5 = document.getElementById("award5");
const subtract1 = document.getElementById("subtract1");
const subtract2 = document.getElementById("subtract2");
const subtract3 = document.getElementById("subtract3");
const subtract4 = document.getElementById("subtract4");
const subtract5 = document.getElementById("subtract5");
const revealBtn = document.getElementById("reveal-btn");
const flipInner = document.getElementById("flip-inner");

let currentCategory = null;
let currentIndex = null;
let currentCell = null;

// --- Render Board ---
function renderBoard() {
  board.innerHTML = "";

  gameData.forEach((cat, catIndex) => {
    const header = document.createElement("div");
    header.className = "category";

    if (editMode) {
      const input = document.createElement("input");
      input.type = "text";
      input.value = cat.category;
      input.className = "category-input";

      const saveCategory = () => {
        const newName = input.value.trim();
        if (newName) {
          gameData[catIndex].category = newName;
          localStorage.setItem("jeopardyData", JSON.stringify(gameData));
        }
      };

      input.addEventListener("change", saveCategory);
      input.addEventListener("blur", saveCategory);
      header.appendChild(input);
    } else {
      header.textContent = cat.category;
    }

    board.appendChild(header);
  });

  for (let i = 0; i < 5; i++) {
    gameData.forEach((cat, catIndex) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = `$${cat.questions[i].value}`;
      cell.onclick = () => openModal(catIndex, i, cell);
      board.appendChild(cell);
    });
  }
}

// --- Modal Handling ---
function openModal(catIndex, qIndex, cell) {
  clearTimeout(autoFlipTimer);
  currentCategory = catIndex;
  currentIndex = qIndex;
  currentCell = cell;

  const qObj = gameData[catIndex].questions[qIndex];
  modal.dataset.value = qObj.value;
  modal.style.display = "flex";
  modalTitle.textContent = `${gameData[catIndex].category} - ${qObj.value} pts`;

  questionText.textContent = qObj.question;
  answerText.textContent = qObj.answer || "No answer provided.";
  flipInner.classList.remove("flipped");

  startTimer();

  if (editMode) {
    flipInner.style.display = "none";
    questionEditor.style.display = "block";
    answerEditor.style.display = "block";
    saveBtn.style.display = "inline-block";
    questionEditor.value = qObj.question;
    answerEditor.value = qObj.answer || "";
  } else {
    flipInner.style.display = "block";
    questionEditor.style.display = "none";
    answerEditor.style.display = "none";
    saveBtn.style.display = "none";
  }
}

function saveQuestion() {
  const newQ = questionEditor.value.trim();
  const newA = answerEditor.value.trim();
  if (newQ) gameData[currentCategory].questions[currentIndex].question = newQ;
  gameData[currentCategory].questions[currentIndex].answer =
    newA || "No answer provided.";
  localStorage.setItem("jeopardyData", JSON.stringify(gameData));

  if (currentCell) currentCell.classList.remove("used");
  closeModal();
}

function closeModal() {
  stopTimer();
  document.getElementById("timer-display").textContent = "";
  modal.style.display = "none";
  clearTimeout(autoFlipTimer);
  if (!editMode && currentCell) currentCell.classList.add("used");
}

// --- Reveal / Scoring ---
revealBtn.onclick = () => flipInner.classList.toggle("flipped");

function updateScore(team, delta) {
  teamScores[team] += delta;
  const el = document.getElementById(`score${team}`);
  el.textContent = teamScores[team];
  el.style.transform = "scale(1.3)";
  setTimeout(() => (el.style.transform = "scale(1)"), 200);
}

award1.onclick = () => {
  updateScore(1, Number(modal.dataset.value));
  closeModal();
};
award2.onclick = () => {
  updateScore(2, Number(modal.dataset.value));
  closeModal();
};
award3.onclick = () => {
  updateScore(3, Number(modal.dataset.value));
  closeModal();
};
award4.onclick = () => {
  updateScore(4, Number(modal.dataset.value));
  closeModal();
};
award5.onclick = () => {
  updateScore(5, Number(modal.dataset.value));
  closeModal();
};

subtract1.onclick = () => {
  updateScore(1, -Number(modal.dataset.value));
  closeModal();
};
subtract2.onclick = () => {
  updateScore(2, -Number(modal.dataset.value));
  closeModal();
};
subtract3.onclick = () => {
  updateScore(3, -Number(modal.dataset.value));
  closeModal();
};
subtract4.onclick = () => {
  updateScore(4, -Number(modal.dataset.value));
  closeModal();
};
subtract5.onclick = () => {
  updateScore(5, -Number(modal.dataset.value));
  closeModal();
};

// --- Mode Toggle ---
modeToggle.onclick = () => {
  editMode = !editMode;
  modeToggle.textContent = editMode
    ? "Switch to Play Mode 🎮"
    : "Switch to Edit Mode ✏️";
  renderBoard();
};

// --- Reset Scores ---
resetBtn.onclick = () => {
  if (confirm("Reset scores and clear used questions? (Edits stay saved)")) {
    teamScores = { 1: 0, 2: 0 };
    score1.textContent = 0;
    score2.textContent = 0;
    score1.textContent = 0;
    score2.textContent = 0;
    score3.textContent = 0;
    score4.textContent = 0;
    score5.textContent = 0;
    document
      .querySelectorAll(".cell.used")
      .forEach((c) => c.classList.remove("used"));
    modal.style.display = "none";
  }
};

// --- Export / Import ---
exportBtn.addEventListener("click", () => {
  try {
    const blob = new Blob([JSON.stringify(gameData, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "jeopardy_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    alert("✅ File exported successfully!");
  } catch (err) {
    alert("⚠️ Export failed: " + err.message);
  }
});

importBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const imported = JSON.parse(evt.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid JSON format");
      gameData = imported;
      localStorage.setItem("jeopardyData", JSON.stringify(gameData));
      renderBoard();
      alert("✅ Questions imported successfully!");
    } catch (err) {
      alert("⚠️ Failed to import: " + err.message);
    }
  };
  reader.readAsText(file);
});

// --- Manual Score Adjust Buttons ---
document
  .getElementById("plus1")
  .addEventListener("click", () => updateScore(1, 100));
document
  .getElementById("minus1")
  .addEventListener("click", () => updateScore(1, -100));
document
  .getElementById("plus2")
  .addEventListener("click", () => updateScore(2, 100));
document
  .getElementById("minus2")
  .addEventListener("click", () => updateScore(2, -100));
document
  .getElementById("plus3")
  .addEventListener("click", () => updateScore(3, 100));
document
  .getElementById("minus3")
  .addEventListener("click", () => updateScore(3, -100));

document
  .getElementById("plus4")
  .addEventListener("click", () => updateScore(4, 100));
document
  .getElementById("minus4")
  .addEventListener("click", () => updateScore(4, -100));

document
  .getElementById("plus5")
  .addEventListener("click", () => updateScore(5, 100));
document
  .getElementById("minus5")
  .addEventListener("click", () => updateScore(5, -100));

// --- Settings Modal Logic ---
const settingsModal = document.getElementById("settings-modal");
const settingsBtn = document.getElementById("settings-btn");
const revealInput = document.getElementById("reveal-speed");
const timerInput = document.getElementById("timer-length");
const saveSettingsBtn = document.getElementById("save-settings");
const closeSettingsBtn = document.getElementById("close-settings");

settingsBtn.addEventListener("click", () => {
  revealInput.value = settings.revealDelay;
  timerInput.value = settings.timerLength;
  settingsModal.style.display = "flex";
});

closeSettingsBtn.addEventListener("click", () => {
  settingsModal.style.display = "none";
});

saveSettingsBtn.addEventListener("click", () => {
  const newReveal = parseFloat(revealInput.value);
  const newTimer = parseInt(timerInput.value);

  if (
    !isNaN(newReveal) &&
    newReveal >= 0 &&
    newReveal <= 10 &&
    !isNaN(newTimer) &&
    newTimer >= 5 &&
    newTimer <= 120
  ) {
    settings.revealDelay = newReveal;
    settings.timerLength = newTimer;
    localStorage.setItem("jeopardySettings", JSON.stringify(settings));
    alert(`✅ Settings saved! Timer = ${newTimer}s`);
    settingsModal.style.display = "none";
  } else {
    alert("⚠️ Enter valid values (Reveal 0–10s, Timer 5–120s).");
  }
});

// --- Help Popup Logic ---
const helpCard = document.getElementById("help-card");
const helpBtn = document.getElementById("help-btn");
const helpBox = document.querySelector(".help-box");
const closeHelp = document.getElementById("close-help");

helpBtn.addEventListener("click", () => {
  helpCard.style.display = "flex";
  setTimeout(() => helpBox.classList.add("show"), 50);
});
closeHelp.addEventListener("click", () => {
  helpBox.classList.remove("show");
  setTimeout(() => (helpCard.style.display = "none"), 200);
});

// --- Timer Logic ---
function startTimer() {
  clearInterval(countdownTimer);
  const timerDisplay = document.getElementById("timer-display");

  timeLeft = settings.timerLength || 30;
  timerDisplay.textContent = timeLeft;
  timerDisplay.classList.remove("warning");

  countdownTimer = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      timerDisplay.textContent = timeLeft;
      if (timeLeft <= 5) timerDisplay.classList.add("warning");
    } else {
      timerDisplay.textContent = "⏰ TIME!";
      timerDisplay.classList.add("warning");
      stopTimer();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(countdownTimer);
  countdownTimer = null;
}

// --- Init ---
closeBtn.onclick = closeModal;
saveBtn.onclick = saveQuestion;
renderBoard();
