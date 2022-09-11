var PF = PF || {};
PF.Algorithms = PF.Algorithms || {};

PF.Algorithms.BiBreadthFirst = class {
  /**
   * Bi-directional Breadth-First-Search path finder.
   * @constructor
   * @param {object} opt
   * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
   */
  constructor(opt) {
    opt = opt || {};
    this.diagonalMovement =
      opt.diagonalMovement || PF.enums.DiagonalMovement.Never;
  }
  /**
   * Find and return the the path.
   * @return {Array<Array<number>>} The path, including both start and
   *     end positions.
   */
  findPath(startX, startY, endX, endY, grid) {
    const startNode = grid.getNodeAt(startX, startY),
      endNode = grid.getNodeAt(endX, endY),
      startOpenList = new PF.Data.Queue(),
      endOpenList = new PF.Data.Queue(),
      diagonalMovement = this.diagonalMovement,
      BY_START = 0,
      BY_END = 1;

    // push the start and end nodes into the queues
    startOpenList.enqueue(startNode);
    startNode.opened = true;
    startNode.by = BY_START;

    endOpenList.enqueue(endNode);
    endNode.opened = true;
    endNode.by = BY_END;

    // while both the queues are not empty
    let node;
    while (startOpenList.size && endOpenList.size) {
      // expand start open list
      node = startOpenList.dequeue();
      node.closed = true;

      let neighbors = grid.getNeighbors(node, diagonalMovement);
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];

        if (neighbor.closed) continue;
        if (neighbor.opened) {
          // if this node has been inspected by the reversed search,
          // then a path is found.
          if (neighbor.by === BY_END)
            return PF.utils.biBacktrace(node, neighbor);
          continue;
        }
        startOpenList.enqueue(neighbor);
        neighbor.parent = node;
        neighbor.opened = true;
        neighbor.by = BY_START;
      }

      // expand end open list
      node = endOpenList.dequeue();
      node.closed = true;

      neighbors = grid.getNeighbors(node, diagonalMovement);
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        if (neighbor.closed) continue;
        if (neighbor.opened) {
          if (neighbor.by === BY_START)
            return PF.utils.biBacktrace(neighbor, node);
          continue;
        }
        endOpenList.enqueue(neighbor);
        neighbor.parent = node;
        neighbor.opened = true;
        neighbor.by = BY_END;
      }
    }

    // fail to find the path
    return [];
  }
};
