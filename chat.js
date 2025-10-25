/**
 * chat.js
 *
 * This file contains all the logic for the chat widget
 * and the main UI (body) dark mode toggle.
 */

// Wait for the DOM to be fully loaded before running scripts
document.addEventListener("DOMContentLoaded", () => {
  
  // --- Main UI Dark Mode Toggle ---
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
    });
  }

  // --- Chat Widget ---
  const chatToggle = document.getElementById("chat-toggle");
  const chatWindow = document.getElementById("chat-window");
  const chatClose = document.getElementById("chat-close");
  const chatBody = document.getElementById("chat-body");
  const chatInput = document.getElementById("chat-input");
  const chatSend = document.getElementById("chat-send");

  // Safety check in case elements don't exist
  if (!chatToggle || !chatWindow || !chatClose || !chatBody || !chatInput || !chatSend) {
    console.warn("Chat elements not found. Chat widget will not be initialized.");
    return;
  }

  // Open/Close chat window
  chatToggle.addEventListener("click", () => {
    chatWindow.classList.toggle("chat-open");
  });

  chatClose.addEventListener("click", () => {
    chatWindow.classList.remove("chat-open");
  });

  // Send message
  const sendMessage = () => {
    const messageText = chatInput.value.trim();
    if (messageText === "") return;

    // Add user message to chat body
    addMessage(messageText, "user");

    // Clear input
    chatInput.value = "";

    // Get dummy bot response
    getBotResponse();
  };

  // Add message to chat body
  const addMessage = (text, sender) => {
    const messageEl = document.createElement("div");
    messageEl.classList.add("chat-message", sender);
    // Use textContent to prevent XSS
    messageEl.textContent = text;
    chatBody.appendChild(messageEl);

    // Auto-scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  // Simulate a bot response
  const getBotResponse = () => {
    setTimeout(() => {
      addMessage(
        "This is a dummy response. The API is not connected yet.",
        "bot"
      );
    }, 1000); // 1-second delay
  };

  // Event listeners for sending
  chatSend.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
});


