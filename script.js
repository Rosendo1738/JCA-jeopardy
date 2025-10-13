// --- Japanese Jeopardy Data (with answers) ---
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

    autoFlipTimer = setTimeout(() => flipInner.classList.add("flipped"), 3000);
  }
}

function saveQuestion() {
  const newQ = questionEditor.value.trim();
  const newA = answerEditor.value.trim();
  if (newQ) gameData[currentCategory].questions[currentIndex].question = newQ;
  gameData[currentCategory].questions[currentIndex].answer =
    newA || "No answer provided.";

  localStorage.setItem("jeopardyData", JSON.stringify(gameData));
  closeModal();
}

function closeModal() {
  modal.style.display = "none";
  clearTimeout(autoFlipTimer);
  if (currentCell) currentCell.classList.add("used");
}

// --- Reveal ---
revealBtn.onclick = () => flipInner.classList.toggle("flipped");

// --- Scoring ---
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
};

// --- Reset ---
resetBtn.onclick = () => {
  if (
    confirm(
      "Reset scores and clear used questions? (Your edits will stay saved)"
    )
  ) {
    // keep custom gameData intact
    teamScores = { 1: 0, 2: 0 };
    score1.textContent = 0;
    score2.textContent = 0;

    // remove "used" visual tags
    document.querySelectorAll(".cell.used").forEach((cell) => {
      cell.classList.remove("used");
    });

    // close modal if open
    modal.style.display = "none";
  }
};

// --- Init ---
closeBtn.onclick = closeModal;
saveBtn.onclick = saveQuestion;
renderBoard();
