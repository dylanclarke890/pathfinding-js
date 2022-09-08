class Queue {
  get size() {
    return this.arr.length;
  }

  constructor(/** @type {any[]} */ arr) {
    this.arr = arr || [];
  }

  head() {
    return this.arr[0];
  }

  enqueue(val) {
    this.arr.push(val);
  }

  dequeue() {
    return this.arr.shift();
  }

  tail() {
    return this.arr[this.arr.length - 1];
  }
}

const SQUARESIZE = 40;

class Point {
  static colors = {
    Start: "yellow",
    Empty: "white",
    Obstacle: "black",
    Goal: "gold",
  };

  constructor(x, y, status) {
    this.x = x;
    this.y = y;
    this.status = status;
    this.squareSize = SQUARESIZE;
  }

  draw() {
    ctx.fillStyle = Point.colors[this.status];
    ctx.lineWidth = 2;
    ctx.strokeStyle = "grey";
    const x = this.x * this.squareSize,
      y = this.y * this.squareSize;
    ctx.fillRect(x, y, this.squareSize, this.squareSize);
    ctx.strokeRect(x, y, this.squareSize, this.squareSize);
  }
}

const S = "Start",
  E = "Empty",
  O = "Obstacle",
  G = "Goal";

const grid = [
  [S, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, O, O, E, O, O, E, E, E, E, E, E],
  [E, E, E, E, E, O, E, E, O, E, E, O, E, E, E, E, E],
  [E, E, E, E, E, O, E, E, E, E, E, O, E, E, E, E, E],
  [E, E, E, E, E, E, O, E, E, E, O, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, O, E, O, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E, O, E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, E, G],
];
const gridSize = { w: 17, h: 14 };

let points = [];
(function createGrid() {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      points.push(new Point(j, i, grid[i][j]));
    }
  }
})();

// Start location will be in the following format:
function findShortestPath(startCoordinates, grid) {
  const [x, y] = startCoordinates;

  // Each "location" will store its coordinates
  // and the shortest path required to arrive there
  const location = {
    y,
    x,
    path: [],
    status: "Start",
  };

  // Initialize the queue with the start location already inside
  let q = new Queue([location]);

  // Loop through the grid searching for the goal
  while (q.size > 0) {
    const currentLocation = q.dequeue();

    // Explore North
    const north = exploreInDirection(currentLocation, "North", grid);
    if (north.status === "Goal") return north.path;
    else if (north.status === "Valid") q.enqueue(north);

    // Explore East
    const east = exploreInDirection(currentLocation, "East", grid);
    if (east.status === "Goal") return east.path;
    else if (east.status === "Valid") q.enqueue(east);

    // Explore South
    const south = exploreInDirection(currentLocation, "South", grid);
    console.log(south);
    if (south.status === "Goal") return south.path;
    else if (south.status === "Valid") q.enqueue(south);

    // Explore West
    const west = exploreInDirection(currentLocation, "West", grid);
    if (west.status === "Goal") return west.path;
    else if (west.status === "Valid") q.enqueue(west);
  }
  // No valid path found
  return false;
}

// This function will check a location's status
// (a location is "valid" if it is on the grid, is not an "obstacle",
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

// Explores the grid from the given location in the given
// direction
function exploreInDirection(currentLocation, direction, grid) {
  const newPath = currentLocation.path.slice();
  newPath.push(direction);

  let { x, y } = currentLocation;
  if (direction === "North") y--;
  else if (direction === "South") y++;
  else if (direction === "West") x--;
  else if (direction === "East") x++;

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

const FPS = 60;
const settings = {
  fps: FPS,
  fpsInterval: 1000 / FPS,
};

function new2dCanvas(id, width, height) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  return [canvas, ctx];
}

const [canvas, ctx] = new2dCanvas("play-area", 680, 560);

const startPoint = [0, 0];
const result = findShortestPath(startPoint, grid);

function drawPath() {
  if (!result) return;

  let [x, y] = startPoint;
  let currentStep = 0;
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "green";
  ctx.fillText(currentStep, x + SQUARESIZE / 2, y + SQUARESIZE / 2);
  currentStep++;
  result.forEach((path) => {
    switch (path) {
      case "North":
        y--;
        break;
      case "South":
        y++;
        break;
      case "East":
        x++;
        break;
      case "West":
        x--;
        break;
      default:
        break;
    }
    ctx.fillText(
      currentStep,
      x * SQUARESIZE + SQUARESIZE / 2,
      y * SQUARESIZE + SQUARESIZE / 2
    );
    currentStep++;
  });
}

function update() {
  for (let i = 0; i < points.length; i++) {
    points[i].draw();
  }
  drawPath();
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
  if (elapsed > settings.fpsInterval) {
    lastFrame = now - (elapsed % settings.fpsInterval);
    update();
  }
}
