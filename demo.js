const matrix = Array.from({ length: 15 }, () =>
  Array.from({ length: 15 }, () => 0)
);

let searched = new PF.utils.Queue();
const grid = PF.utils.interceptGridOperations(
  new PF.Grid(matrix),
  function (fnName, _, res) {
    if (fnName !== "getNeighbors") return;
    for (let i = 0; i < res.length; i++)
      if (!searched.contains(res[i])) searched.enqueue(res[i]);
  }
);

const size = PF.settings.squareSize;
const sx = 0,
  sy = 0;
const finder = new PF.Algorithms.AStar();
const result = finder.findPath(sx, sy, 14, 14, grid);

const [canvas, ctx] = PF.utils.new2dCanvas("play-area", 600, 600);

function drawGrid() {
  ctx.strokeStyle = "grey";
  for (let i = 0; i < matrix.length; i++)
    for (let j = 0; j < matrix[i].length; j++) {
      ctx.fillStyle = matrix[j][i] ? "blue" : "white";
      ctx.fillRect(j * size, i * size, size, size);
      ctx.strokeRect(j * size, i * size, size, size);
    }
}

let drawn = [];
let frame = 0;
const drawInterval = 0.05 * PF.settings.fps;
function drawSearchPath() {
  if (frame % drawInterval === 0 && searched.size)
    drawn.push(searched.dequeue());
  for (let i = 0; i < drawn.length; i++) {
    const pos = drawn[i];
    ctx.fillStyle = "green";
    ctx.fillRect(pos.x * size, pos.y * size, size, size);
    ctx.strokeRect(pos.x * size, pos.y * size, size, size);
  }
}

function drawPath() {
  for (let i = 0; i < result.length; i++) {
    const pos = result[i];
    ctx.fillStyle = "yellow";
    ctx.fillRect(pos[1] * size, pos[0] * size, size, size);
    ctx.strokeRect(pos[1] * size, pos[0] * size, size, size);
  }
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawSearchPath();
  if (!searched.size) drawPath();
  frame++;
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
