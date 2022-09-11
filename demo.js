const [canvas, ctx] = PF.utils.new2dCanvas("play-area", 850, 600);
let canvasPosition = canvas.getBoundingClientRect();
window.addEventListener("resize", () => {
  canvasPosition = canvas.getBoundingClientRect();
});

const matrix = Array.from({ length: PF.settings.matrixSize }, () =>
  Array.from({ length: PF.settings.matrixSize }, () => 0)
);

const uiPanelOffset =
  canvas.width -
  (canvas.width - PF.settings.matrixSize * PF.settings.squareSize);
const buttons = {
  clearWalls: new PF.UI.Button({
    x: uiPanelOffset + 135,
    y: canvas.height - 140,
    w: 100,
    h: 40,
    font: "18px Arial",
    text: "Clear Walls",
    textColor: "purple",
    bgColor: "lightblue",
    onClick: () => {
      if (playing) return;
      for (let i = 0; i < obstacles.length; i++) {
        const [x, y] = obstacles[i];
        matrix[y][x] = 0;
      }
      obstacles = [];
    },
  }),
  start: new PF.UI.Button({
    x: uiPanelOffset + 15,
    y: canvas.height - 140,
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
        buttons.restart.hidden = !paused;
      } else {
        startSearch();
        me.text = "Pause";
        buttons.clearWalls.hidden = true;
        buttons.cancel.hidden = false;
      }
    },
  }),
  cancel: new PF.UI.Button({
    x: uiPanelOffset + 15,
    y: canvas.height - 80,
    w: 100,
    h: 40,
    font: "20px Arial",
    text: "Cancel",
    textColor: "purple",
    bgColor: "lightblue",
    onClick: (me) => {
      playing = false;
      paused = false;
      searched = new PF.Data.Queue();
      result = [];
      drawn = [];
      me.hidden = true;
      buttons.start.text = "Start";
      buttons.clearWalls.hidden = false;
      buttons.restart.hidden = true;
    },
    hidden: true,
  }),
  restart: new PF.UI.Button({
    x: uiPanelOffset + 135,
    y: canvas.height - 80,
    w: 100,
    h: 40,
    font: "20px Arial",
    text: "Restart",
    textColor: "purple",
    bgColor: "lightblue",
    onClick: (me) => {
      startSearch();
      playing = true;
      paused = false;
      me.hidden = true;
      buttons.start.text = "Pause";
      buttons.cancel.hidden = false;
    },
    hidden: true,
  }),
};

let sx = 0,
  sy = 0,
  ex = 14,
  ey = 14;

const selected = {
  algorithm: PF.enums.Algo.BreadthFirst,
  heuristic: PF.enums.Heuristic.Manhattan,
  allowDiagonal: false,
  crossCorners: false,
  bi: false,
};

let searched = new PF.Data.Queue();
let result = [];
let playing = false;
let paused = false;
function startSearch() {
  searched = new PF.Data.Queue();
  drawn = [];
  result = [];
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
  const { algorithm, heuristic, allowDiagonal, crossCorners, bi } = selected;
  const pathFinder = new PF.PathFinder({
    algorithmType: algorithm,
    heuristicType: heuristic,
    allowDiagonal,
    crossCorners,
    bi,
  });
  result = pathFinder.findPath(sx, sy, ex, ey, grid);
  playing = true;
}

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

(function setUpEvents() {
  const setMousePosition = (e, pressing = mouse.pressing) => {
    mouse.x = e.x - (canvasPosition.left + 6);
    mouse.y = e.y - canvasPosition.top;
    mouse.pressing = pressing;
  };

  canvas.addEventListener("mousedown", (e) => {
    setMousePosition(e, true);
    if (playing || mouse.x > uiPanelOffset) return;
    const { x, y } = PF.utils.toGridCoords(mouse);
    searched = new PF.Data.Queue();
    result = [];
    drawn = [];
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

  canvas.addEventListener("mouseleave", (e) => {
    setMousePosition(e, false);
  });

  canvas.addEventListener("mouseup", (e) => {
    setMousePosition(e, false);
  });

  canvas.addEventListener("mousemove", (e) => {
    setMousePosition(e);
    if (playing || mouse.x > uiPanelOffset || !mouse.pressing) return;
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

  canvas.addEventListener("click", (e) => {
    setMousePosition(e);
    if (mouse.x <= uiPanelOffset) return;
    for (let i = 0; i < heuristics.length; i++) {
      const option = heuristics[i];
      if (
        rectsAreColliding(
          {
            x: option.x - 50,
            y: option.y - 15,
            w: 100,
            h: 30,
          },
          mouse
        )
      ) {
        selected.heuristic = option.val;
        return;
      }
    }
    for (let i = 0; i < algorithms.length; i++) {
      const option = algorithms[i];
      if (
        rectsAreColliding(
          {
            x: option.x - 50,
            y: option.y - 15,
            w: 100,
            h: 30,
          },
          mouse
        )
      ) {
        selected.algorithm = option.val;
        checkboxes[2].show = option.bi;
        return;
      }
    }
    for (let i = 0; i < checkboxes.length; i++) {
      const option = checkboxes[i];
      if (
        rectsAreColliding(
          {
            x: option.x - 50,
            y: option.y - 15,
            w: 100,
            h: 30,
          },
          mouse
        )
      ) {
        selected[option.key] = !selected[option.key];
        return;
      }
    }
    for (const button in buttons) {
      const btn = buttons[button];
      if (!btn.hidden && rectsAreColliding(btn, mouse)) btn.clicked(e);
    }
  });
})();

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

function drawCell(
  x,
  y,
  fillStyle = "white",
  size = PF.settings.squareSize,
  strokeStyle = "grey"
) {
  ctx.fillStyle = fillStyle;
  ctx.strokeStyle = strokeStyle;
  ({ x, y } = PF.utils.toPageCoords({ x, y }));
  ctx.fillRect(x, y, size, size);
  ctx.strokeRect(x, y, size, size);
}

let obstacles = [];
function drawGrid() {
  ctx.strokeStyle = "grey";
  ctx.fillStyle = "white";
  obstacles = [];
  for (let y = 0; y < matrix.length; y++)
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x]) obstacles.push([x, y]);
      else {
        drawCell(x, y);
      }
    }
}

function drawObstacles() {
  for (let i = 0; i < obstacles.length; i++) {
    const [x, y] = obstacles[i];
    drawCell(x, y, "blue");
  }
}

const panelCenter = (canvas.width - uiPanelOffset) / 2;
const heuristics = [
  {
    name: "Manhattan",
    val: PF.enums.Heuristic.Manhattan,
    x: uiPanelOffset + panelCenter / 2,
    y: 280,
  },
  {
    name: "Euclidean",
    val: PF.enums.Heuristic.Euclidean,
    x: uiPanelOffset + panelCenter + panelCenter / 2,
    y: 280,
  },
  {
    name: "Octile",
    val: PF.enums.Heuristic.Octile,
    x: uiPanelOffset + panelCenter / 2,
    y: 310,
  },
  {
    name: "Chebyshev",
    val: PF.enums.Heuristic.Chebyshev,
    x: uiPanelOffset + panelCenter + panelCenter / 2,
    y: 310,
  },
];
function drawHeuristicOptions() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Heuristic", uiPanelOffset + panelCenter, 250);

  ctx.font = "16px Arial";
  for (let i = 0; i < heuristics.length; i++) {
    const option = heuristics[i];
    ctx.fillStyle = option.val === selected.heuristic ? "gold" : "white";
    ctx.fillText(option.name, option.x, option.y);
  }
}

const algorithms = [
  {
    name: "Breadth First",
    val: PF.enums.Algo.BreadthFirst,
    x: uiPanelOffset + panelCenter,
    y: 50,
    bi: true,
  },
  {
    name: "Dijkstra",
    val: PF.enums.Algo.Dijkstra,
    x: uiPanelOffset + panelCenter,
    y: 80,
    bi: true,
  },
  {
    name: "A Star",
    val: PF.enums.Algo.AStar,
    x: uiPanelOffset + panelCenter,
    y: 110,
    bi: true,
  },
  {
    name: "IDA Star",
    val: PF.enums.Algo.IDAStar,
    x: uiPanelOffset + panelCenter,
    y: 140,
    bi: false,
  },
  {
    name: "Best First",
    val: PF.enums.Algo.BestFirst,
    x: uiPanelOffset + panelCenter,
    y: 170,
    bi: true,
  },
  {
    name: "Jump Point",
    val: PF.enums.Algo.JumpPoint,
    x: uiPanelOffset + panelCenter,
    y: 200,
    bi: false,
  },
];
function drawAlgorithmOptions() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Algorithm", uiPanelOffset + panelCenter, 20);

  ctx.font = "16px Arial";
  for (let i = 0; i < algorithms.length; i++) {
    const option = algorithms[i];
    ctx.fillStyle = option.val === selected.algorithm ? "gold" : "white";
    ctx.fillText(option.name, option.x, option.y);
  }
}

const checkboxes = [
  {
    name: "Allow Diagonals",
    key: "allowDiagonal",
    x: uiPanelOffset + panelCenter / 2,
    y: canvas.height - 210,
    fontSize: 14,
    show: true,
  },
  {
    name: "Cross Corners",
    key: "crossCorners",
    x: uiPanelOffset + panelCenter + panelCenter / 2,
    y: canvas.height - 210,
    fontSize: 14,
    show: true,
  },
  {
    name: "Bidirectional",
    key: "bi",
    x: uiPanelOffset + panelCenter,
    y: canvas.height - 180,
    fontSize: 14,
    show: true,
  },
];

function drawCheckboxes() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("Options", uiPanelOffset + panelCenter, canvas.height - 240);

  for (let i = 0; i < checkboxes.length; i++) {
    const check = checkboxes[i];
    if (!check.show) return;
    ctx.font = `${check.fontSize}px Arial`;
    ctx.fillStyle = selected[check.key] ? "gold" : "white";
    ctx.fillText(check.name, check.x, check.y);
  }
}

function drawUI() {
  const btns = Object.values(buttons);
  for (let i = 0; i < btns.length; i++) btns[i].draw();
  drawHeuristicOptions();
  drawAlgorithmOptions();
  drawCheckboxes();
}

let drawn = [];
let frame = 0;
const drawInterval = 0.05 * PF.settings.fps;
function drawSearchPath() {
  if (!paused && searched.size && frame % drawInterval === 0) {
    drawn.push(searched.dequeue());
    if (!searched.size) {
      playing = false;
      buttons.clearWalls.hidden = false;
      buttons.restart.hidden = true;
      buttons.cancel.hidden = true;
      buttons.start.text = "Start";
    }
  }
  for (let i = 0; i < drawn.length; i++) {
    const pos = drawn[i];
    drawCell(pos.x, pos.y, "green");
  }
}

function drawPath() {
  for (let i = 0; i < result.length; i++) {
    const [x, y] = result[i];
    drawCell(x, y, "yellow");
  }
}

function drawPoints() {
  drawCell(sx, sy, "orange");
  drawCell(ex, ey, "lightblue");
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
