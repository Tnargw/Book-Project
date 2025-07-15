document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector(".rainbow-pixel-canvas");
  const ctx = canvas.getContext("2d");
  const clearBtn = document.getElementById("clearBtn");
  const saveBtn = document.getElementById("saveBtn");
  const titleInput = document.getElementById("drawingTitle");
  const library = document.getElementById("library");

  const pixelSize = 15;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;
  let keyIsHeld = false;
  let lockedColor = null;
  let touchColorLocked = null;
  let longPressTimeout = null;
  let drawnPixels = [];

  function resizeCanvas() {
    canvas.width = 300;
    canvas.height = 300;
  }
  resizeCanvas();

  function snapToGrid(value) {
    return Math.floor(value / pixelSize) * pixelSize;
  }

  function getCanvasPos(event) {
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (event.touches && event.touches[0]) {
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    } else {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }
    return {
      x: snapToGrid(x),
      y: snapToGrid(y),
    };
  }

  function getColor(dx, dy, dt) {
    const dragAngle = 180 * Math.atan2(dx, dy) / Math.PI;
    const speed = Math.sqrt(dx * dx + dy * dy) / dt;
    return `hsl(${dragAngle}, 86%, ${30 + Math.min(speed * 1000, 50)}%)`;
  }

  function addPixel(x, y, color) {
    drawnPixels.push({ x, y, size: pixelSize, color });
    ctx.fillStyle = color;
    ctx.fillRect(x, y, pixelSize, pixelSize);
  }

  function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    const { x, y } = getCanvasPos(e);
    lastX = x;
    lastY = y;
    lastTime = performance.now();
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCanvasPos(e);
    const dx = x - lastX;
    const dy = y - lastY;
    const dt = performance.now() - lastTime;
    if (dx === 0 && dy === 0) return;

    const rainbowColor = getColor(dx, dy, dt);
    const color = keyIsHeld
      ? (lockedColor ||= rainbowColor)
      : touchColorLocked || rainbowColor;

    addPixel(x, y, color);

    lastX = x;
    lastY = y;
    lastTime = performance.now();
  }

  function stopDrawing() {
    isDrawing = false;
  }

  function touchStart(e) {
    e.preventDefault();
    startDrawing(e);
    longPressTimeout = setTimeout(() => {
      const { x, y } = getCanvasPos(e);
      const dx = x - lastX;
      const dy = y - lastY;
      const dt = performance.now() - lastTime;
      touchColorLocked = getColor(dx, dy, dt);
    }, 2500);
  }

  clearBtn.addEventListener("click", () => {
    drawnPixels = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // ===== SAVE/LOAD LIBRARY =====
  function saveDrawing() {
    const name = titleInput.value.trim();
    if (!name) {
      alert("Please enter a name.");
      return;
    }

    if (drawnPixels.length === 0) {
      alert("Draw something first!");
      return;
    }

    const dataURL = canvas.toDataURL("image/png");
    const drawing = {
      id: Date.now(),
      title: name,
      dataURL,
    };

    const stored = JSON.parse(localStorage.getItem("drawingLibrary") || "[]");
    stored.push(drawing);
    localStorage.setItem("drawingLibrary", JSON.stringify(stored));
    titleInput.value = "";
    renderLibrary();
  }

  function renderLibrary() {
    library.innerHTML = "";
    const stored = JSON.parse(localStorage.getItem("drawingLibrary") || "[]");

    stored.forEach(item => {
      const wrapper = document.createElement("div");
      wrapper.className = "library-item";
      wrapper.title = item.title;

      const thumb = document.createElement("canvas");
      thumb.width = 80;
      thumb.height = 80;

      const img = new Image();
      img.onload = () => {
        const thumbCtx = thumb.getContext("2d");
        thumbCtx.drawImage(img, 0, 0, thumb.width, thumb.height);
      };
      img.src = item.dataURL;

      const label = document.createElement("div");
      label.textContent = item.title;

      wrapper.appendChild(thumb);
      wrapper.appendChild(label);

      // Load back into canvas on double click
      wrapper.ondblclick = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const fullImg = new Image();
        fullImg.onload = () => {
          ctx.drawImage(fullImg, 0, 0, canvas.width, canvas.height);
        };
        fullImg.src = item.dataURL;
      };

      library.appendChild(wrapper);
    });
  }

  saveBtn.addEventListener("click", saveDrawing);

  // ===== Event listeners =====
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("touchstart", touchStart, { passive: false });
  window.addEventListener("mousemove", draw);
  window.addEventListener("touchmove", draw, { passive: false });
  window.addEventListener("mouseup", () => {
    stopDrawing();
    lockedColor = null;
  });
  window.addEventListener("touchend", () => {
    clearTimeout(longPressTimeout);
    touchColorLocked = null;
    stopDrawing();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Shift") keyIsHeld = true;
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "Shift") {
      keyIsHeld = false;
      lockedColor = null;
    }
  });

  renderLibrary();
});
