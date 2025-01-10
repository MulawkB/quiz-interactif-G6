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

// ---------------------------------------------
// Questions : Ajoutez le champ "theme"
// ---------------------------------------------
const questions = [
  // --------------------------------------------------
  // FRANÇAIS
  // --------------------------------------------------
  {
    text: "Complétez la phrase suivante : 'Le chat ____ sur le tapis.'",
    answers: ["mangent", "mange", "mangeons", "mangera"],
    correct: 1,
    timeLimit: 10,
    theme: "Français",
  },
  {
    text: "Quelle est la forme correcte du verbe 'finir' à la 3e personne du pluriel au présent ?",
    answers: ["Ils finissent", "Ils finiront", "Ils finissaient", "Ils finiraient"],
    correct: 0,
    timeLimit: 10,
    theme: "Français",
  },
  {
    text: "Quelle est la nature du mot 'rapidement' ?",
    answers: ["Un adjectif", "Un adverbe", "Un nom", "Un verbe"],
    correct: 1,
    timeLimit: 10,
    theme: "Français",
  },
  {
    text: "Lequel de ces verbes est du premier groupe ?",
    answers: ["Vendre", "Finir", "Chanter", "Recevoir"],
    correct: 2,
    timeLimit: 10,
    theme: "Français",
  },
  {
    text: "Complétez l'orthographe : 'Je ________ aller au marché.'",
    answers: ["veut", "veux", "veus", "vai"],
    correct: 1,
    timeLimit: 10,
    theme: "Français",
  },
  {
    text: "Lequel de ces mots est un synonyme de 'rapide' ?",
    answers: ["Lent", "Vite", "Court", "Loin"],
    correct: 1,
    timeLimit: 10,
    theme: "Français",
  },

  // --------------------------------------------------
  // GÉOGRAPHIE
  // --------------------------------------------------
  {
    text: "Quelle est la capitale de la France ?",
    answers: ["Marseille", "Paris", "Lyon", "Bordeaux"],
    correct: 1,
    timeLimit: 10,
    theme: "Géographie",
  },
  {
    text: "Quelle est la capitale de l'Espagne ?",
    answers: ["Madrid", "Barcelone", "Valence", "Séville"],
    correct: 0,
    timeLimit: 10,
    theme: "Géographie",
  },
  {
    text: "Quel est le plus grand continent du monde ?",
    answers: ["Asie", "Afrique", "Amérique du Nord", "Europe"],
    correct: 0,
    timeLimit: 10,
    theme: "Géographie",
  },
  {
    text: "Quelle est la capitale de l'Allemagne ?",
    answers: ["Berlin", "Munich", "Francfort", "Hambourg"],
    correct: 0,
    timeLimit: 10,
    theme: "Géographie",
  },
  {
    text: "Quel pays est surnommé le Pays du Soleil Levant ?",
    answers: ["La Chine", "Le Japon", "La Corée du Sud", "La Thaïlande"],
    correct: 1,
    timeLimit: 10,
    theme: "Géographie",
  },
  {
    text: "Dans quel pays se trouve la Grande Barrière de corail ?",
    answers: ["Australie", "Nouvelle-Zélande", "Fidji", "Indonésie"],
    correct: 0,
    timeLimit: 10,
    theme: "Géographie",
  },
  {
    text: "Quel est le plus grand désert du monde ?",
    answers: ["Sahara", "Gobi", "Le désert d'Arabie", "L'Antarctique"],
    correct: 3,
    timeLimit: 10,
    theme: "Géographie",
  },

  // --------------------------------------------------
  // MATHS
  // --------------------------------------------------
  {
    text: "Combien font 2 + 3 ?",
    answers: ["3", "4", "5", "1"],
    correct: 2,
    timeLimit: 5,
    theme: "Maths",
  },
  {
    text: "Combien font 6 x 7 ?",
    answers: ["36", "42", "48", "56"],
    correct: 1,
    timeLimit: 5,
    theme: "Maths",
  },
  {
    text: "Quel est le résultat de 12 / 4 ?",
    answers: ["3", "4", "2", "6"],
    correct: 0,
    timeLimit: 5,
    theme: "Maths",
  },
  {
    text: "Quelle est la valeur de Pi approximativement ?",
    answers: ["2,14", "3,14", "3,04", "3,44"],
    correct: 1,
    timeLimit: 5,
    theme: "Maths",
  },
  {
    text: "Résolvez : 5² = ?",
    answers: ["5", "10", "25", "50"],
    correct: 2,
    timeLimit: 5,
    theme: "Maths",
  },
  {
    text: "Lequel de ces nombres est le plus grand ?",
    answers: ["0,99", "0,901", "0,909", "0,099"],
    correct: 0,
    timeLimit: 5,
    theme: "Maths",
  },
];


// ---------------------------------------------
// Variables globales
// ---------------------------------------------
let userAnswers = [];
let currentQuestionIndex = 0;
let score = 0;
let bestScore = loadFromLocalStorage("bestScore", 0);
let timerId = null;

// Tableau des questions filtrées selon le thème
let filteredQuestions = [];
let selectedTheme = null;

// ---------------------------------------------
// Récupération des éléments DOM
// ---------------------------------------------
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

// Bouton pour ouvrir la popup
const chooseThemeBtn = getElement("#choose-theme-btn");
const themePopup = getElement("#theme-popup");
const themeButtonsContainer = getElement("#theme-buttons");

// ---------------------------------------------
// Initialisation
// ---------------------------------------------
setText(bestScoreValue, bestScore);

// Écouteurs d’événements
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartQuiz);

// Ouvrir la popup de thème
chooseThemeBtn.addEventListener("click", openThemePopup);

// ---------------------------------------------
// Fonctions de gestion du quiz
// ---------------------------------------------
function startQuiz() {
  // S'il n'y a pas de questions filtrées, on prend toutes les questions
  if (!filteredQuestions.length) {
    filteredQuestions = [...questions];
    randomize(filteredQuestions);
  }

  hideElement(introScreen);
  showElement(questionScreen);

  currentQuestionIndex = 0;
  score = 0;

  setText(totalQuestionsSpan, filteredQuestions.length);

  showQuestion();
}

// Mélanger un tableau (algorithme de Fisher-Yates)
function randomize(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const e = Math.floor(Math.random() * (i + 1));
    [array[i], array[e]] = [array[e], array[i]];
  }
}

function showQuestion() {
  clearInterval(timerId);

  const q = filteredQuestions[currentQuestionIndex];
  setText(questionText, q.text);
  setText(currentQuestionIndexSpan, currentQuestionIndex + 1);

  answersDiv.innerHTML = "";

  // Créer les boutons de réponse
  q.answers.forEach((answer, index) => {
    const btn = createAnswerButton(answer, () => selectAnswer(index, btn));
    answersDiv.appendChild(btn);
  });

  // Cacher le bouton "Suivant" tant qu'aucune réponse n'est sélectionnée
  nextBtn.classList.add("hidden");

  // Gérer le timer
  timeLeftSpan.textContent = q.timeLimit;
  timerId = startTimer(
    q.timeLimit,
    (timeLeft) => setText(timeLeftSpan, timeLeft),
    () => {
      // Timer expiré : on bloque les réponses, on affiche "Suivant"
      lockAnswers(answersDiv);
      nextBtn.classList.remove("hidden");
    }
  );
}

function selectAnswer(index, btn) {
  clearInterval(timerId);

  const q = filteredQuestions[currentQuestionIndex];
  userAnswers[currentQuestionIndex] = q.answers[index];

  // Vérifier si la réponse est correcte
  if (index === q.correct) {
    score++;
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
  }

  // Marquer la bonne réponse
  markCorrectAnswer(answersDiv, q.correct);
  // Bloquer toutes les réponses
  lockAnswers(answersDiv);

  // Afficher le bouton "Suivant"
  nextBtn.classList.remove("hidden");
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < filteredQuestions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  hideElement(questionScreen);
  showElement(resultScreen);

  updateScoreDisplay(scoreText, score, filteredQuestions.length);

  // Mettre à jour le meilleur score si besoin
  if (score > bestScore) {
    bestScore = score;
    saveToLocalStorage("bestScore", bestScore);
  }
  setText(bestScoreEnd, bestScore);

  showSummary();
}

function showSummary() {
  // Supprimer l’ancien récap s’il existe
  const resultDiv = resultScreen.querySelector(".recap");
  if (resultDiv) {
    resultDiv.remove();
  }

  // Créer un nouveau bloc pour le récap
  const answersRecapDiv = document.createElement("div");
  answersRecapDiv.classList.add("recap");
  answersRecapDiv.innerHTML = "<h3>Récapitulatif des réponses</h3>";

  filteredQuestions.forEach((q, index) => {
    const questionElement = document.createElement("div");
    const userAnswer = userAnswers[index] || "Aucune réponse sélectionnée";
    const isCorrect = userAnswer === q.answers[q.correct];

    questionElement.innerHTML =
      "<p>Question n°" + (index + 1) + " : " + q.text + "</p>" +
      "<p>Réponse correcte : " + q.answers[q.correct] + "</p>" +
      "<p>Votre réponse : " + userAnswer + "</p>" +
      "<p>Vous avez " +
      (isCorrect
        ? "répondu <span class='valid'>correctement</span>"
        : "répondu <span class='invalid'>incorrectement</span>") +
      "</p>" +
      "<hr/>";

    answersRecapDiv.appendChild(questionElement);
  });

  resultScreen.appendChild(answersRecapDiv);
}

function restartQuiz() {
  hideElement(resultScreen);
  showElement(introScreen);

  // Réinitialiser
  userAnswers = [];
  filteredQuestions = [];
  selectedTheme = null;

  // Réafficher le best score
  setText(bestScoreValue, bestScore);
}

// ---------------------------------------------
// Fonctions pour la popup de thème
// ---------------------------------------------
function openThemePopup() {
  // Vider le conteneur pour éviter de dupliquer les boutons
  themeButtonsContainer.innerHTML = "";

  // Récupérer la liste des thèmes uniques
  const uniqueThemes = [...new Set(questions.map((q) => q.theme))];

  // Créer un bouton pour chaque thème
  uniqueThemes.forEach((theme) => {
    const btn = document.createElement("button");
    btn.textContent = theme;
    btn.classList.add("theme-btn"); // classe pour le style si besoin

    btn.addEventListener("click", () => {
      selectedTheme = theme;
      filteredQuestions = questions.filter((q) => q.theme === theme);
      randomize(filteredQuestions);
      closeThemePopup();
      startQuiz();
    });

    themeButtonsContainer.appendChild(btn);
  });

  showElement(themePopup);
}

function closeThemePopup() {
  hideElement(themePopup);
}