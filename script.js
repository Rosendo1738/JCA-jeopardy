// --- Default Jeopardy Data ---
const defaultData = [
  {
    category: "Characters（文字）",
    questions: [
      { value: 100, question: "What does the kanji 水 mean?", answer: "Water" },
      {
        value: 200,
        question:
          "Which of the following is *not* a real katakana character? ア, ク, ツ, ぬ",
        answer: "ぬ",
      },
      {
        value: 300,
        question: "Give the *onyomi* and *kunyomi* readings for 日.",
        answer: "Onyomi: ニチ・ジツ / Kunyomi: ひ・か",
      },
      {
        value: 400,
        question: "Which kanji means 'study' or 'learning'?",
        answer: "学 (がく / まなぶ)",
      },
      {
        value: 500,
        question: "Write the kanji for 'to think' (as in 思う).",
        answer: "思",
      },
    ],
  },
  {
    category: "Grammar（文法）",
    questions: [
      {
        value: 100,
        question: "What particle means 'to' or 'toward' a place?",
        answer: "へ (e)",
      },
      {
        value: 200,
        question: "What is the difference between は and が?",
        answer: "は = topic marker; が = subject marker",
      },
      {
        value: 300,
        question: "Conjugate the verb 食べる into its て-form.",
        answer: "食べて",
      },
      {
        value: 400,
        question: "Translate and explain: 学生でもいいです.",
        answer: "It's okay even if (you are) a student.",
      },
      {
        value: 500,
        question: "What is the conditional form (〜たら) of 行く?",
        answer: "行ったら",
      },
    ],
  },
  {
    category: "Vocabulary（語彙）",
    questions: [
      { value: 100, question: "What does いぬ mean?", answer: "Dog" },
      {
        value: 200,
        question: "Translate to Japanese: 'library'.",
        answer: "としょかん（図書館）",
      },
      {
        value: 300,
        question: "What is the opposite of 高い (expensive/tall)?",
        answer: "安い (cheap/short)",
      },
      {
        value: 400,
        question: "What’s the Japanese word for 'to borrow'?",
        answer: "かりる (借りる)",
      },
      {
        value: 500,
        question: "What is the difference between 思う and 考える?",
        answer:
          "思う = to think (feel, believe); 考える = to think (analyze, reason)",
      },
    ],
  },
  {
    category: "Expressions（表現）",
    questions: [
      {
        value: 100,
        question: "How do you say 'Nice to meet you' politely?",
        answer: "はじめまして / よろしくお願いします",
      },
      {
        value: 200,
        question: "What does お疲れ様です mean in context?",
        answer: "Thank you for your hard work.",
      },
      {
        value: 300,
        question: "Translate: よろしくお願いします.",
        answer: "Please take care of me / Nice to meet you.",
      },
      {
        value: 400,
        question: "How do you apologize casually to a friend?",
        answer: "ごめん / ごめんなさい",
      },
      {
        value: 500,
        question: "What does the phrase 仕方がない express?",
        answer: "It can’t be helped.",
      },
    ],
  },
  {
    category: "Culture（文化）",
    questions: [
      {
        value: 100,
        question: "What do people eat on お正月 (New Year’s)?",
        answer: "おせち料理 (traditional New Year dishes)",
      },
      {
        value: 200,
        question: "Where is Mount Fuji located?",
        answer: "Between Shizuoka and Yamanashi Prefectures",
      },
      {
        value: 300,
        question: "What is the name of Japan’s bullet train?",
        answer: "新幹線 (Shinkansen)",
      },
      {
        value: 400,
        question: "What holiday celebrates cherry blossoms?",
        answer: "花見 (Hanami)",
      },
      {
        value: 500,
        question: "What is the difference between 神社 and お寺?",
        answer: "神社 = Shinto shrine; お寺 = Buddhist temple",
      },
    ],
  },
];

// --- Game State ---
let gameData = JSON.parse(localStorage.getItem("jeopardyData")) || defaultData;
let editMode = false;
let teamScores = { 1: 0, 2: 0 };
let autoFlipTimer = null;

// --- Settings ---
let settings = JSON.parse(localStorage.getItem("jeopardySettings")) || {
  revealDelay: 3,
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
const award1 = document.getElementById("award1");
const award2 = document.getElementById("award2");
const subtract1 = document.getElementById("subtract1");
const subtract2 = document.getElementById("subtract2");
const revealBtn = document.getElementById("reveal-btn");
const flipInner = document.getElementById("flip-inner");

let currentCategory = null;
let currentIndex = null;
let currentCell = null;

// --- Render Board ---
function renderBoard() {
  board.innerHTML = "";
  gameData.forEach((cat) => {
    const header = document.createElement("div");
    header.className = "category";
    header.textContent = cat.category;
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
    autoFlipTimer = setTimeout(
      () => flipInner.classList.add("flipped"),
      settings.revealDelay * 1000
    );
  }
}

function saveQuestion() {
  const newQ = questionEditor.value.trim();
  const newA = answerEditor.value.trim();
  if (newQ) gameData[currentCategory].questions[currentIndex].question = newQ;
  gameData[currentCategory].questions[currentIndex].answer =
    newA || "No answer provided.";
  localStorage.setItem("jeopardyData", JSON.stringify(gameData));

  // Reset used status after edit
  if (currentCell) currentCell.classList.remove("used");
  closeModal();
}

function closeModal() {
  modal.style.display = "none";
  clearTimeout(autoFlipTimer);
  // Don’t mark used if in edit mode
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
subtract1.onclick = () => {
  updateScore(1, -Number(modal.dataset.value));
  closeModal();
};
subtract2.onclick = () => {
  updateScore(2, -Number(modal.dataset.value));
  closeModal();
};

// --- Mode Toggle ---
modeToggle.onclick = () => {
  editMode = !editMode;
  modeToggle.textContent = editMode
    ? "Switch to Play Mode 🎮"
    : "Switch to Edit Mode ✏️";
  renderBoard(); // refresh click handlers
};

// --- Reset (scores only) ---
resetBtn.onclick = () => {
  if (
    confirm("Reset scores and clear used questions? (Your edits stay saved)")
  ) {
    teamScores = { 1: 0, 2: 0 };
    score1.textContent = 0;
    score2.textContent = 0;
    document
      .querySelectorAll(".cell.used")
      .forEach((cell) => cell.classList.remove("used"));
    modal.style.display = "none";
  }
};

// --- EXPORT QUESTIONS / ANSWERS ---
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

// --- IMPORT QUESTIONS / ANSWERS ---
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

// --- Settings Modal Logic ---
const settingsModal = document.getElementById("settings-modal");
const settingsBtn = document.getElementById("settings-btn");
const revealInput = document.getElementById("reveal-speed");
const saveSettingsBtn = document.getElementById("save-settings");
const closeSettingsBtn = document.getElementById("close-settings");

settingsBtn.addEventListener("click", () => {
  revealInput.value = settings.revealDelay;
  settingsModal.style.display = "flex";
});

closeSettingsBtn.addEventListener("click", () => {
  settingsModal.style.display = "none";
});

saveSettingsBtn.addEventListener("click", () => {
  const newSpeed = parseFloat(revealInput.value);
  if (!isNaN(newSpeed) && newSpeed >= 1 && newSpeed <= 10) {
    settings.revealDelay = newSpeed;
    localStorage.setItem("jeopardySettings", JSON.stringify(settings));
    alert(`✅ Reveal speed set to ${newSpeed}s`);
    settingsModal.style.display = "none";
  } else {
    alert("⚠️ Please enter a number between 1 and 10.");
  }
});

// --- Init ---
closeBtn.onclick = closeModal;
saveBtn.onclick = saveQuestion;
renderBoard();
