// ==== CANVAS / DRAWING FUNCTIONS ====

const pixelSize = 20; // example grid size
const canvases = document.querySelectorAll('.rainbow-pixel-canvas');
const clearBtn = document.getElementById('clearBtn');

let lockedColor = null; // For keyboard lock
let touchColorLocked = null; // For touch lock
let keyIsHeld = false;
let longPressTimeout = null;

function resizeCanvases() {
  canvases.forEach(canvas => {
    const size = Math.min(document.body.clientWidth, window.innerHeight * 0.7);
    canvas.width = size;
    canvas.height = size;
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
    const rainbowColor = `hsl(${dragAngle}, 86%, ${30 + Math.min(speed * 1000, 50)}%)`;

    if (keyIsHeld) {
      if (!lockedColor) lockedColor = rainbowColor;
      context.fillStyle = lockedColor;
    } else if (touchColorLocked) {
      context.fillStyle = touchColorLocked;
    } else {
      context.fillStyle = rainbowColor;
    }

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
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(e);
    longPressTimeout = setTimeout(() => {
      const { x, y } = getEventCoordinates(e);
      const dragAngle = 0;
      const speed = 0;
      touchColorLocked = `hsl(${dragAngle}, 86%, ${30 + Math.min(speed * 1000, 50)}%)`;
    }, 500);
  });

  window.addEventListener('mousemove', draw);
  window.addEventListener('touchmove', draw, { passive: false });
  window.addEventListener('mouseup', stopDrawing);
  window.addEventListener('touchend', () => {
    clearTimeout(longPressTimeout);
    touchColorLocked = null;
    stopDrawing();
  });

  clearBtn.addEventListener('click', clearCanvas);
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Shift') keyIsHeld = true;
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'Shift') {
    keyIsHeld = false;
    lockedColor = null;
  }
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

  img.onload = () => {
    const amplitude = 0.12;     // More squish amplitude
    const duration = 500;      // Full cycle duration in ms
    const lingerRatio = 0.2;    // % of time lingering at normal scale
    const squishDuration = duration * (1 - lingerRatio) / 2; // half squish time

    let startTime = null;

    // Easing function for smooth ease in/out
    function easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) % duration;

      let scaleY;

      if (elapsed < duration * lingerRatio) {
        // Linger at normal scale
        scaleY = 1;
      } else {
        // Squish phase
        let squishTime = elapsed - duration * lingerRatio;
        if (squishTime < squishDuration) {
          // Squish down (scale from 1 to 1 - amplitude)
          let t = squishTime / squishDuration;
          scaleY = 1 - amplitude * easeInOutQuad(t);
        } else {
          // Squish back up (scale from 1 - amplitude to 1)
          let t = (squishTime - squishDuration) / squishDuration;
          scaleY = (1 - amplitude) + amplitude * easeInOutQuad(t);
        }
      }

      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      previewCtx.save();
      previewCtx.translate(previewCanvas.width / 2, previewCanvas.height);
      previewCtx.scale(1, scaleY);
      previewCtx.drawImage(img, -previewCanvas.width / 2, -previewCanvas.height, previewCanvas.width, previewCanvas.height);
      previewCtx.restore();

      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  };
}

saveBtn.addEventListener('click', animateSquish);
loadBtn.addEventListener('click', animateSquish);
