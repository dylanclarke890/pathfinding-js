PF.Algorithms.AStar = class {
  /** A* path finder.
   * @constructor
   * @param {Object} opt
   * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement. Defaults to "Never".
   * @param {function} opt.heuristic Heuristic function to estimate the distance.
   * (Defaults to "manhattan".
   * @param {number} opt.weight Weight to apply to the heuristic to allow for
   *     suboptimal paths, in order to speed up the search.
   */
  constructor(opt) {
    opt = opt || {};
    this.heuristic = opt.heuristic || PF.Heuristic.manhattan;
    this.weight = opt.weight || 1;
    this.diagonalMovement =
      opt.diagonalMovement || PF.enums.DiagonalMovement.Never;
    // When diagonal movement is allowed the manhattan heuristic is not
    // admissible. It should be octile instead
    this.heuristic =
      this.diagonalMovement === PF.enums.DiagonalMovement.Never
        ? opt.heuristic || PF.Heuristic.manhattan
        : opt.heuristic || PF.Heuristic.octile;
  }
  /**
   * Find and return the the path.
   * @return {Array<Array<number>>} The path, including both start and
   *     end positions.
   */
  findPath(startX, startY, endX, endY, grid) {
    const openList = new PF.Data.Heap((nodeA, nodeB) => nodeA.f - nodeB.f);
    const startNode = grid.getNodeAt(startX, startY),
      endNode = grid.getNodeAt(endX, endY);

    // set the `g` and `f` value of the start node to be 0
    startNode.g = 0;
    startNode.f = 0;

    // push the start node into the open list
    openList.push(startNode);
    startNode.opened = true;

    // while the open list is not empty
    while (!openList.empty()) {
      // pop the position of node which has the minimum `f` value.
      const node = openList.pop();
      node.closed = true;

      // if reached the end position, construct the path and return it
      if (node === endNode) return PF.utils.backtrace(endNode);

      // get neigbours of the current node
      const neighbors = grid.getNeighbors(node, this.diagonalMovement);
      for (let i = 0, l = neighbors.length; i < l; ++i) {
        const neighbor = neighbors[i];
        if (neighbor.closed) continue;

        let x = neighbor.x,
          y = neighbor.y;

        // get the distance between current node and the neighbor
        // and calculate the next g score
        const ng =
          node.g + (x - node.x === 0 || y - node.y === 0 ? 1 : Math.SQRT2);

        // check if the neighbor has not been inspected yet, or
        // can be reached with smaller cost from the current node
        if (!neighbor.opened || ng < neighbor.g) {
          neighbor.g = ng;
          neighbor.h =
            neighbor.h ||
            this.weight *
              this.heuristic(Math.abs(x - endX), Math.abs(y - endY));
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = node;

          if (!neighbor.opened) {
            openList.push(neighbor);
            neighbor.opened = true;
          } else {
            // the neighbor can be reached with smaller cost.
            // Since its f value has been updated, we have to
            // update its position in the open list
            openList.updateItem(neighbor);
          }
        }
      } // end for each neighbor
    } // end of while

    return []; // failed to find the path
  }
};
