const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let erasing = false;
let lastX = 0;
let lastY = 0;

// ========== Drawing Logic ==========
canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  const rect = canvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
});

canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseout", () => drawing = false);

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  ctx.strokeStyle = erasing ? "white" : "black";
  ctx.lineWidth = erasing ? 20 : 2;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

  lastX = x;
  lastY = y;
});

// ========== Tool Buttons ==========
const brushBtn = document.getElementById("brush");
const eraserBtn = document.getElementById("eraser");

brushBtn.addEventListener("click", () => {
  erasing = false;
  brushBtn.classList.add("active");
  eraserBtn.classList.remove("active");
});

eraserBtn.addEventListener("click", () => {
  erasing = true;
  eraserBtn.classList.add("active");
  brushBtn.classList.remove("active");
});

// ========== Canvas Utilities ==========
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function sendCanvasData() {
  const imageData = canvas.toDataURL("image/png");
  fetch("http://localhost:8000", {
    method: "POST",
    body: imageData,
    headers: { "Content-Type": "text/plain" }
  })
    .then(res => res.text())
    .then(msg => console.log(msg));
}

// Save: Export only, retain drawing
document.getElementById("save").addEventListener("click", () => {
  localStorage.setItem("loadSketch", "true"); // Set flag to load sketch
  sendCanvasData();
});

// Save & Clear: Export + Clear
document.getElementById("saveClear").addEventListener("click", () => {
  localStorage.setItem("loadSketch", "false"); // Prevent loading
  sendCanvasData();
  setTimeout(clearCanvas, 100);
});

// Discard: just clear
document.getElementById("discard").addEventListener("click", () => {
  localStorage.setItem("loadSketch", "false"); // Prevent loading
  clearCanvas();
});


// ========== Load Latest Sketch on Page Load ==========
window.onload = () => {
  brushBtn.classList.add("active");

  const shouldLoad = localStorage.getItem("loadSketch");

  // Clear the flag after reading
  localStorage.removeItem("loadSketch");

  // Only load if previous action was "save"
  if (shouldLoad === "true") {
    let n = 1000;
    function tryLoadNext() {
      if (n <= 0) return;
      const path = `sketches/${n}.png`;
      fetch(path).then(res => {
        if (res.ok) {
          res.blob().then(blob => {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0);
            img.src = URL.createObjectURL(blob);
          });
        } else {
          n--;
          tryLoadNext();
        }
      }).catch(() => {
        n--;
        tryLoadNext();
      });
    }
    tryLoadNext();
  }
};
