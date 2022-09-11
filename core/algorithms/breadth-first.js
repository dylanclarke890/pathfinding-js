var PF = PF || {};
PF.Algorithms = PF.Algorithms || {};

PF.Algorithms.BreadthFirst = class {
  /**
   * Breadth-First-Search path finder.
   * @constructor
   * @param {Object} opt
   * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement. Defaults to "Never".
   */
  constructor(opt) {
    opt = opt || {};
    this.diagonalMovement =
      opt.diagonalMovement || PF.enums.DiagonalMovement.Never;
  }

  /**
   * Find and return the the path.
   * @return {Array<Array<number>>} The path, including both start and
   * end positions.
   */
  findPath(startX, startY, endX, endY, grid) {
    const openList = new PF.Data.Queue(),
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

