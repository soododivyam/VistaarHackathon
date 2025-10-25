// Global variables
let pdfDoc = null;
let currentPageNum = 1;
let isRendering = false;

// **CRITICAL FIX: Initialize PDF.js Worker**
// The workerSrc is required to load and parse PDFs.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// DOM elements
const fileInput = document.getElementById('pdf-upload');
const pdfContainer = document.getElementById('pdf-viewer-container');
const renderArea = document.getElementById('pdf-render-area'); // This is not strictly used for display, but kept for consistency
const canvas = document.getElementById('pdf-canvas');
const textLayerDiv = document.getElementById('pdf-text-layer');
const ctx = canvas.getContext('2d');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const currentPageEl = document.getElementById('current-page-num');
const totalPageEl = document.getElementById('total-page-num');
const paginationControls = document.getElementById('pdf-pagination-controls');
const loadingMessage = document.getElementById('pdf-loading-message');

// Event Listeners
fileInput.addEventListener('change', loadPdf);
prevPageBtn.addEventListener('click', () => changePage(-1));
nextPageBtn.addEventListener('click', () => changePage(1));

function loadPdf(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Reset state
    pdfDoc = null;
    currentPageNum = 1;
    pdfContainer.classList.add('hidden');
    paginationControls.classList.add('hidden');
    loadingMessage.classList.remove('hidden');
    
    const reader = new FileReader();

    reader.onload = function(e) {
        const arrayBuffer = e.target.result;
        pdfjsLib.getDocument({data: arrayBuffer}).promise.then(pdf => {
            pdfDoc = pdf;
            loadingMessage.classList.add('hidden');
            pdfContainer.classList.remove('hidden');
            paginationControls.classList.remove('hidden');
            renderPage(currentPageNum);
        }).catch(error => {
            console.error('Error loading PDF:', error);
            loadingMessage.textContent = 'Error loading PDF: ' + error.message;
        });
    };

    reader.readAsArrayBuffer(file);
}

function renderPage(pageNum) {
    if (isRendering || !pdfDoc) return;
    isRendering = true;
    
    // Clear previous text layer content to prevent overlap
    while (textLayerDiv.firstChild) {
        textLayerDiv.removeChild(textLayerDiv.firstChild);
    }

    pdfDoc.getPage(pageNum).then(page => {
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        // Set dimensions for both canvas and text layer container
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        textLayerDiv.style.height = `${viewport.height}px`;
        textLayerDiv.style.width = `${viewport.width}px`;
        
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        page.render(renderContext).promise.then(() => {
            renderTextLayer(page, viewport);
            isRendering = false;
        });

        currentPageNum = pageNum;
        currentPageEl.textContent = currentPageNum;
        totalPageEl.textContent = pdfDoc.numPages;

        // Handle button states
        prevPageBtn.disabled = currentPageNum <= 1;
        nextPageBtn.disabled = currentPageNum >= pdfDoc.numPages;
    });
}

function renderTextLayer(page, viewport) {
    page.getTextContent().then(textContent => {
        // The clear operation is now done at the start of renderPage, but kept here for robustness
        while (textLayerDiv.firstChild) {
            textLayerDiv.removeChild(textLayerDiv.firstChild);
        }

        const textLayer = new pdfjsLib.TextLayerBuilder.TextLayerBuilder({ // Corrected class access
            textLayerDiv,
            pageIndex: page.pageIndex,
            viewport: viewport
        });

        textLayer.setTextContent(textContent);
        textLayer.render();
    });
}

function changePage(offset) {
    const newPageNum = currentPageNum + offset;
    if (newPageNum > 0 && newPageNum <= pdfDoc.numPages) {
        renderPage(newPageNum);
    }
}

// Mocked AI response function (kept from original)
function getMockedAIResponse(question) {
    const mockedResponse = "This is a mock response for the question: " + question;
    return mockedResponse;
}
