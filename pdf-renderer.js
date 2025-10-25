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

    // Get the page
    this.pdfDoc.getPage(num).then((page) => {
      const viewport = page.getViewport({ scale: this.scale });
      
      // --- 1. Render Canvas ---
      this.canvas.height = viewport.height;
      this.canvas.width = viewport.width;

      const renderContext = {
        canvasContext: this.ctx,
        viewport: viewport,
      };
      
      const renderTask = page.render(renderContext);
      
      renderTask.promise.then(() => {
        // --- 2. Render Text Layer (After canvas is done) ---
        return page.getTextContent();
      }).then((textContent) => {
        // Remove old text layer if it exists
        if (this.textLayerDiv) {
          this.textLayerDiv.remove();
        }

        // Create new text layer div
        this.textLayerDiv = document.createElement("div");
        this.textLayerDiv.className = "textLayer";
        
        // Set its size to match the viewport
        this.textLayerDiv.style.width = `${viewport.width}px`;
        this.textLayerDiv.style.height = `${viewport.height}px`;

        // Append new layer to the wrapper
        this.viewportWrapper.appendChild(this.textLayerDiv);

        // Render the text content into the layer
        pdfjsLib.renderTextLayer({
          textContentSource: textContent,
          container: this.textLayerDiv,
          viewport: viewport,
          textDivs: [],
        });
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
};


