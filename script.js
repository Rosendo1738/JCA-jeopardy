// --- Default game data ---
const defaultData = [
  {
    category: "Science",
    questions: [
      { value: 100, question: "What planet is known as the Red Planet?" },
      { value: 200, question: "What gas do plants breathe in?" },
      { value: 300, question: "What part of the cell contains DNA?" },
      { value: 400, question: "What is H2O commonly known as?" },
      { value: 500, question: "What force keeps us on the ground?" },
    ],
  },
  {
    category: "History",
    questions: [
      { value: 100, question: "Who was the first President of the USA?" },
      { value: 200, question: "In which year did WWII end?" },
      { value: 300, question: "Which empire built the Colosseum?" },
      { value: 400, question: "Who was known as the Maid of Orléans?" },
      { value: 500, question: "Which wall fell in 1989?" },
    ],
  },
  {
    category: "Geography",
    questions: [
      { value: 100, question: "What is the largest ocean?" },
      { value: 200, question: "Which continent is Egypt in?" },
      { value: 300, question: "What is the capital of Japan?" },
      { value: 400, question: "Which country has the Outback?" },
      { value: 500, question: "Mount Everest lies in which mountain range?" },
    ],
  },
  {
    category: "Literature",
    questions: [
      { value: 100, question: "Who wrote 'Romeo and Juliet'?" },
      { value: 200, question: "Who is the author of '1984'?" },
      { value: 300, question: "What’s the first book of the Bible?" },
      { value: 400, question: "Who wrote 'Moby Dick'?" },
      { value: 500, question: "Who created Sherlock Holmes?" },
    ],
  },
  {
    category: "Pop Culture",
    questions: [
      { value: 100, question: "Who is Mickey Mouse’s dog?" },
      { value: 200, question: "Which superhero is from Wakanda?" },
      { value: 300, question: "Who sang 'Thriller'?" },
      { value: 400, question: "What’s the name of Harry Potter’s owl?" },
      { value: 500, question: "Who directed 'Inception'?" },
    ],
  },
];

// --- Load data from localStorage or defaults ---
let gameData = JSON.parse(localStorage.getItem("jeopardyData")) || defaultData;
let editMode = false;

// --- DOM elements ---
const board = document.getElementById("board");
const modal = document.getElementById("modal");
const questionText = document.getElementById("question-text");
const questionEditor = document.getElementById("question-editor");
const modalTitle = document.getElementById("modal-title");
const saveBtn = document.getElementById("save-btn");
const closeBtn = document.getElementById("close-btn");
const modeToggle = document.getElementById("mode-toggle");
const resetBtn = document.getElementById("reset-btn");

let currentCategory = null;
let currentIndex = null;

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
      cell.onclick = () => openModal(catIndex, i);
      board.appendChild(cell);
    });
  }
}

// --- Modal Handling ---
function openModal(catIndex, qIndex) {
  currentCategory = catIndex;
  currentIndex = qIndex;

  const questionObj = gameData[catIndex].questions[qIndex];
  modal.style.display = "flex";
  modalTitle.textContent = `${gameData[catIndex].category} - $${questionObj.value}`;

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
}

// --- Mode toggle ---
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
  }
};

// --- Buttons ---
closeBtn.onclick = closeModal;
saveBtn.onclick = saveQuestion;

// --- Init ---
renderBoard();
