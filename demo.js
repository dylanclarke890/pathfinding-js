const [canvas, ctx] = PF.utils.new2dCanvas("play-area", 800, 600);

const matrixW = 15,
  matrixH = 15;
const matrix = Array.from({ length: matrixH }, () =>
  Array.from({ length: matrixW }, () => 0)
);
const size = PF.settings.squareSize;
let sx = 0,
  sy = 0,
  ex = 14,
  ey = 0;

let searched = new PF.Data.Queue();
let result = [];
let playing = false;
let paused = false;
function startSearch() {
  let grid = PF.utils.interceptGridOperations(
    new PF.Data.Grid({ matrix }),
    (fnName, _, res) => {
      switch (fnName) {
        case "getNeighbors":
          for (let i = 0; i < res.length; i++)
            if (!searched.contains(res[i])) searched.enqueue(res[i]);
          break;
        case "getNodeAt":
          if (!searched.contains(res)) searched.enqueue(res);
          break;
        default:
          return;
      }
    }
  );
  let finder = new PF.Algorithms.BestFirst({
    diagonalMovement: PF.enums.DiagonalMovement.Never,
  });
  console.log(grid.clone());
  result = finder.findPath(sx, sy, ex, ey, grid);
  console.log(result);
  playing = true;
}

let canvasPosition = canvas.getBoundingClientRect();

const mouseActions = {
  drawWalls: 1,
  eraseWalls: 2,
  moveStart: 3,
  moveGoal: 4,
};

const mouse = {
  x: 0,
  y: 0,
  w: 0.1,
  h: 0.1,
  pressing: false,
  action: mouseActions.drawWalls,
};

const uiPanelOffset =
  canvas.width - (canvas.width - matrixW * PF.settings.squareSize);
const buttons = [
  new PF.UI.Button({
    x: uiPanelOffset + 40,
    y: canvas.height - 80,
    w: 100,
    h: 40,
    font: "20px Arial",
    text: "Start",
    textColor: "purple",
    bgColor: "lightblue",
    onClick: (me) => {
      if (playing) {
        paused = !paused;
        me.text = paused ? "Resume" : "Pause";
      } else {
        startSearch();
        me.text = "Pause";
      }
    },
  }),
  new PF.UI.Button({
    x: uiPanelOffset + 40,
    y: canvas.height - 160,
    w: 100,
    h: 40,
    font: "18px Arial",
    text: "Clear Walls",
    textColor: "purple",
    bgColor: "lightblue",
    onClick: (instance) => console.log(instance),
  }),
];

const setMousePosition = (e, pressing = mouse.pressing) => {
  mouse.x = e.x - (canvasPosition.left + 6);
  mouse.y = e.y - canvasPosition.top;
  mouse.pressing = pressing;
};

canvas.addEventListener("mousedown", (e) => {
  setMousePosition(e, true);
  if (mouse.x > uiPanelOffset) return;
  const { x, y } = PF.utils.toGridCoords(mouse);
  if (x === sx && y === sy) mouse.action = mouseActions.moveStart;
  else if (x === ex && y === ey) mouse.action = mouseActions.moveGoal;
  else if (matrix[y][x]) {
    mouse.action = mouseActions.eraseWalls;
    matrix[y][x] = 0;
  } else {
    mouse.action = mouseActions.drawWalls;
    matrix[y][x] = 1;
  }
});

canvas.addEventListener("mouseup", (e) => {
  setMousePosition(e, false);
  if (mouse.x > uiPanelOffset) return;
});

canvas.addEventListener("mousemove", (e) => {
  setMousePosition(e);
  if (mouse.x > uiPanelOffset || !mouse.pressing) return;
  const { x, y } = PF.utils.toGridCoords(mouse);
  switch (mouse.action) {
    case mouseActions.drawWalls: {
      matrix[y][x] = 1;
      break;
    }
    case mouseActions.eraseWalls: {
      matrix[y][x] = 0;
      break;
    }
    case mouseActions.moveStart:
      sx = x;
      sy = y;
      break;
    case mouseActions.moveGoal:
      ex = x;
      ey = y;
      break;
    default:
      break;
  }
});

window.addEventListener("resize", () => {
  canvasPosition = canvas.getBoundingClientRect();
});

function rectsAreColliding(first, second) {
  if (!first || !second) return false;
  if (
    !(
      first.x > second.x + second.w ||
      first.x + first.w < second.x ||
      first.y > second.y + second.h ||
      first.y + first.h < second.y
    )
  ) {
    return true;
  }
  return false;
}

canvas.addEventListener("click", (e) => {
  setMousePosition(e);
  if (mouse.x <= uiPanelOffset) return;
  for (let i = 0; i < buttons.length; i++)
    if (rectsAreColliding(buttons[i], mouse)) buttons[i].clicked(e);
});

let obstacles = [];
function drawGrid() {
  ctx.strokeStyle = "grey";
  ctx.fillStyle = "white";
  obstacles = [];
  for (let y = 0; y < matrix.length; y++)
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x]) obstacles.push([x, y]);
      else {
        ctx.fillRect(x * size, y * size, size, size);
        ctx.strokeRect(x * size, y * size, size, size);
      }
    }
}

function drawObstacles() {
  ctx.fillStyle = "blue";
  for (let i = 0; i < obstacles.length; i++) {
    const [x, y] = obstacles[i];
    ctx.fillRect(x * size, y * size, size, size);
    ctx.strokeRect(x * size, y * size, size, size);
  }
}

function drawUI() {
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].draw();
  }
}

let drawn = [];
let frame = 0;
const drawInterval = 0.05 * PF.settings.fps;
function drawSearchPath() {
  if (!paused && searched.size && frame % drawInterval === 0)
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
    ctx.fillRect(pos[0] * size, pos[1] * size, size, size);
    ctx.strokeRect(pos[0] * size, pos[1] * size, size, size);
  }
}

function drawPoints() {
  ctx.fillStyle = "orange";
  ctx.fillRect(sx * size, sy * size, size, size);
  ctx.strokeRect(sx * size, sy * size, size, size);
  ctx.fillStyle = "lightblue";
  ctx.fillRect(ex * size, ey * size, size, size);
  ctx.strokeRect(ex * size, ey * size, size, size);
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawSearchPath();
  drawObstacles();
  if (!searched.size) drawPath();
  drawPoints();
  drawUI();
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
