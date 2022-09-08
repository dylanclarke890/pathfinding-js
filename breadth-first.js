var PF = PF || {};
PF.Algorithms = PF.Algorithms || {};

PF.Algorithms.breadthFirst = function (startCoordinates, grid) {
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
};

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

// Explores the grid from the given location in the given direction
function exploreInDirection(currentLocation, direction, grid) {
  const newPath = currentLocation.path.slice();
  newPath.push(direction);

  let { x, y } = PF.utils.moveInDirection(currentLocation, direction);

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
