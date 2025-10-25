/**
 * Renders a selectable text layer for a PDF page.
 * @param {PDFPageProxy} page - The pdf.js page object
 * @param {HTMLElement} wrapper - The div wrapping the canvas
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {number} scale - scale factor
 */

function renderTextLayer(page, wrapper, canvas, scale) {
  const viewport = page.getViewport({ scale });

  // Remove old text layer if it exists
  const oldLayer = wrapper.querySelector('.textLayer');
  if (oldLayer) oldLayer.remove();

  const textLayerDiv = document.createElement('div');
  textLayerDiv.className = 'textLayer';
  textLayerDiv.style.width = `${viewport.width}px`;
  textLayerDiv.style.height = `${viewport.height}px`;
  textLayerDiv.style.position = 'absolute';
  textLayerDiv.style.top = '0';
  textLayerDiv.style.left = '0';
  wrapper.appendChild(textLayerDiv);

  page.getTextContent().then((textContent) => {
    pdfjsLib.renderTextLayer({
      textContent,
      container: textLayerDiv,
      viewport,
      textDivs: [],
      enhanceTextSelection: true
    });
  });
}
