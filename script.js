/**
 * script.js
 *
 * This file acts as the main UI controller.
 * It initializes the PDFViewer and connects the HTML buttons
 * to the PDFViewer's functions.
 */

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the PDFViewer object
  // It needs the IDs of all the elements it will control
  PDFViewer.init(
    "the-canvas",
    "page_num",
    "page_count",
    "pdf-viewport-wrapper"
  );

  // --- Event Listeners for PDF Controls ---

  // Handle file upload
  document.getElementById("file-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      PDFViewer.loadDocument(file);
    } else if (file) {
      // You can replace this with a nicer UI element
      console.error("Please upload a PDF file.");
    }
  });

  // Handle "Previous" button
  document.getElementById("prev").addEventListener("click", () => {
    PDFViewer.prevPage();
  });

  // Handle "Next" button
  document.getElementById("next").addEventListener("click", () => {
    PDFViewer.nextPage();
  });

  // Handle "Toggle PDF Mode" button
  document.getElementById("pdf-dark-mode-toggle").addEventListener("click", () => {
      PDFViewer.toggleDarkMode();
    }
  );
});


