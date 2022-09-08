const [canvas, ctx] = PF.utils.new2dCanvas("play-area", 680, 560);

const S = "Start",
  E = "Empty",
  O = "Obstacle",
  G = "Goal";

const grids = [
  {
    startPoint: [0, 13],
    g: [
      [E, E, E, E, E, E, E, E, O, E, E, E, E, E, E, E, E],
      [E, O, E, O, O, O, O, E, E, O, E, O, O, O, O, O, E],
      [E, O, E, E, E, E, E, O, E, E, E, O, E, E, E, E, E],
      [E, E, O, O, O, O, E, O, E, O, O, O, E, O, O, O, O],
      [O, E, O, E, E, E, E, O, E, E, E, O, E, E, E, E, E],
      [E, E, O, E, O, O, O, O, O, O, E, O, O, O, O, O, E],
      [E, O, E, E, E, E, E, E, E, O, E, O, E, E, E, E, E],
      [E, O, E, O, O, O, E, O, E, O, E, O, E, O, O, O, O],
      [E, E, E, E, E, O, E, E, O, E, E, O, E, E, E, E, E],
      [O, E, O, O, E, E, E, O, E, E, O, E, O, E, O, E, E],
      [O, E, E, O, O, O, O, E, E, O, E, E, E, O, E, O, E],
      [E, E, O, E, E, E, E, E, O, E, E, O, E, E, E, E, E],
      [E, O, E, E, O, O, O, O, E, E, O, E, E, O, E, O, O],
      [S, O, O, E, E, E, E, E, E, O, E, E, O, E, E, E, G],
    ],
  },
  {
    startPoint: [8, 7],
    g: [
      [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E, S, E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, G],
    ],
  },
];
const gridSize = { w: 17, h: 14 };

const usingG = grids[1];
const gridInUse = usingG.g;
const startPoint = usingG.startPoint;

let points = [];
let paths = new PF.utils.Queue();
(function createGrid() {
  for (let i = 0; i < gridInUse.length; i++) {
    for (let j = 0; j < gridInUse[i].length; j++) {
      points.push(new PF.utils.Point(j, i, gridInUse[i][j]));
    }
  }
})();

const result = PF.Algorithms.breadthFirst(startPoint, gridInUse);

function drawPath() {
  if (!result) return;
  const { squareSize } = PF.settings;

  let [x, y] = startPoint;
  let currentStep = 0;
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "green";
  ctx.fillText(
    currentStep,
    x * squareSize + squareSize / 2,
    y * squareSize + squareSize / 2
  );
  currentStep++;
  result.forEach((path) => {
    ({ x, y } = PF.utils.moveInDirection({ x, y }, path));
    ctx.fillText(
      currentStep,
      x * squareSize + squareSize / 2,
      y * squareSize + squareSize / 2
    );
    currentStep++;
  });
}

let frame = 0;
let drawnPaths = [];
function drawSearchPath() {
  const { fps, searchPathDrawInterval } = PF.settings;
  const interval = fps * searchPathDrawInterval;
  if (frame % interval === 0) {
    drawnPaths.push(paths.dequeue());
  }
}

function update() {
  for (let i = 0; i < points.length; i++) {
    points[i].draw();
  }
  for (let i = 0; i < drawnPaths.length; i++) {
    if (drawnPaths[i]) drawnPaths[i].draw();
  }
  drawSearchPath();
  if (paths.size === 0) {
    drawPath();
  }
  frame++;
}

let stop = false,
  now,
  lastFrame;

(function startAnimating() {
  lastFrame = window.performance.now();
  animate();
})();

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
