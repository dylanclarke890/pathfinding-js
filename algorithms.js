// Create a 4x4 grid
// Represent the grid as a 2-dimensional array
const gridSize = 4;
let grid = [];
for (let i = 0; i < gridSize; i++) {
  grid[i] = [];
  for (let j = 0; j < gridSize; j++) {
    grid[i][j] = "Empty";
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

  let queue = new Queue([location]);

  // Loop through the grid searching for the goal
  while (queue.size > 0) {
    // Take the first location off the queue
    const currentLocation = queue.dequeue();

    // Explore North
    const north = exploreInDirection(currentLocation, "North", grid);
    if (north.status === "Goal") return north.path;
    else if (north.status === "Valid") queue.enqueue(north);

    // Explore East
    const east = exploreInDirection(currentLocation, "East", grid);
    if (east.status === "Goal") return east.path;
    else if (east.status === "Valid") queue.enqueue(east);

    // Explore South
    const south = exploreInDirection(currentLocation, "South", grid);
    if (south.status === "Goal") return south.path;
    else if (south.status === "Valid") queue.enqueue(south);

    // Explore West
    const west = exploreInDirection(currentLocation, "West", grid);
    if (west.status === "Goal") return west.path;
    else if (west.status === "Valid") queue.enqueue(west);
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
