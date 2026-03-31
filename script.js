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

// --- Dynamic Teams ---
let teamScores = JSON.parse(localStorage.getItem("teamScores")) || {
  1: 0,
  2: 0,
};

// --- Settings ---
let settings = JSON.parse(localStorage.getItem("jeopardySettings")) || {
  revealDelay: 0,
  timerLength: 30,
};

let autoFlipTimer = null;
let countdownTimer = null;
let timeLeft = 30;

// --- DOM ---
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
const revealBtn = document.getElementById("reveal-btn");
const flipInner = document.getElementById("flip-inner");
const scoreboard = document.getElementById("scoreboard");

let currentCategory = null;
let currentIndex = null;
let currentCell = null;

// --- SCOREBOARD ---
function renderScoreboard() {
  scoreboard.innerHTML = "";

  Object.keys(teamScores).forEach((teamId) => {
    const div = document.createElement("div");
    div.className = "team";

    div.innerHTML = `
      <h2>Team ${teamId}</h2>
      <div class="score-controls">
        <button class="minus">−</button>
        <p class="score" id="score${teamId}">${teamScores[teamId]}</p>
        <button class="plus">+</button>
      </div>
      <button class="remove">Remove</button>
    `;

    div.querySelector(".plus").onclick = () => updateScore(teamId, 100);
    div.querySelector(".minus").onclick = () => updateScore(teamId, -100);
    div.querySelector(".remove").onclick = () => {
      delete teamScores[teamId];
      renderScoreboard();
    };

    scoreboard.appendChild(div);
  });

  localStorage.setItem("teamScores", JSON.stringify(teamScores));
}

document.getElementById("add-team-btn").onclick = () => {
  const newId = Math.max(0, ...Object.keys(teamScores).map(Number)) + 1;
  teamScores[newId] = 0;
  renderScoreboard();
};

// --- SCORE UPDATE ---
function updateScore(team, delta) {
  teamScores[team] += delta;

  const el = document.getElementById(`score${team}`);
  if (el) {
    el.textContent = teamScores[team];
    el.style.transform = "scale(1.3)";
    setTimeout(() => (el.style.transform = "scale(1)"), 200);
  }

  localStorage.setItem("teamScores", JSON.stringify(teamScores));
}

// --- BOARD ---
function renderBoard() {
  board.innerHTML = "";

  gameData.forEach((cat, catIndex) => {
    const header = document.createElement("div");
    header.className = "category";

    if (editMode) {
      const input = document.createElement("input");
      input.value = cat.category;
      input.onchange = () => {
        gameData[catIndex].category = input.value;
        localStorage.setItem("jeopardyData", JSON.stringify(gameData));
      };
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

// --- MODAL ---
function openModal(catIndex, qIndex, cell) {
  currentCategory = catIndex;
  currentIndex = qIndex;
  currentCell = cell;

  const q = gameData[catIndex].questions[qIndex];

  modal.style.display = "flex";
  modal.dataset.value = q.value;

  modalTitle.textContent = `${gameData[catIndex].category} - ${q.value}`;
  questionText.textContent = q.question;
  answerText.textContent = q.answer || "No answer provided.";

  flipInner.classList.remove("flipped");

  startTimer();
}

function closeModal() {
  stopTimer();
  modal.style.display = "none";
  if (currentCell) currentCell.classList.add("used");
}

// --- TIMER ---
function startTimer() {
  clearInterval(countdownTimer);
  const display = document.getElementById("timer-display");

  timeLeft = settings.timerLength;
  display.textContent = timeLeft;

  countdownTimer = setInterval(() => {
    timeLeft--;
    display.textContent = timeLeft;

    if (timeLeft <= 0) {
      display.textContent = "⏰ TIME!";
      stopTimer();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(countdownTimer);
}

// --- CONTROLS ---
modeToggle.onclick = () => {
  editMode = !editMode;
  renderBoard();
};

resetBtn.onclick = () => {
  teamScores = {};
  renderScoreboard();
};

closeBtn.onclick = closeModal;
revealBtn.onclick = () => flipInner.classList.toggle("flipped");

// --- EXPORT / IMPORT ---
exportBtn.onclick = () => {
  const blob = new Blob([JSON.stringify(gameData, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "jeopardy_data.json";
  a.click();
};

importBtn.onclick = () => importFile.click();
importFile.onchange = (e) => {
  const reader = new FileReader();
  reader.onload = (evt) => {
    gameData = JSON.parse(evt.target.result);
    localStorage.setItem("jeopardyData", JSON.stringify(gameData));
    renderBoard();
  };
  reader.readAsText(e.target.files[0]);
};

// --- INIT ---
renderScoreboard();
renderBoard();
