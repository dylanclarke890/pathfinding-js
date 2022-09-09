const [canvas, ctx] = PF.utils.new2dCanvas("play-area", 680, 560);
const matrix = Array.from({ length: 15 }, () =>
  Array.from({ length: 15 }, () => 0)
);
const grid = new PF.Grid(matrix);
const finder = new PF.Algorithms.BreadthFirst();

const cellSize = 40;
const sx = 5,
  sy = 5;
const result = finder.findPath(sx, sy, 9, 9, grid);

function drawGrid() {
  for (let i = 0; i < matrix.length; i++)
    for (let j = 0; j < matrix[i].length; j++) {
      ctx.fillStyle = matrix[j][i] ? "blue" : "white";
      ctx.strokeStyle = "grey";
      ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
    }
}

function drawPath() {
  for (let i = 0; i < result.length; i++) {
    const pos = result[i];
    ctx.fillStyle = "yellow";
    ctx.strokeStyle = "grey";
    ctx.fillRect(pos[1] * cellSize, pos[0] * cellSize, cellSize, cellSize);
    ctx.strokeRect(pos[1] * cellSize, pos[0] * cellSize, cellSize, cellSize);
  }
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawPath();
}

let stop = false,
  now,
  lastFrame;

function animate(newtime) {
  if (stop) return;
  requestAnimationFrame(animate);
  now = newtime;
  const elapsed = now - lastFrame;
  if (elapsed > PF.settings.fpsInterval) {
    lastFrame = now - (elapsed % PF.settings.fpsInterval);
    update();
  }
}

(function startAnimating() {
  lastFrame = window.performance.now();
  animate();
})();
