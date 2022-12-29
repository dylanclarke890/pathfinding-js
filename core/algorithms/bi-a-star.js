var PF = PF || {};
PF.Algorithms = PF.Algorithms || {};

PF.Algorithms.BiAStar = class {
  /**
   * A* path-finder.
   * @constructor
   * @param {Object} opt
   * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
   * @param {function} opt.heuristic Heuristic function to estimate the distance
   *     (defaults to manhattan).
   * @param {number} opt.weight Weight to apply to the heuristic to allow for
   *     suboptimal paths, in order to speed up the search.
   */
  constructor(opt) {
    opt = opt || {};
    this.diagonalMovement =
      opt.diagonalMovement || PF.enums.DiagonalMovement.Never;
    this.heuristic = opt.heuristic || PF.Heuristic.manhattan;
    this.weight = opt.weight || 1;

    //When diagonal movement is allowed the manhattan heuristic is not admissible
    //It should be octile instead
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
    const cmp = (nodeA, nodeB) => nodeA.f - nodeB.f,
      startOpenList = new PF.Data.Heap(cmp),
      endOpenList = new PF.Data.Heap(cmp),
      startNode = grid.getNodeAt(startX, startY),
      endNode = grid.getNodeAt(endX, endY),
      BY_START = 1,
      BY_END = 2;

    // set the `g` and `f` value of the start node to be 0
    // and push it into the start open list
    startNode.g = 0;
    startNode.f = 0;
    startOpenList.push(startNode);
    startNode.opened = BY_START;

    // set the `g` and `f` value of the end node to be 0
    // and push it into the open open list
    endNode.g = 0;
    endNode.f = 0;
    endOpenList.push(endNode);
    endNode.opened = BY_END;

    // while both the open lists are not empty
    let node;
    while (!startOpenList.empty() && !endOpenList.empty()) {
      // pop the position of start node which has the minimum `f` value.
      node = startOpenList.pop();
      node.closed = true;

      // get neigbours of the current node
      let neighbors = grid.getNeighbors(node, this.diagonalMovement);
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];

        if (neighbor.closed) continue;
        if (neighbor.opened === BY_END)
          return PF.utils.biBacktrace(node, neighbor);

        const x = neighbor.x;
        const y = neighbor.y;

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
            startOpenList.push(neighbor);
            neighbor.opened = BY_START;
          } else {
            // the neighbor can be reached with smaller cost.
            // Since its f value has been updated, we have to
            // update its position in the open list
            startOpenList.updateItem(neighbor);
          }
        }
      } // end for each neighbor

      // pop the position of end node which has the minimum `f` value.
      node = endOpenList.pop();
      node.closed = true;

      // get neigbours of the current node
      neighbors = grid.getNeighbors(node, this.diagonalMovement);
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        if (neighbor.closed) continue;
        if (neighbor.opened === BY_START)
          return PF.utils.biBacktrace(neighbor, node);

        const x = neighbor.x;
        const y = neighbor.y;

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
              this.heuristic(Math.abs(x - startX), Math.abs(y - startY));
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = node;

          if (!neighbor.opened) {
            endOpenList.push(neighbor);
            neighbor.opened = BY_END;
          } else {
            // the neighbor can be reached with smaller cost.
            // Since its f value has been updated, we have to
            // update its position in the open list
            endOpenList.updateItem(neighbor);
          }
        }
      } // end for each neighbor
    } // end while not open list empty

    // fail to find the path
    return [];
  }
};
