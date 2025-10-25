/**
 * quiz.js
 * Handles generation and display of quizzes from selected text.
 */

document.addEventListener("DOMContentLoaded", () => {
  const quizContainer = document.getElementById("quiz-content");
  const backBtn = document.getElementById("back-btn");

  // Retrieve text from localStorage
  const text = localStorage.getItem("quizText");

  if (!text) {
    quizContainer.innerHTML = "<p class='error'>No text found for quiz generation.</p>";
    return;
  }

  // Generate a simple quiz
  const questions = generateQuizQuestions(text);

  quizContainer.innerHTML = `
    <div class="selected-text">
      <h2>Selected Text:</h2>
      <p>${text}</p>
    </div>
    <h2>Quiz</h2>
    <form id="quiz-form">
      ${questions
        .map(
          (q, i) => `
        <div class="quiz-question">
          <p>${i + 1}. ${q.question}</p>
          ${q.options
            .map(
              (opt, j) => `
            <label>
              <input type="radio" name="q${i}" value="${opt}">
              ${opt}
            </label>
          `
            )
            .join("")}
        </div>
      `
        )
        .join("")}
      <button type="submit" id="submit-btn">Submit Answers</button>
    </form>
    <div id="result"></div>
  `;

  // Handle form submission
  document.getElementById("quiz-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const result = document.getElementById("result");
    result.innerHTML = "<p>✅ Quiz submitted! Great job reviewing.</p>";
  });

  // Go back
  backBtn.addEventListener("click", () => {
    window.close();
  });
});

/**
 * Generates simple quiz questions based on input text.
 * @param {string} text - The selected text from the PDF.
 * @returns {Array} - Array of question objects.
 */
function generateQuizQuestions(text) {
  // Dummy logic for now — could be replaced with AI later
  const words = text.split(" ").slice(0, 20).join(" ");
  return [
    {
      question: "What is the main topic discussed in the text?",
      options: ["Technology", "Science", "History", "Other"],
    },
    {
      question: "What best describes the tone of the text?",
      options: ["Informative", "Persuasive", "Narrative", "Analytical"],
    },
    {
      question: "What could be the main purpose of this text?",
      options: ["To inform", "To entertain", "To criticize", "To explain"],
    },
  ];
}
