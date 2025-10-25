/**
 * chat.js
 *
 * This file contains all the logic for the chat widget
 * and the main UI (body) dark mode toggle.
 */

// Create a global Chat object to expose its methods
const Chat = {
  // --- Properties ---
  chatToggle: null,
  chatWindow: null,
  chatClose: null,
  chatBody: null,
  chatInput: null,
  chatSend: null,

  /**
   * Initializes the Chat object, finds elements, and attaches listeners.
   */
  init() {
    // --- Chat Widget Elements ---
    this.chatToggle = document.getElementById("chat-toggle");
    this.chatWindow = document.getElementById("chat-window");
    this.chatClose = document.getElementById("chat-close");
    this.chatBody = document.getElementById("chat-body");
    this.chatInput = document.getElementById("chat-input");
    this.chatSend = document.getElementById("chat-send");

    // Safety check in case elements don't exist
    if (
      !this.chatToggle ||
      !this.chatWindow ||
      !this.chatClose ||
      !this.chatBody ||
      !this.chatInput ||
      !this.chatSend
    ) {
      console.warn(
        "Chat elements not found. Chat widget will not be initialized."
      );
      return;
    }

    // --- Attach Event Listeners ---

    // Open/Close chat window
    this.chatToggle.addEventListener("click", () => {
      this.chatWindow.classList.toggle("chat-open");
    });

    this.chatClose.addEventListener("click", () => {
      this.chatWindow.classList.remove("chat-open");
    });

    // Event listeners for sending
    this.chatSend.addEventListener("click", () => this.sendMessage());
    
    this.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.sendMessage();
      }
    });
  },

  /**
   * Sends the message currently in the chat input.
   */
  sendMessage() {
    const messageText = this.chatInput.value.trim();
    if (messageText === "") return;

    // Add user message to chat body
    this.addMessage(messageText, "user");

    // Clear input
    this.chatInput.value = "";

    // Get bot response
    this.getBotResponse(messageText, null); // Pass null for context
  },

  /**
   * Adds a message to the chat body.
   * @param {string} text - The message text.
   * @param {string} sender - 'user', 'bot', or 'context-message'.
   */
  addMessage(text, sender) {
    const messageEl = document.createElement("div");
    messageEl.classList.add("chat-message", sender);
    // Use textContent to prevent XSS
    messageEl.textContent = text;
    this.chatBody.appendChild(messageEl);

    // Auto-scroll to bottom
    this.chatBody.scrollTop = this.chatBody.scrollHeight;
  },

  /**
   * NEW: Public method to send a message *with* context from the PDF.
   * @param {string} context - The selected text from the PDF.
   * @param {string} prompt - The prompt (e.g., "Explain this:").
   */
  sendMessageWithContext(context, prompt) {
    // 1. Open the chat window
    this.chatWindow.classList.add("chat-open");

    // 2. Add the context as a special message
    this.addMessage(`Context: "${context}"`, "context-message");

    // 3. Add the user's prompt
    this.addMessage(prompt, "user");

    // 4. Get the bot response
    // In a real app, you'd send both 'context' and 'prompt' to the LLM
    this.getBotResponse(prompt, context);
  },

  /**
   * Simulates a bot response.
   * Modified to understand context.
   * @param {string} prompt - The user's prompt.
   * @param {string | null} context - The selected text (if any).
   */
  getBotResponse(prompt, context = null) {
    let responseText = "This is a dummy response. The API is not connected yet.";

    if (context) {
      // Create a specific response if context is provided
      responseText = `Dummy response for "${prompt}" regarding the text: "${context.substring(0, 50)}..."`;
    } else {
      // Standard response
      responseText = `Dummy response for: "${prompt}"`;
    }

    setTimeout(() => {
      this.addMessage(responseText, "bot");
    }, 1000); // 1-second delay
  },
};

// --- Main DOMContentLoaded Listener ---
document.addEventListener("DOMContentLoaded", () => {
  // --- Main UI Dark Mode Toggle ---
  // This is separate from the chat, so it stays here.
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
    });
  }

  // --- Initialize the Chat Widget ---
  Chat.init();
});