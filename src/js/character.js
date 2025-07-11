document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector(".rainbow-pixel-canvas");
  if (!canvas) {
    console.error("Canvas not found!");
    return;
  }

  const ctx = canvas.getContext("2d");
  const customNameInput = document.getElementById("customName");
  const clearBtn = document.getElementById("clearBtn");
  const continueBtn = document.getElementById("continueBtn");
  const premadeBtn = document.getElementById("premadeBtn");
  const customBtn = document.getElementById("customBtn");

  let selectedMode = "premade";
  let selectedPremade = null;

  const characterOptions = document.querySelectorAll(".character-option");

  premadeBtn.addEventListener("click", () => {
    selectedMode = "premade";
    premadeBtn.classList.add("active");
    customBtn.classList.remove("active");

    // Clear canvas if switching from draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Optional: Reset drawnPixels to ensure clean slate
    drawnPixels = [];
  });

  customBtn.addEventListener("click", () => {
    selectedMode = "draw";
    customBtn.classList.add("active");
    premadeBtn.classList.remove("active");

    // Clear character selection if switching from premade
    characterOptions.forEach(opt => opt.classList.remove("selected"));
    selectedPremade = null;
  });

  function resizeCanvas() {
    canvas.width = 300;
    canvas.height = 300;
  }
  resizeCanvas();

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
    drawnPixels.push({
      x: x,
      y: y,
      size: pixelSize,
      color,
      createdAt: performance.now(),
    });
  }

  function startDrawing(e) {
    if (selectedMode !== "draw") return;
    e.preventDefault();
    isDrawing = true;
    const { x, y } = getCanvasPos(e);
    lastX = x;
    lastY = y;
    lastTime = performance.now();
  }

  function draw(e) {
    if (!isDrawing || selectedMode !== "draw") return;
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
    if (selectedMode !== "draw") return;
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

  continueBtn.addEventListener("click", () => {
    if (selectedMode === "draw") {
      const name = customNameInput.value.trim();
      if (!name) {
        alert("Please enter a name.");
        return;
      }
      if (drawnPixels.length === 0) {
        alert("Please draw your character before continuing.");
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawnPixels.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      const imageDataURL = canvas.toDataURL("image/png");
      const characterData = { name, image: imageDataURL };
      localStorage.setItem("customCharacter", JSON.stringify(characterData));

      // Navigate after saving custom character
      window.location.href = "Playground/recommendations/bookPicker.html"; // <-- Change to your destination page
    }

    if (selectedMode === "premade") {
      if (!selectedPremade) {
        alert("Please select a character.");
        return;
      }

      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = selectedPremade.img.naturalWidth;
      tempCanvas.height = selectedPremade.img.naturalHeight;
      tempCtx.drawImage(selectedPremade.img, 0, 0);
      const imageDataURL = tempCanvas.toDataURL("image/png");

      const characterData = {
        name: selectedPremade.name,
        image: imageDataURL
      };
      localStorage.setItem("customCharacter", JSON.stringify(characterData));

      // Navigate after saving premade character
      window.location.href = "Playground/recommendations/bookPicker.html"; // <-- Change to your destination page
    }
  });

  characterOptions.forEach(option => {
    option.addEventListener("click", () => {
      if (selectedMode !== "premade") return;
      characterOptions.forEach(opt => opt.classList.remove("selected"));
      option.classList.add("selected");
      selectedPremade = {
        name: option.getAttribute("data-character"),
        img: option.querySelector("img")
      };
    });
  });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawnPixels.forEach(pixel => {
      ctx.globalAlpha = 1;
      ctx.fillStyle = pixel.color;
      ctx.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);
    });
    requestAnimationFrame(animate);
  }
  animate();

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
});
