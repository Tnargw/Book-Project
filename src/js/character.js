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
  
    // Setup canvas size (adjust as needed)
    function resizeCanvas() {
      canvas.width = 300; // or whatever fixed size you want
      canvas.height = 300;
    }
    resizeCanvas();
  
    const pixelSize = 15;
    const pixelLifetime = 8000;
  
    // Drawing state
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let keyIsHeld = false;
    let lockedColor = null;
    let touchColorLocked = null;
    let longPressTimeout = null;
    let drawnPixels = [];
  
    // Helpers
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
  
    // Calculate color based on drag angle & speed
    function getColor(dx, dy, dt) {
      const dragAngle = 180 * Math.atan2(dx, dy) / Math.PI;
      const speed = Math.sqrt(dx * dx + dy * dy) / dt;
      return `hsl(${dragAngle}, 86%, ${30 + Math.min(speed * 1000, 50)}%)`;
    }
  
    // Draw pixel and store for animation
    function addPixel(x, y, color) {
      drawnPixels.push({
        x: x,
        y: y,
        size: pixelSize,
        color,
        createdAt: performance.now(),
      });
    }
  
    // Event handlers
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
  
    // Touch long press to lock color
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
  
    // Clear canvas and pixels
    clearBtn.addEventListener("click", () => {
      drawnPixels = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
  
    // Save character to localStorage
    continueBtn.addEventListener("click", () => {
      const name = customNameInput.value.trim();
      if (!name) {
        alert("Please enter a name for your character.");
        return;
      }
      // Draw current pixels to canvas first
      // Then save canvas image as dataURL
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawnPixels.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      const imageDataURL = canvas.toDataURL("image/png");
      const characterData = { name, image: imageDataURL };
      localStorage.setItem("customCharacter", JSON.stringify(characterData));
      alert("Character saved!");
    });
  
    // Premade character selection (your existing code)
    const characterOptions = document.querySelectorAll(".character-option");
    characterOptions.forEach(option => {
      option.addEventListener("click", () => {
        const name = option.getAttribute("data-character");
        const img = option.querySelector("img");
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        tempCanvas.width = img.naturalWidth;
        tempCanvas.height = img.naturalHeight;
        tempCtx.drawImage(img, 0, 0);
        const imageDataURL = tempCanvas.toDataURL("image/png");
        const characterData = { name, image: imageDataURL };
        localStorage.setItem("customCharacter", JSON.stringify(characterData));
        alert(`You selected ${name}! Character saved.`);
      });
    });
  
    // Animation loop for drawing & fading pixels
    function animate() {
      const now = performance.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      drawnPixels = drawnPixels.filter(pixel => {
        const age = now - pixel.createdAt;
        if (isDrawing) {
          // While drawing, keep pixels fully visible
          ctx.globalAlpha = 1;
          ctx.fillStyle = pixel.color;
          ctx.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);
          return true;
        }
        if (age >= pixelLifetime) return false; // remove old pixels
  
        // Fade out with some random flicker (blip)
        const lifeProgress = age / pixelLifetime;
        const blipProbability = Math.pow(lifeProgress, 3) * 0.1;
        if (Math.random() < blipProbability) return false;
  
        ctx.globalAlpha = 1 - lifeProgress;
        ctx.fillStyle = pixel.color;
        ctx.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);
        ctx.globalAlpha = 1;
        return true;
      });
  
      requestAnimationFrame(animate);
    }
    animate();
  
    // Event listeners
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
  