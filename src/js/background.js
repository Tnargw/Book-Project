// === Device Detection and Canvas Setup ===
const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const pixelSize = isMobile ? 40 : 40;
const canvas = document.getElementById('backgroundCanvas');
const context = canvas.getContext('2d');

// === State Variables ===
let lockedColor = null;
let touchColorLocked = null;
let keyIsHeld = false;
let longPressTimeout = null;
let drawnPixels = [];
const pixelLifetime = 8000; // pixels dissolve (1000 = 1 sec)

// === Canvas Resizing ===
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// === Utility Functions ===
function snapToGrid(value, gridSize) {
  return Math.round(value / gridSize) * gridSize;
}

function getEventCoordinates(e) {
  if (e.touches && e.touches[0]) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

// === Drawing State Variables ===
let isDragging = false;
let lastX = 0;
let lastY = 0;
let lastTime = 0;

// === Drawing Handlers ===
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
  const currentX = snapToGrid(x, pixelSize);
  const currentY = snapToGrid(y, pixelSize);
  const dx = currentX - lastX;
  const dy = currentY - lastY;
  const dt = performance.now() - lastTime;

  if (dx === 0 && dy === 0) return;

  const dragAngle = 180 * Math.atan2(dx, dy) / Math.PI;
  const speed = Math.sqrt(dx * dx + dy * dy) / dt;
  const rainbowColor = `hsl(${dragAngle}, 86%, ${30 + Math.min(speed * 1000, 50)}%)`;

  const color = keyIsHeld ? (lockedColor ||= rainbowColor) :
                touchColorLocked || rainbowColor;

  drawnPixels.push({
    x: currentX - pixelSize / 2,
    y: currentY - pixelSize / 2,
    size: pixelSize,
    color,
    createdAt: performance.now()
  });

  lastX = currentX;
  lastY = currentY;
  lastTime = performance.now();
}

function stopDrawing() {
  isDragging = false;
}

// === Event Listeners for Drawing ===
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  startDrawing(e);
  longPressTimeout = setTimeout(() => {
    const { x, y } = getEventCoordinates(e);
    const currentX = snapToGrid(x, pixelSize);
    const currentY = snapToGrid(y, pixelSize);
    const dx = currentX - lastX;
    const dy = currentY - lastY;
    const dt = performance.now() - lastTime;
    const dragAngle = 180 * Math.atan2(dx, dy) / Math.PI;
    const speed = Math.sqrt(dx * dx + dy * dy) / dt;
    touchColorLocked = `hsl(${dragAngle}, 86%, ${30 + Math.min(speed * 1000, 50)}%)`;
  }, 2500);
});

window.addEventListener('mousemove', draw);
window.addEventListener('touchmove', draw, { passive: false });
window.addEventListener('mouseup', stopDrawing);
window.addEventListener('touchend', () => {
  clearTimeout(longPressTimeout);
  touchColorLocked = null;
  stopDrawing();
});

// === Keyboard Interaction (Color Locking) ===
window.addEventListener('keydown', (e) => {
  if (e.key === 'Shift') keyIsHeld = true;
});
window.addEventListener('keyup', (e) => {
  if (e.key === 'Shift') {
    keyIsHeld = false;
    lockedColor = null;
  }
});

// === Animation Loop ===
function animate() {
  const now = performance.now();

  // Clear with white background
  context.globalAlpha = 1;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawnPixels = drawnPixels.filter(pixel => {
    // While dragging, keep all pixels alive regardless of age
    if (isDragging) {
      context.globalAlpha = 1;
      context.fillStyle = pixel.color;
      context.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);
      return true;
    }

    // Once drawing stopped, pixels start disappearing
    const age = now - pixel.createdAt;
    if (age >= pixelLifetime) {
      return false;
    }

    const lifeProgress = age / pixelLifetime;
    const blipProbability = Math.pow(lifeProgress, 3) * 0.1;

    if (Math.random() < blipProbability) {
      return false;
    }

    context.globalAlpha = 1;
    context.fillStyle = pixel.color;
    context.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);

    return true;
  });

  context.globalAlpha = 1;
  requestAnimationFrame(animate);
}



animate();  // Start the animation loop!

