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
    headers: {
      "Content-Type": "text/plain"
    }
  })
    .then(res => res.text())
    .then(msg => console.log(msg));
}


// Save: Load latest sketch after export
document.getElementById("save").addEventListener("click", () => {
  localStorage.setItem("loadSketch", "true");
  sendCanvasData();
  setTimeout(() => loadRhinoLines(true), 200); // Load latest
});

// Save & Clear: Load sketch_1.json after export
document.getElementById("saveClear").addEventListener("click", () => {
  localStorage.setItem("loadSketch", "false");
  sendCanvasData();
  setTimeout(() => {
    clearCanvas();
    loadRhinoLines(false); // Load sketch_1
  }, 200);
});

// Discard: Just load sketch_1.json
document.getElementById("discard").addEventListener("click", () => {
  localStorage.setItem("loadSketch", "false");
  clearCanvas();
  loadRhinoLines(false); // Load sketch_1
});




const rhinoCanvas = document.getElementById("rhinoCanvas");
const rhinoCtx = rhinoCanvas.getContext("2d");

async function loadRhinoLines(useLatest = true) {
  const base = "rhino-lines/sketch_";
  let i = 1;
  let lastValid = null;

  if (useLatest) {
    // Try to find the highest numbered JSON file
    while (true) {
      const path = `${base}${i}.json`;
      try {
        const res = await fetch(path);
        if (!res.ok) break;
        lastValid = await res.json();
        i++;
      } catch {
        break;
      }
    }
  } else {
    // Load only sketch_1.json
    try {
      const res = await fetch(`${base}1.json`);
      if (res.ok) lastValid = await res.json();
    } catch {
      console.error("❌ Failed to load sketch_1.json");
    }
  }

  if (!lastValid) {
    console.error("❌ No valid Rhino sketch files found.");
    return;
  }

  rhinoCtx.clearRect(0, 0, rhinoCanvas.width, rhinoCanvas.height);
  rhinoCtx.strokeStyle = "red";
  rhinoCtx.lineWidth = 1;

  lastValid.forEach((line) => {
    if (line.length < 2) return;
    rhinoCtx.beginPath();
    rhinoCtx.moveTo(line[0][0] * rhinoCanvas.width, line[0][1] * rhinoCanvas.height);
    for (let i = 1; i < line.length; i++) {
      rhinoCtx.lineTo(line[i][0] * rhinoCanvas.width, line[i][1] * rhinoCanvas.height);
    }
    rhinoCtx.stroke();
  });
}


function drawRhinoLines(lines) {
  const rhinoCanvas = document.getElementById("rhinoCanvas");
  const rhinoCtx = rhinoCanvas.getContext("2d");

  rhinoCtx.clearRect(0, 0, rhinoCanvas.width, rhinoCanvas.height);
  rhinoCtx.strokeStyle = "red";
  rhinoCtx.lineWidth = 1;

  lines.forEach((line) => {
    if (line.length < 2) return;
    rhinoCtx.beginPath();
    rhinoCtx.moveTo(line[0][0] * rhinoCanvas.width, line[0][1] * rhinoCanvas.height);
    for (let i = 1; i < line.length; i++) {
      rhinoCtx.lineTo(line[i][0] * rhinoCanvas.width, line[i][1] * rhinoCanvas.height);
    }
    rhinoCtx.stroke();
  });
}




window.onload = () => {
  brushBtn.classList.add("active");

  const shouldLoad = localStorage.getItem("loadSketch");
  localStorage.removeItem("loadSketch");

  if (shouldLoad === "true") {
    // Load the latest sketch image and then draw rhino lines
    let n = 1000;
    function tryLoadNext() {
      if (n <= 0) {
        loadRhinoLines(true);
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
                loadRhinoLines(true);
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
    // Otherwise just draw sketch_1
    loadRhinoLines(false);
  }
};







