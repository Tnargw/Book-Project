// ==== CANVAS / DRAWING FUNCTIONS ====

const pixelSize = 20; // example grid size
const canvases = document.querySelectorAll('.rainbow-pixel-canvas');

function resizeCanvases() {
  canvases.forEach(canvas => {
    canvas.width = document.body.clientWidth;
    canvas.height = window.innerHeight * 0.7;
  });
}

function snapToGrid(value, gridSize) {
  return Math.round(value / gridSize) * gridSize;
}

canvases.forEach(canvas => {
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;

  function getEventCoordinates(e) {
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].pageX, y: e.touches[0].pageY };
    }
    return { x: e.pageX, y: e.pageY };
  }

  function startDrawing(e) {
    e.preventDefault();
    isDragging = true;
    const { x, y } = getEventCoordinates(e);
    lastX = x;
    lastY = y;
    lastTime = performance.now();
  }

  function draw(e) {
    if (!isDragging) return;
    e.preventDefault();
    const { x, y } = getEventCoordinates(e);
    const context = canvas.getContext('2d');
    const currentX = snapToGrid(x, pixelSize);
    const currentY = snapToGrid(y, pixelSize);
    const dx = currentX - lastX;
    const dy = currentY - lastY;
    const dt = performance.now() - lastTime;

    if (dx === 0 && dy === 0) return;
    const dragAngle = 180 * Math.atan2(dx, dy) / Math.PI;
    const speed = Math.sqrt(dx * dx + dy * dy) / dt;
    context.fillStyle = `hsl(${dragAngle}, 86%, ${30 + Math.min(speed * 1000, 50)}%)`;
    context.fillRect(currentX - pixelSize / 2, currentY - pixelSize / 2, pixelSize, pixelSize);

    lastX = currentX;
    lastY = currentY;
    lastTime = performance.now();
  }

  function stopDrawing() {
    isDragging = false;
  }

  function clearCanvas() {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  window.addEventListener('mousemove', draw);
  window.addEventListener('touchmove', draw, { passive: false });
  window.addEventListener('mouseup', stopDrawing);
  window.addEventListener('touchend', stopDrawing);

  // Clear canvas on double-click or long press
  canvas.addEventListener('dblclick', clearCanvas);
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      setTimeout(() => {
        if (isDragging) return;
        clearCanvas();
      }, 600); // Long press duration
    }
  });
});

window.addEventListener('DOMContentLoaded', resizeCanvases);
window.addEventListener('resize', resizeCanvases);

// ===== SAVE/LOAD - LOCAL STORAGE =====

const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');

saveBtn.addEventListener('click', () => {
  canvases.forEach(canvas => {
    const dataURL = canvas.toDataURL();
    localStorage.setItem('savedDrawing', dataURL);
  });
});

loadBtn.addEventListener('click', () => {
  const savedDrawing = localStorage.getItem('savedDrawing');
  if (!savedDrawing) return alert('No saved drawing found.');
  canvases.forEach(canvas => {
    const context = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0);
    };
    img.src = savedDrawing;
  });
});

// ==== SQUISH CANVAS DISPLAY ====

const previewCanvas = document.getElementById('previewCanvas');
const previewCtx = previewCanvas.getContext('2d');

function animateSquish() {
  const savedDrawing = localStorage.getItem('savedDrawing');
  if (!savedDrawing) return;
  const img = new Image();
  img.src = savedDrawing;
  let scaleY = 1;
  let direction = -1;
  const amplitude = 0.078;
  const speed = 0.017;

  img.onload = () => {
    function step() {
      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      previewCtx.save();
      previewCtx.translate(previewCanvas.width / 2, previewCanvas.height);
      previewCtx.scale(1, scaleY);
      previewCtx.drawImage(img, -previewCanvas.width / 2, -previewCanvas.height, previewCanvas.width, previewCanvas.height);
      previewCtx.restore();
      scaleY += direction * speed;
      if (scaleY <= 1 - amplitude || scaleY >= 1 + amplitude) direction *= -1;
      requestAnimationFrame(step);
    }
    step();
  };
}

saveBtn.addEventListener('click', animateSquish);
loadBtn.addEventListener('click', animateSquish);
