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


//------------------- Rhino Lines ---------------------------
// Function to load and draw Rhino-exported vector lines from a JSON file
function loadRhinoLines() {
  fetch("rhino-lines/rhino-lines.json")
    .then((response) => response.json())
    .then((data) => {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 1;

      data.forEach((line) => {
        if (line.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(line[0][0] * canvas.width, (1 - line[0][1]) * canvas.height);
        for (let i = 1; i < line.length; i++) {
          ctx.lineTo(line[i][0] * canvas.width, (1 - line[i][1]) * canvas.height);
        }
        ctx.stroke();
      });
    })
    .catch((err) => console.error("Error loading rhino lines:", err));
}



// ========== Load Latest Sketch on Page Load ==========
window.onload = () => {
  // Set brush as the default active tool
  brushBtn.classList.add("active");

  // Check if we should load a previously saved sketch
  const shouldLoad = localStorage.getItem("loadSketch");

  // Clear the flag to prevent repeated loading
  localStorage.removeItem("loadSketch");

  // Function to load and draw Rhino lines from JSON
  function drawRhinoLinesAfterSketch() {
    loadRhinoLines(); // <-- this draws the Rhino lines
  }

  // If the flag is set to true, load the last saved sketch
  if (shouldLoad === "true") {
    let n = 1000;
    function tryLoadNext() {
      if (n <= 0) {
        drawRhinoLinesAfterSketch(); // Even if no sketch found, still draw Rhino lines
        return;
      }

      const path = `sketches/${n}.png`;
      fetch(path)
        .then(res => {
          if (res.ok) {
            res.blob().then(blob => {
              const img = new Image();
              img.onload = () => {
                ctx.drawImage(img, 0, 0);
                drawRhinoLinesAfterSketch(); // Draw Rhino lines AFTER the sketch is loaded
              };
              img.src = URL.createObjectURL(blob);
            });
          } else {
            n--;
            tryLoadNext();
          }
        })
        .catch(() => {
          n--;
          tryLoadNext();
        });
    }

    tryLoadNext();

  } else {
    // If no sketch is loaded, just draw Rhino lines directly
    loadRhinoLines();
  }
};






