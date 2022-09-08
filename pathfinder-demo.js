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

function findShortestPath(startCoordinates, grid) {
  const [x, y] = startCoordinates;

  // Each "location" will store its coordinates and the shortest path required to arrive there
  const location = {
    y,
    x,
    path: [],
    status: "Start",
  };

  // Initialize the queue with the start location already inside
  let q = new PF.utils.Queue([location]);

  // Loop through the grid searching for the goal
  while (q.size > 0) {
    const currentLocation = q.dequeue();

    // Explore North
    const north = exploreInDirection(currentLocation, "North", grid);
    if (north.status === "Goal") return north.path;
    else if (north.status === "Valid") {
      q.enqueue(north);
      paths.enqueue(new PF.utils.Path(north.x, north.y));
    }

    // Explore East
    const east = exploreInDirection(currentLocation, "East", grid);
    if (east.status === "Goal") return east.path;
    else if (east.status === "Valid") {
      q.enqueue(east);
      paths.enqueue(new PF.utils.Path(east.x, east.y));
    }

    // Explore South
    const south = exploreInDirection(currentLocation, "South", grid);
    if (south.status === "Goal") return south.path;
    else if (south.status === "Valid") {
      q.enqueue(south);
      paths.enqueue(new PF.utils.Path(south.x, south.y));
    }

    // Explore West
    const west = exploreInDirection(currentLocation, "West", grid);
    if (west.status === "Goal") return west.path;
    else if (west.status === "Valid") {
      q.enqueue(west);
      paths.enqueue(new PF.utils.Path(west.x, west.y));
    }
  }
  // No valid path found
  return false;
}

// Will check a location's status (a location is "valid" if it is on the grid, is not an "obstacle",
// and has not yet been visited by our algorithm)
// Returns "Valid", "Invalid", "Blocked", or "Goal"
function locationStatus(location, grid) {
  const { x, y } = location;
  // location is not on the grid--return false
  if (x < 0 || x >= gridSize.w || y < 0 || y >= gridSize.h) return "Invalid";
  else if (grid[y][x] === "Goal") return "Goal";
  // location is either an obstacle or has been visited
  else if (grid[y][x] !== "Empty") return "Blocked";
  else return "Valid";
}

function moveInDirection(location, dir) {
  let { x, y } = location;
  switch (dir) {
    case "North":
      return { x, y: --y };
    case "South":
      return { x, y: ++y };
    case "East":
      return { x: ++x, y };
    case "West":
      return { x: --x, y };
    default:
      break;
  }
}

// Explores the grid from the given location in the given direction
function exploreInDirection(currentLocation, direction, grid) {
  const newPath = currentLocation.path.slice();
  newPath.push(direction);

  let { x, y } = moveInDirection(currentLocation, direction);

  const next = {
    x,
    y,
    path: newPath,
    status: "Unknown",
  };
  next.status = locationStatus(next, grid);

  // If this new location is valid, mark it as 'Visited'
  if (next.status === "Valid") grid[next.y][next.x] = "Visited";
  return next;
}

const result = findShortestPath(startPoint, gridInUse);

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
    ({ x, y } = moveInDirection({ x, y }, path));
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
