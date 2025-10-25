let pdfDoc = null,
    pageNum = 1,
    scale = 1.5,
    canvas = document.getElementById("the-canvas"),
    ctx = canvas.getContext("2d");

// pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

// Render page
function renderPage(num) {
  pdfDoc.getPage(num).then((page) => {
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };
    page.render(renderContext);
    document.getElementById("page_num").textContent = num;
  });
}

// Previous page
function onPrevPage() {
  if (pageNum <= 1) return;
  pageNum--;
  renderPage(pageNum);
}

// Next page
function onNextPage() {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  renderPage(pageNum);
}

// Event listeners
document.getElementById("prev").addEventListener("click", onPrevPage);
document.getElementById("next").addEventListener("click", onNextPage);

// File upload
document.getElementById("file-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file.type !== "application/pdf") {
    alert("Please upload a PDF file.");
    return;
  }

  const fileReader = new FileReader();
  fileReader.onload = function() {
    const typedarray = new Uint8Array(this.result);

    pdfjsLib.getDocument(typedarray).promise.then((pdfDoc_) => {
      pdfDoc = pdfDoc_;
      pageNum = 1;
      document.getElementById("page_count").textContent = pdfDoc.numPages;
      renderPage(pageNum);
    });
  };
  fileReader.readAsArrayBuffer(file);
});

