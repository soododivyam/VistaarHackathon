/**
 * pdf-renderer.js
 *
 * This file contains all logic for loading, rendering, and interacting
 * with the PDF document. It uses the pdf.js library.
 * It is designed as a self-contained object, PDFViewer, to be
 * controlled by script.js.
 */

// Set the worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

const PDFViewer = {
  pdfDoc: null,
  pageNum: 1,
  scale: 1.5,
  canvas: null,
  ctx: null,
  pageCounter: null,
  pageTotal: null,
  viewportWrapper: null,
  textLayerDiv: null, // A reference to the text layer

  // --- New properties for context menu ---
  selectedText: null,
  contextMenu: null,

  /**
   * Initializes the PDF viewer object.
   * @param {string} canvasId - The ID of the canvas element.
   * @param {string} pageNumId - The ID of the element showing the current page number.
   * @param {string} pageCountId - The ID of the element showing the total page count.
   * @param {string} wrapperId - The ID of the div wrapping the canvas and text layer.
   */
  init(canvasId, pageNumId, pageCountId, wrapperId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.pageCounter = document.getElementById(pageNumId);
    this.pageTotal = document.getElementById(pageCountId);
    this.viewportWrapper = document.getElementById(wrapperId);

    // --- New: Get menu element and attach listeners ---
    this.contextMenu = document.getElementById("text-context-menu");

    // 1. Listen for right-click *inside* the PDF wrapper
    this.viewportWrapper.addEventListener("contextmenu", (e) =>
      this.handleContextMenu(e)
    );

    // 2. Listen for left-click *anywhere* to close the menu
    window.addEventListener("click", (e) => {
      // Only hide if the click is *not* on a menu button
      if (!e.target.classList.contains('menu-button')) {
        this.hideContextMenu();
      }
    });

    // 3. Add listeners for menu buttons
    document.getElementById("menu-explain").addEventListener("click", () => {
      if (this.selectedText) {
        // Call the public method on the Chat object
        Chat.sendMessageWithContext(this.selectedText, "Please explain this text:");
      }
      this.hideContextMenu();
    });

  // --- OPEN QUIZ PAGE ---
  document.getElementById("menu-quiz").addEventListener("click", () => {
    if (this.selectedText) {
      // Save selected text temporarily in localStorage
      localStorage.setItem("quizText", this.selectedText);
      // Open quiz page
      window.open("quiz.html", "_blank");
    }
    this.hideContextMenu();
  });

  },

  /**
   * Loads a PDF file and renders the first page.
   * @param {File} file - The PDF file to load.
   */
  loadDocument(file) {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const typedarray = new Uint8Array(fileReader.result);

      pdfjsLib.getDocument(typedarray).promise.then((pdfDoc_) => {
        this.pdfDoc = pdfDoc_;
        this.pageNum = 1;
        this.pageTotal.textContent = this.pdfDoc.numPages;
        this.renderPage(this.pageNum);
      });
    };
    fileReader.readAsArrayBuffer(file);
  },

  /**
   * Renders a specific page number with both canvas and text layer.
   * @param {number} num - The page number to render.
   */
renderPage(num) {
    if (!this.pdfDoc) return;

    this.pageNum = num; // make sure PDFViewer.pageNum is updated

    // --- Clear previous canvas ---
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // --- Remove previous text layer ---
    if (this.textLayerDiv) {
        this.viewportWrapper.removeChild(this.textLayerDiv);
        this.textLayerDiv = null;
    }

    // --- Get the page ---
    this.pdfDoc.getPage(num).then((page) => {
        const viewport = page.getViewport({ scale: this.scale });

        this.canvas.height = viewport.height;
        this.canvas.width = viewport.width;

        const renderContext = {
            canvasContext: this.ctx,
            viewport: viewport,
        };

        // Render the canvas
        const renderTask = page.render(renderContext);

        // Render text layer **after canvas rendering completes**
        renderTask.promise.then(() => {
            // This assumes renderTextLayer returns the created div
            this.textLayerDiv = renderTextLayer(page, this.viewportWrapper, this.canvas, this.scale);
        });

        // Update page counter
        this.pageCounter.textContent = num;
    });
},

  /**
   * Go to the previous page.
   */
  prevPage() {
    if (!this.pdfDoc || this.pageNum <= 1) return;
    this.pageNum--;
    this.renderPage(this.pageNum);
  },

  /**
   * Go to the next page.
   */
  nextPage() {
    if (!this.pdfDoc || this.pageNum >= this.pdfDoc.numPages) return;
    this.pageNum++;
    this.renderPage(this.pageNum);
  },

  /**
   * Toggles the independent dark mode for the PDF viewer.
   */
  toggleDarkMode() {
    this.viewportWrapper.classList.toggle("pdf-dark-mode");
  },

  /**
   * Zoom in by increasing the scale
   */
  zoomIn() {
    this.scale += 0.2; // increase scale by 0.2
    this.renderPage(this.pageNum);
  },

  /**
   * Zoom out by decreasing the scale
   */
  zoomOut() {
    if (this.scale <= 0.4) return; // minimum zoom
    this.scale -= 0.2; // decrease scale by 0.2
    this.renderPage(this.pageNum);
  },


  // --- New Methods for Context Menu ---

  /**
   * Handles the right-click event on the PDF wrapper.
   * @param {MouseEvent} e
   */
  handleContextMenu(e) {
    // Stop the default browser right-click menu
    e.preventDefault();

    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length > 0) {
      this.selectedText = selectedText;

      // Position and show the menu
      // We use clientX/Y for position relative to the viewport
      this.contextMenu.style.top = `${e.clientY}px`;
      this.contextMenu.style.left = `${e.clientX}px`;
      this.contextMenu.style.display = "block";
    } else {
      // If no text is selected, just hide the menu
      this.hideContextMenu();
    }
  },

  /**
   * Hides the custom context menu and clears selection.
   */
  hideContextMenu() {
    if (this.contextMenu) {
        this.contextMenu.style.display = "none";
    }
    this.selectedText = null;
  },
};