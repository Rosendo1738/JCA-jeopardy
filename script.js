// --- Japanese Jeopardy Data ---
const defaultData = [
  {
    category: "Characters（文字）",
    questions: [
      { value: 100, question: "What does the kanji 水 mean?" },
      {
        value: 200,
        question:
          "Which of the following is *not* a real katakana character? ア, ク, ツ, ぬ",
      },
      {
        value: 300,
        question: "Give the *onyomi* and *kunyomi* readings for 日.",
      },
      { value: 400, question: "Which kanji means 'study' or 'learning'?" },
      { value: 500, question: "Write the kanji for 'to think' (as in 思う)." },
    ],
  },
  {
    category: "Grammar（文法）",
    questions: [
      { value: 100, question: "What particle means 'to' or 'toward' a place?" },
      { value: 200, question: "What is the difference between は and が?" },
      { value: 300, question: "Conjugate the verb 食べる into its て-form." },
      { value: 400, question: "Translate and explain: 学生でもいいです." },
      {
        value: 500,
        question: "What is the conditional form (〜たら) of 行く?",
      },
    ],
  },
  {
    category: "Vocabulary（語彙）",
    questions: [
      { value: 100, question: "What does いぬ mean?" },
      { value: 200, question: "Translate to Japanese: 'library'." },
      {
        value: 300,
        question: "What is the opposite of 高い (expensive/tall)?",
      },
      { value: 400, question: "What’s the Japanese word for 'to borrow'?" },
      {
        value: 500,
        question: "What is the difference between 思う and 考える?",
      },
    ],
  },
  {
    category: "Expressions（表現）",
    questions: [
      { value: 100, question: "How do you say 'Nice to meet you' politely?" },
      { value: 200, question: "What does お疲れ様です mean in context?" },
      { value: 300, question: "Translate: よろしくお願いします." },
      { value: 400, question: "How do you apologize casually to a friend?" },
      { value: 500, question: "What does the phrase 仕方がない express?" },
    ],
  },
  {
    category: "Culture（文化）",
    questions: [
      { value: 100, question: "What do people eat on お正月 (New Year’s)?" },
      { value: 200, question: "Where is Mount Fuji located?" },
      { value: 300, question: "What is the name of Japan’s bullet train?" },
      { value: 400, question: "What holiday celebrates cherry blossoms?" },
      { value: 500, question: "What is the difference between 神社 and お寺?" },
    ],
  },
];

// --- Game State ---
let gameData = JSON.parse(localStorage.getItem("jeopardyData")) || defaultData;
let editMode = false;
let teamScores = { 1: 0, 2: 0 };

// --- DOM References ---
const board = document.getElementById("board");
const modal = document.getElementById("modal");
const questionText = document.getElementById("question-text");
const questionEditor = document.getElementById("question-editor");
const modalTitle = document.getElementById("modal-title");
const saveBtn = document.getElementById("save-btn");
const closeBtn = document.getElementById("close-btn");
const modeToggle = document.getElementById("mode-toggle");
const resetBtn = document.getElementById("reset-btn");
const score1 = document.getElementById("score1");
const score2 = document.getElementById("score2");
const award1 = document.getElementById("award1");
const award2 = document.getElementById("award2");
const subtract1 = document.getElementById("subtract1");
const subtract2 = document.getElementById("subtract2");

let currentCategory = null;
let currentIndex = null;
let currentCell = null;

// --- Board Rendering ---
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
  currentCategory = catIndex;
  currentIndex = qIndex;
  currentCell = cell;

  const questionObj = gameData[catIndex].questions[qIndex];
  modal.dataset.value = questionObj.value;
  modal.style.display = "flex";
  modalTitle.textContent = `${gameData[catIndex].category} - ${questionObj.value} pts`;

  if (editMode) {
    questionEditor.style.display = "block";
    saveBtn.style.display = "inline-block";
    questionText.style.display = "none";
    questionEditor.value = questionObj.question;
  } else {
    questionText.textContent = questionObj.question;
    questionText.style.display = "block";
    questionEditor.style.display = "none";
    saveBtn.style.display = "none";
  }
}

function saveQuestion() {
  const newText = questionEditor.value.trim();
  if (newText) {
    gameData[currentCategory].questions[currentIndex].question = newText;
    localStorage.setItem("jeopardyData", JSON.stringify(gameData));
  }
  closeModal();
}

function closeModal() {
  modal.style.display = "none";
  if (currentCell) currentCell.classList.add("used");
}

// --- Scoring ---
function updateScore(team, delta) {
  teamScores[team] += delta;
  const el = document.getElementById(`score${team}`);
  el.textContent = teamScores[team];
  el.style.transform = "scale(1.3)";
  setTimeout(() => (el.style.transform = "scale(1)"), 200);
}

// --- Scoring Buttons ---
award1.onclick = () => {
  const value = Number(modal.dataset.value);
  updateScore(1, value);
  closeModal();
};

award2.onclick = () => {
  const value = Number(modal.dataset.value);
  updateScore(2, value);
  closeModal();
};

subtract1.onclick = () => {
  const value = Number(modal.dataset.value);
  updateScore(1, -value);
  closeModal();
};

subtract2.onclick = () => {
  const value = Number(modal.dataset.value);
  updateScore(2, -value);
  closeModal();
};

// --- Mode Toggle ---
modeToggle.onclick = () => {
  editMode = !editMode;
  modeToggle.textContent = editMode
    ? "Switch to Play Mode 🎮"
    : "Switch to Edit Mode ✏️";
};

// --- Reset ---
resetBtn.onclick = () => {
  if (confirm("Reset all questions to default?")) {
    localStorage.removeItem("jeopardyData");
    gameData = JSON.parse(JSON.stringify(defaultData));
    renderBoard();
    teamScores = { 1: 0, 2: 0 };
    score1.textContent = 0;
    score2.textContent = 0;
  }
};

// --- Init ---
closeBtn.onclick = closeModal;
saveBtn.onclick = saveQuestion;
renderBoard();
