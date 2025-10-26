document.addEventListener("DOMContentLoaded", () => {
  const setupDiv = document.getElementById("quiz-setup");
  const quizContainer = document.getElementById("quiz-content");
  const backBtn = document.getElementById("back-btn");
  const startBtn = document.getElementById("start-quiz");

  const text = localStorage.getItem("quizText");

  if (!text) {
    quizContainer.innerHTML = "<p class='error'>No text found for quiz generation.</p>";
    setupDiv.style.display = "none";
    quizContainer.style.display = "block";
    return;
  }

  startBtn.addEventListener("click", () => {
    const count = parseInt(document.getElementById("question-count").value);
    const type = document.getElementById("question-type").value;

    setupDiv.style.display = "none";
    quizContainer.style.display = "block";

    const questions = generateQuizQuestions(text, count, type);

    quizContainer.innerHTML = `
      <div class="selected-text">
        <h2>Selected Text:</h2>
        <p>${text}</p>
      </div>
      <h2>Quiz (${count} ${type.replace("-", " ")} questions)</h2>
      <form id="quiz-form">
        ${questions
          .map(
            (q, i) => `
          <div class="quiz-question">
            <p>${i + 1}. ${q.question}</p>
            ${
              type === "one-word"
                ? `<input type="text" name="q${i}" placeholder="Your one-word answer...">`
                : `<textarea name="q${i}" rows="2" placeholder="Your short answer..."></textarea>`
            }
          </div>
        `
          )
          .join("")}
        <button type="submit" id="submit-btn">Submit Answers</button>
      </form>
      <div id="result"></div>
    `;

    document.getElementById("quiz-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const result = document.getElementById("result");
      result.innerHTML = "<p>✅ Quiz submitted! Great job reviewing.</p>";
    });
  });

  backBtn.addEventListener("click", () => {
    window.close();
  });
});

/**
 * Generates dummy quiz questions based on user preferences.
 * @param {string} text - Selected text from PDF.
 * @param {number} count - Number of questions.
 * @param {string} type - Question type ("one-word" | "short-answer").
 * @returns {Array} - List of generated questions.
 */
function generateQuizQuestions(text, count, type) {
  const baseQuestions = [
    "What is the main idea of the text?",
    "What is one key concept mentioned?",
    "What is the purpose of the text?",
    "Summarize the paragraph in your own words.",
    "Name one important term discussed.",
    "What tone does the text convey?",
    "Identify one challenge or problem mentioned.",
    "Who or what is the main focus?",
    "What is one possible conclusion drawn?",
    "Explain one example provided in the text.",
  ];

  return baseQuestions.slice(0, count).map((q) => ({
    question: q,
  }));
}
