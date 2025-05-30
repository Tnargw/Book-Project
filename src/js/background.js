const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const pixelSize = isMobile ? 40 : 20;
const canvas = document.getElementById('backgroundCanvas');
const context = canvas.getContext('2d');

let lockedColor = null;
let touchColorLocked = null;
let keyIsHeld = false;
let longPressTimeout = null;

let drawnPixels = [];
const pixelLifetime = 2000; // pixels dissolve after 2 seconds

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function snapToGrid(value, gridSize) {
  return Math.round(value / gridSize) * gridSize;
}

let isDragging = false;
let lastX = 0;
let lastY = 0;
let lastTime = 0;

function getEventCoordinates(e) {
  if (e.touches && e.touches[0]) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
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

window.addEventListener('keydown', (e) => {
  if (e.key === 'Shift') keyIsHeld = true;
});
window.addEventListener('keyup', (e) => {
  if (e.key === 'Shift') {
    keyIsHeld = false;
    lockedColor = null;
  }
});

function animate() {
  const now = performance.now();
  context.clearRect(0, 0, canvas.width, canvas.height);

  drawnPixels = drawnPixels.filter(pixel => {
    const age = now - pixel.createdAt;
    if (age < pixelLifetime) {
      context.globalAlpha = 1 - age / pixelLifetime;
      context.fillStyle = pixel.color;
      context.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);
      return true;
    }
    return false;
  });

  context.globalAlpha = 1; // Reset alpha
  requestAnimationFrame(animate);
}
animate();
