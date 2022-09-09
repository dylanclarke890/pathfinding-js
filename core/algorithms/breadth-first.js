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
    ["North", "East", "South", "West"].forEach((dir) => {
      const explored = exploreInDirection(currentLocation, dir, grid);
      if (explored.status === "Goal") return explored.path;
      else if (explored.status === "Valid") {
        q.enqueue(explored);
        paths.enqueue(new PF.utils.Path(explored.x, explored.y));
      }
    });
  }
  // No valid path found
  return false;
};

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

  if (x < 0 || x >= gridSize.w || y < 0 || y >= gridSize.h)
    next.status = "Invalid";
  else if (grid[y][x] === "Goal") next.status = "Goal";
  else if (grid[y][x] !== "Empty") next.status = "Blocked";
  else next.status = "Valid";

  // If this new location is valid, mark it as 'Visited'
  if (next.status === "Valid") grid[next.y][next.x] = "Visited";
  return next;
}

PF.Algorithms.BreadthFirst = class {
  /**
   * Breadth-First-Search path finder.
   * @constructor
   * @param {Object} opt
   * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement. Defaults to "Never".
   */
  constructor(opt) {
    opt = opt || {};
    this.diagonalMovement = opt.diagonalMovement || PF.DiagonalMovement.Never;
  }

  /**
   * Find and return the the path.
   * @return {Array<Array<number>>} The path, including both start and
   * end positions.
   */
  findPath(startX, startY, endX, endY, grid) {
    const openList = new PF.utils.Queue(),
      startNode = grid.getNodeAt(startX, startY),
      endNode = grid.getNodeAt(endX, endY);

    // push the start pos into the queue
    openList.enqueue(startNode);
    startNode.opened = true;

    // while the queue is not empty
    while (openList.size) {
      const node = openList.dequeue(); // take the front node from the queue
      node.closed = true;
      if (node === endNode) return PF.utils.backtrace(endNode); // reached goal
      const neighbors = grid.getNeighbors(node, this.diagonalMovement);
      for (let i = 0; i < neighbors.length; ++i) {
        const neighbor = neighbors[i];
        if (neighbor.closed || neighbor.opened) continue; // skip if it has been inspected before
        openList.enqueue(neighbor);
        neighbor.opened = true;
        neighbor.parent = node;
      }
    }
    return []; // fail to find the path
  }
};

