document.addEventListener("DOMContentLoaded", () => {
  const inputEl = document.getElementById("inputText");
  const outputEl = document.getElementById("outputText");
  const translateBtn = document.getElementById("translateBtn");
  const copyOutputBtn = document.getElementById("copyOutputBtn");
  const copyContractBtn = document.getElementById("copyContractBtn");
  const toastEl = document.getElementById("toast");
  const contractText = "4wVtRm2CExz1CN3jp8ujNNhiCSKMVerdYPTXTby4pump";
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabTranslator = document.getElementById("tab-translator");
  const tabCanvas = document.getElementById("tab-canvas");
  const canvasEl = document.getElementById("drawCanvas");
  const paletteEl = document.getElementById("palette");
  const downloadCanvasBtn = document.getElementById("downloadCanvasBtn");
  const scribbleBtn = document.getElementById("scribbleBtn");

  function randomLetter(upper) {
    const code = 97 + Math.floor(Math.random() * 26);
    return upper
      ? String.fromCharCode(code).toUpperCase()
      : String.fromCharCode(code);
  }

  // Generate gibberish: length is 2x original; include scrambled original letters
  function gibberish(text) {
    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    return text.replace(/[A-Za-z]+/g, (word) => {
      const len = word.length;
      const targetLen = len * 2;

      // Base random letters
      const base = Array.from({ length: targetLen }, () => randomLetter(false));

      // Scrambled original letters (lowercase)
      const scrambled = shuffle(word.split("").map((c) => c.toLowerCase()));

      // Randomly choose positions to inject original letters
      const positions = shuffle(Array.from({ length: targetLen }, (_, i) => i));
      const injectPositions = positions.slice(0, len).sort((a, b) => a - b);
      injectPositions.forEach((pos, idx) => {
        base[pos] = scrambled[idx];
      });

      let raw = base.join("");

      // Preserve simple case patterns
      const allUpper = /^[A-Z]+$/.test(word);
      const capitalized = /^[A-Z][a-z]+$/.test(word);
      if (allUpper) return raw.toUpperCase();
      if (capitalized) return raw.charAt(0).toUpperCase() + raw.slice(1);
      return raw;
    });
  }

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    setTimeout(() => {
      toastEl.classList.remove("show");
    }, 1800);
  }

  translateBtn.addEventListener("click", () => {
    const input = inputEl.value || "";
    const out = gibberish(input);
    outputEl.value = out;
    copyOutputBtn.disabled = out.length === 0;
  });

  copyOutputBtn.addEventListener("click", async () => {
    const txt = outputEl.value;
    if (!txt) return;
    try {
      await navigator.clipboard.writeText(txt);
    } catch (e) {}
  });

  copyContractBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(contractText);
      showToast("Contract Address copied");
    } catch (e) {}
  });

  // Tabs
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.tab;
      if (target === "translator") {
        tabTranslator.hidden = false;
        tabTranslator.classList.add("active");
        tabCanvas.hidden = true;
        tabCanvas.classList.remove("active");
      } else {
        tabCanvas.hidden = false;
        tabCanvas.classList.add("active");
        tabTranslator.hidden = true;
        tabTranslator.classList.remove("active");
        resizeCanvasToContainer();
      }
    });
  });

  // Canvas drawing
  const colors = [
    "#000000",
    "#ffffff",
    "#ff3b30",
    "#ff9500",
    "#ffcc00",
    "#34c759",
    "#5ac8fa",
    "#007aff",
    "#5856d6",
    "#ff2d55",
    "#f9ed69",
    "#f08a5d",
    "#b83b5e",
    "#6a2c70",
    "#17b978",
    "#a1eafb",
    "#52575d",
    "#303a52",
    "#e23e57",
    "#00d2d3",
  ];
  let currentColor = colors[0];
  let drawing = false;
  let lastX = 0,
    lastY = 0;

  function buildPalette() {
    colors.forEach((c, idx) => {
      const sw = document.createElement("button");
      sw.className = "swatch" + (idx === 0 ? " selected" : "");
      sw.style.background = c;
      sw.setAttribute("aria-label", `Select color ${c}`);
      sw.addEventListener("click", () => {
        currentColor = c;
        paletteEl
          .querySelectorAll(".swatch")
          .forEach((el) => el.classList.remove("selected"));
        sw.classList.add("selected");
      });
      paletteEl.appendChild(sw);
    });
  }

  function getDPR() {
    return window.devicePixelRatio || 1;
  }
  function resizeCanvasToContainer() {
    if (!canvasEl) return;
    const rect = canvasEl.getBoundingClientRect();
    const dpr = getDPR();
    canvasEl.width = Math.max(1, Math.round(rect.width * dpr));
    canvasEl.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = canvasEl.getContext("2d");
    ctx.scale(dpr, dpr);
  }

  function posFromEvent(e) {
    const rect = canvasEl.getBoundingClientRect();
    if (e.touches && e.touches.length) {
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDraw(e) {
    drawing = true;
    const p = posFromEvent(e);
    lastX = p.x;
    lastY = p.y;
    drawTo(p.x, p.y, true);
    e.preventDefault();
  }
  function moveDraw(e) {
    if (!drawing) return;
    const p = posFromEvent(e);
    drawTo(p.x, p.y);
    e.preventDefault();
  }
  function endDraw() {
    drawing = false;
  }

  function drawTo(x, y, begin = false) {
    const ctx = canvasEl.getContext("2d");
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 6;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX = x;
    lastY = y;
  }

  function randomScribble() {
    const ctx = canvasEl.getContext("2d");
    const rect = canvasEl.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const margin = 16;
    let x = margin + Math.random() * (w - margin * 2);
    let y = margin + Math.random() * (h - margin * 2);
    const steps = 10 + Math.floor(Math.random() * 80); // 120-200 segments
    let jitter = Math.max(6, Math.min(w, h) / 20);
    jitter *= 2;

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 6;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 0; i < steps; i++) {
      x += (Math.random() * 2 - 1) * jitter;
      y += (Math.random() * 2 - 1) * jitter;
      if (x < margin) x = margin;
      if (y < margin) y = margin;
      if (x > w - margin) x = w - margin;
      if (y > h - margin) y = h - margin;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function initCanvas() {
    if (!canvasEl || !paletteEl) return;
    buildPalette();
    resizeCanvasToContainer();
    window.addEventListener("resize", resizeCanvasToContainer);

    canvasEl.addEventListener("mousedown", startDraw);
    window.addEventListener("mousemove", moveDraw);
    window.addEventListener("mouseup", endDraw);

    canvasEl.addEventListener("touchstart", startDraw, { passive: false });
    window.addEventListener("touchmove", moveDraw, { passive: false });
    window.addEventListener("touchend", endDraw);

    if (scribbleBtn) {
      scribbleBtn.addEventListener("click", () => {
        randomScribble();
      });
    }

    downloadCanvasBtn.addEventListener("click", () => {
      // Create an export canvas with a white background, then draw current canvas on top
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = canvasEl.width;
      exportCanvas.height = canvasEl.height;
      const exportCtx = exportCanvas.getContext("2d");

      // Fill background with white so the PNG is not transparent
      exportCtx.fillStyle = "#ffffff";
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      // Draw the current canvas content onto the white background
      exportCtx.drawImage(canvasEl, 0, 0);

      // Trigger download
      const link = document.createElement("a");
      link.download = "canvas.png";
      link.href = exportCanvas.toDataURL("image/png");
      link.click();
    });
  }

  initCanvas();
});
