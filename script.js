const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let erasing = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  const rect = canvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
});

canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseout", () => drawing = false);

canvas.addEventListener("mousemove", draw);

function draw(e) {
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
}

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

document.getElementById("download").addEventListener("click", () => {
  const imageData = canvas.toDataURL("image/png");

  fetch("http://localhost:8000", {
    method: "POST",
    body: imageData,
    headers: { "Content-Type": "text/plain" }
  })
  .then(res => res.text())
  .then(msg => console.log(msg));
});



// Set default tool (brush) on load
window.onload = () => {
  brushBtn.classList.add("active");
};
