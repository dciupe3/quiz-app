let questions = [];
let currentQuestionIndex;
let correctAnswers = 0;
let selectedAnswerIndex = null;
let totalQuestions;
let answeredQuestions = 0;

let pointsPerQuestion;
let totalPoints = 0;
let results = [];

const submitAnswerButton = document.getElementById("submit-answer-button");
const nextQuestionButton = document.getElementById("next-question-button");
const viewResultsButton = document.getElementById("view-results-button");

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const numOfQuestions = urlParams.get("numOfQuestions") || 50; // Default to 50 if not specified
  totalQuestions = parseInt(numOfQuestions, 10);

  pointsPerQuestion = 1000 / totalQuestions;

  fetchQuestions();
});

function fetchQuestions() {
  fetch("http://localhost:8080/quiz-api/questions")
    .then((response) => response.json())
    .then((data) => {
      questions = data;
      displayRandomQuestion();
    })
    .catch((error) => {
      console.error("Fetching questions failed:", error);
    });
}

// Function to display a random question
function displayRandomQuestion() {
  if (questions.length === 0) {
    console.error("No questions to display");
    return;
  }

  currentQuestionIndex = Math.floor(Math.random() * questions.length);
  const question = questions[currentQuestionIndex];

  document.getElementById("question").innerText = question.question_text;
  const choicesList = document.getElementById("choices");
  choicesList.innerHTML = "";

  // Populate the answer choices
  question.options.forEach((option, index) => {
    const li = document.createElement("li");
    li.innerText = option;
    li.dataset.choiceIndex = index;
    li.addEventListener("click", function () {
      selectAnswer(index, li);
    });
    choicesList.appendChild(li);
  });

  updateQuestionCounter();
  selectedAnswerIndex = null;
  submitAnswerButton.disabled = true;
}

// Function to update the question counter
function updateQuestionCounter() {
  document.getElementById(
    "question-counter"
  ).innerText = `${++answeredQuestions} / ${totalQuestions}`;
}

// Function to handle answer selection
function selectAnswer(index, liElement) {
  document.querySelectorAll("#choices li").forEach((li) => {
    li.classList.remove("selected");
  });
  selectedAnswerIndex = index;
  liElement.classList.add("selected");
  submitAnswerButton.disabled = false;
}

function showFinishButton() {
  const finishButton = document.getElementById("finish-button");
  submitAnswerButton.style.display = "none";
  nextQuestionButton.style.display = "none";
  finishButton.style.display = "block";
  finishButton.addEventListener("click", showFinalScore);
}

// Function to display the final score and grade
function showFinalScore() {
  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("submit-answer-button").style.display = "none";
  document.getElementById("next-question-button").style.display = "none";

  // Calculate the grade
  const grade = Math.round((correctAnswers / totalQuestions) * 10);
  const totalPointsRounded = Math.round(totalPoints);

  const finalScoreCard = document.getElementById("final-score-card");
  finalScoreCard.querySelector("#correct-answers span").textContent = `${correctAnswers} / ${totalQuestions}`;
  finalScoreCard.querySelector("#final-score span").textContent = `${totalPointsRounded}`;
  finalScoreCard.querySelector("#final-grade span").textContent = `${grade}`;

  finalScoreCard.style.display = "block";
}

// Function to display all results
function displayAllResults() {
  const resultsContainer = document.getElementById("results-container");

  results.forEach((result, index) => {
    const questionElem = document.createElement("div");
    questionElem.classList.add("result-question");
    questionElem.innerHTML = `
            <h3>Question ${index + 1}: ${result.question}</h3>
            <p>Your Answer: ${result.selected}</p>
            <p>Correct Answer: ${result.correct}</p>
            <p>${result.isCorrect ? "Correct" : "Incorrect"}</p>`;
    resultsContainer.appendChild(questionElem);
  });

  const finishReviewButton = document.createElement("button");
  finishReviewButton.textContent = "Finish Review";
  finishReviewButton.id = "finish-review-button";
  finishReviewButton.addEventListener("click", function () {
    window.location.href = "index.html";
  });

  resultsContainer.appendChild(finishReviewButton);

  resultsContainer.style.display = "block";
}

submitAnswerButton.addEventListener("click", () => {
  const question = questions[currentQuestionIndex];
  const selectedOption = question.options[selectedAnswerIndex];
  const selectedOptionElement = document.querySelector(
    `[data-choice-index="${selectedAnswerIndex}"]`
  );

  if (selectedOption === question.correct_option) {
    correctAnswers++;
    totalPoints += pointsPerQuestion;
    selectedOptionElement.classList.add("correct");
  } else {
    selectedOptionElement.classList.add("incorrect");
    const correctIndex = question.options.indexOf(question.correct_option);
    document
      .querySelector(`[data-choice-index="${correctIndex}"]`)
      .classList.add("correct");
  }

  document.querySelectorAll("#choices li").forEach((li) => {
    li.classList.add("no-hover");
  });

  document.getElementById(
    "score"
  ).innerText = `Correct answers: ${correctAnswers}`;

  results.push({
    question: question.question_text,
    selected: selectedOption,
    correct: question.correct_option,
    isCorrect: selectedOption === question.correct_option,
  });
  submitAnswerButton.style.display = "none";
  if (totalQuestions === answeredQuestions || questions.length === 0) {
    showFinishButton();
  } else {
    nextQuestionButton.style.display = "block";
  }
});

nextQuestionButton.addEventListener("click", () => {
  questions.splice(currentQuestionIndex, 1);
  if (questions.length === 0) {
    showFinishButton();
  } else {
    displayRandomQuestion();
  }
  document.querySelectorAll("#choices li").forEach((li) => {
    li.classList.remove("no-hover", "selected", "correct", "incorrect");
  });

  nextQuestionButton.style.display = "none";
  submitAnswerButton.style.display = "block";
});

viewResultsButton.addEventListener("click", () => {
  const finalScoreCard = document.getElementById("final-score-card");
  finalScoreCard.style.display = "none";

  displayAllResults();
});
