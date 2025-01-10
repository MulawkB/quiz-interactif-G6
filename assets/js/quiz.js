import {
  createAnswerButton,
  getElement,
  hideElement,
  lockAnswers,
  markCorrectAnswer,
  setText,
  showElement,
  updateScoreDisplay,
} from "./dom.js";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  startTimer,
} from "./utils.js";

console.log("Quiz JS loaded...");

const questions = [
  {
    text: "Quelle est la capitale de la France ?",
    answers: ["Marseille", "Paris", "Lyon", "Bordeaux"],
    correct: 1,
    timeLimit: 10,
  },
  {
    text: "Combien font 2 + 3 ?",
    answers: ["3", "4", "5", "1"],
    correct: 2,
    timeLimit: 5,
  },
];

let userAnswers = [];
let currentQuestionIndex = 0;
let score = 0;
let bestScore = loadFromLocalStorage("bestScore", 0);
let timerId = null;

// DOM Elements
const introScreen = getElement("#intro-screen");
const questionScreen = getElement("#question-screen");
const resultScreen = getElement("#result-screen");

const bestScoreValue = getElement("#best-score-value");
const bestScoreEnd = getElement("#best-score-end");

const questionText = getElement("#question-text");
const answersDiv = getElement("#answers");
const nextBtn = getElement("#next-btn");
const startBtn = getElement("#start-btn");
const restartBtn = getElement("#restart-btn");

const scoreText = getElement("#score-text");
const timeLeftSpan = getElement("#time-left");

const currentQuestionIndexSpan = getElement("#current-question-index");
const totalQuestionsSpan = getElement("#total-questions");

// Init
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartQuiz);

setText(bestScoreValue, bestScore);

function startQuiz() {
  hideElement(introScreen);
  showElement(questionScreen);

  currentQuestionIndex = 0;
  score = 0;

  setText(totalQuestionsSpan, questions.length);

  showQuestion();
}

function showQuestion() {
  clearInterval(timerId);

  const q = questions[currentQuestionIndex];
  setText(questionText, q.text);
  setText(currentQuestionIndexSpan, currentQuestionIndex + 1);

  answersDiv.innerHTML = "";
  q.answers.forEach((answer, index) => {
    const btn = createAnswerButton(answer, () => selectAnswer(index, btn));
    answersDiv.appendChild(btn);
  });

  nextBtn.classList.add("hidden");

  timeLeftSpan.textContent = q.timeLimit;
  timerId = startTimer(
    q.timeLimit,
    (timeLeft) => setText(timeLeftSpan, timeLeft),
    () => {
      lockAnswers(answersDiv);
      nextBtn.classList.remove("hidden");
    }
  );
}

function selectAnswer(index, btn) {
  clearInterval(timerId);

  const q = questions[currentQuestionIndex];
  userAnswers[currentQuestionIndex] = q.answers[index];
  if (index === q.correct) {
    score++;
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
  }

  markCorrectAnswer(answersDiv, q.correct);
  lockAnswers(answersDiv);
  nextBtn.classList.remove("hidden");
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  hideElement(questionScreen);
  showElement(resultScreen);

  updateScoreDisplay(scoreText, score, questions.length);

  if (score > bestScore) {
    bestScore = score;
    saveToLocalStorage("bestScore", bestScore);
  }
  setText(bestScoreEnd, bestScore);
  showSummary();
}

function showSummary() {
  const resultDiv = resultScreen.querySelector(".recap");
  if (resultDiv) {
    resultDiv.remove();
  }

  const answersDiv = document.createElement("div");
  answersDiv.classList.add("recap");
  answersDiv.innerHTML = "<h3>Récapitulatif des réponses</h3>";

  questions.forEach((q, index) => {
    const questionElement = document.createElement("div");
    const userAnswer = userAnswers[index] || "Aucune réponse sélectionnée";
    questionElement.innerHTML =
    "<p>Question n°" + (index + 1) + " : " + q.text + "</p>" +
    "<p>Réponse correcte : " + q.answers[q.correct] + "</p>" +
    "<p>Votre réponse : " + userAnswer + "</p>" +
    "<p>Vous avez " + (userAnswer === q.answers[q.correct] ? "répondu <span class='valid'>correctement</span>" : "répondu <span class='invalid'>incorrectement</span>") + "</p>" + "<hr/>";
    answersDiv.appendChild(questionElement);
  });

  resultScreen.appendChild(answersDiv);
}

function restartQuiz() {
  hideElement(resultScreen);
  showElement(introScreen);

  userAnswers = [];
  setText(bestScoreValue, bestScore);
}
