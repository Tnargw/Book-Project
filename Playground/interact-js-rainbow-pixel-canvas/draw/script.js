// CANVAS / DRAWING FUNCTIONS

const pixelSize = 20; // example grid size
const canvases = document.querySelectorAll(".rainbow-pixel-canvas");

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

  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    lastX = e.pageX;
    lastY = e.pageY;
    lastTime = performance.now();
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const context = canvas.getContext("2d");

    const currentX = snapToGrid(e.pageX, pixelSize);
    const currentY = snapToGrid(e.pageY, pixelSize);

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
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Double click to clear canvas
  canvas.addEventListener("dblclick", () => {
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  });
});




// ===== SAVE/LOAD - LOCAL STORAGE =====

const saveBtn = document.getElementById("saveBtn");
const loadBtn = document.getElementById("loadBtn");

saveBtn.addEventListener("click", () => {
  canvases.forEach(canvas => {
    // Save the canvas as a data URL string
    const dataURL = canvas.toDataURL();
    localStorage.setItem("savedDrawing", dataURL);
    // alert("Drawing saved!");
  });
});

loadBtn.addEventListener("click", () => {
  const savedDrawing = localStorage.getItem("savedDrawing");
  if (!savedDrawing) {
    alert("No saved drawing found.");
    return;
  }
  canvases.forEach(canvas => {
    const context = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0);
    };
    img.src = savedDrawing;
  });
});


// ==== SQUISH CANVAS DISPLAY ====

const previewCanvas = document.getElementById("previewCanvas");
const previewCtx = previewCanvas.getContext("2d");

function animateSquish() {
  const savedDrawing = localStorage.getItem("savedDrawing");
  if (!savedDrawing) return;

  const img = new Image();
  img.src = savedDrawing;
  
  let scaleY = 1;
  let direction = -1;  // -1 means squish, 1 means stretch
  const amplitude = 0.078; // Squish/stretch intensity 
  const speed = 0.017; // Animation speed

  img.onload = () => {
    function step() {
      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

      previewCtx.save();

      // Move to the bottom center before scaling
      previewCtx.translate(previewCanvas.width / 2, previewCanvas.height);

      // Scale vertically to squish/stretch, keeping the base fixed
      previewCtx.scale(1, scaleY);

      // Draw the image, anchoring from the bottom center
      previewCtx.drawImage(
        img, 
        -previewCanvas.width / 2,       // Center horizontally
        -previewCanvas.height,          // Align the bottom of the image with the canvas bottom
        previewCanvas.width, 
        previewCanvas.height
      );

      previewCtx.restore();

      // Update scaleY for the squish effect
      scaleY += direction * speed;
      if (scaleY <= 1 - amplitude || scaleY >= 1 + amplitude) {
        direction *= -1;  // Reverse direction at the squish/stretch limits
      }

      requestAnimationFrame(step);
    }
    step();
  };
}


// Call this whenever you want to start or restart the preview animation
animateSquish();


//  ===== UPDATE SQUISH CANVAS ====
saveBtn.addEventListener("click", () => {
  canvases.forEach(canvas => {
    const dataURL = canvas.toDataURL();
    localStorage.setItem("savedDrawing", dataURL);
    // alert("Drawing saved!");
    animateSquish();  // Refresh preview with animation
  });
});

loadBtn.addEventListener("click", () => {
  const savedDrawing = localStorage.getItem("savedDrawing");
  if (!savedDrawing) {
    alert("No saved drawing found.");
    return;
  }
  canvases.forEach(canvas => {
    const context = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0);
    };
    img.src = savedDrawing;
  });
  animateSquish();  // Refresh preview with animation
});


window.addEventListener("DOMContentLoaded", resizeCanvases);
window.addEventListener("resize", resizeCanvases);
