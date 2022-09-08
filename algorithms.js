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

class Point {
  constructor(x, y, status = "Empty") {
    this.x = x;
    this.y = y;
    this.status = status;
    this.squareSize = 40;
  }

  draw() {
    ctx.fillStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "grey";
    const x = this.x * this.squareSize,
      y = this.y * this.squareSize;
    ctx.fillRect(x, y, this.squareSize, this.squareSize);
    ctx.strokeRect(x, y, this.squareSize, this.squareSize);
  }
}

// Create a 4x4 grid
// Represent the grid as a 2-dimensional array
const gridSize = 4;
let grid = [];
let points = [];
(function createGrid() {
  for (let i = 0; i < gridSize; i++) {
    grid[i] = [];
    for (let j = 0; j < gridSize; j++) {
      grid[i][j] = "Empty";
      points.push(new Point(j, i));
    }
  }

  // Think of the first index as "distance from the top row"
  // Think of the second index as "distance from the left-most column"

  // This is how we would represent the grid with obstacles above
  grid[0][0] = "Start";
  grid[2][2] = "Goal";

  grid[1][1] = "Obstacle";
  grid[1][2] = "Obstacle";
  grid[1][3] = "Obstacle";
  grid[2][1] = "Obstacle";
})();

// Start location will be in the following format:
// [distanceFromTop, distanceFromLeft]
function findShortestPath(startCoordinates, grid) {
  const distanceFromTop = startCoordinates[0];
  const distanceFromLeft = startCoordinates[1];

  // Each "location" will store its coordinates
  // and the shortest path required to arrive there
  const location = {
    distanceFromTop: distanceFromTop,
    distanceFromLeft: distanceFromLeft,
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
  const gridSize = grid.length;
  const dft = location.distanceFromTop;
  const dfl = location.distanceFromLeft;

  if (
    location.distanceFromLeft < 0 ||
    location.distanceFromLeft >= gridSize ||
    location.distanceFromTop < 0 ||
    location.distanceFromTop >= gridSize
  ) {
    // location is not on the grid--return false
    return "Invalid";
  } else if (grid[dft][dfl] === "Goal") {
    return "Goal";
  } else if (grid[dft][dfl] !== "Empty") {
    // location is either an obstacle or has been visited
    return "Blocked";
  } else {
    return "Valid";
  }
}

// Explores the grid from the given location in the given
// direction
function exploreInDirection(currentLocation, direction, grid) {
  const newPath = currentLocation.path.slice();
  newPath.push(direction);

  let dft = currentLocation.distanceFromTop;
  let dfl = currentLocation.distanceFromLeft;

  if (direction === "North") dft -= 1;
  else if (direction === "East") dfl += 1;
  else if (direction === "South") dft += 1;
  else if (direction === "West") dfl -= 1;

  const newLocation = {
    distanceFromTop: dft,
    distanceFromLeft: dfl,
    path: newPath,
    status: "Unknown",
  };
  newLocation.status = locationStatus(newLocation, grid);

  // If this new location is valid, mark it as 'Visited'
  if (newLocation.status === "Valid")
    grid[newLocation.distanceFromTop][newLocation.distanceFromLeft] = "Visited";

  return newLocation;
}

// OK. We have the functions we need--let's run them to get our shortest path!
// Think of the first index as "distance from the top row"
// Think of the second index as "distance from the left-most column"

console.log(findShortestPath([0, 0], grid));

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

const [canvas, ctx] = new2dCanvas("play-area", 700, 560);

function update() {
  for (let i = 0; i < points.length; i++) {
    points[i].draw();
  }
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
