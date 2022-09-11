var PF = PF || {};
PF.Algorithms = PF.Algorithms || {};

/**
 * Base class for the Jump Point Search algorithm
 * @param {object} opt
 * @param {function} opt.heuristic Heuristic function to estimate the distance (defaults to manhattan).
 */
class JPFBase {
  constructor(opt) {
    opt = opt || {};
    this.heuristic = opt.heuristic || PF.Heuristic.manhattan;
    this.trackJumpRecursion = opt.trackJumpRecursion || false;
  }

  /**
   * Find and return the path.
   * @return {Array<Array<number>>} The path, including both start and
   *     end positions.
   */
  findPath(startX, startY, endX, endY, grid) {
    const openList = (this.openList = new PF.Data.Heap(
        (nodeA, nodeB) => nodeA.f - nodeB.f
      )),
      startNode = (this.startNode = grid.getNodeAt(startX, startY)),
      endNode = (this.endNode = grid.getNodeAt(endX, endY));
    this.grid = grid;

    // set the `g` and `f` value of the start node to be 0
    startNode.g = 0;
    startNode.f = 0;

    // push the start node into the open list
    openList.push(startNode);
    startNode.opened = true;

    // while the open list is not empty
    let node;
    while (!openList.empty()) {
      node = openList.pop(); // pop the position of node which has the minimum `f` value.
      node.closed = true;
      if (node === endNode)
        return PF.utils.expandPath(PF.utils.backtrace(endNode));
      this._identifySuccessors(node);
    }

    // fail to find the path
    return [];
  }
  /**
   * Identify successors for the given node. Runs a jump point search in the
   * direction of each available neighbor, adding any points found to the open
   * list.
   * @protected
   */
  _identifySuccessors(node) {
    const endX = this.endNode.x,
      endY = this.endNode.y;
    const { x, y } = node;
    const neighbors = this._findNeighbors(node);

    for (let i = 0; i < neighbors.length; ++i) {
      const neighbor = neighbors[i];
      let jumpPoint = this._jump(neighbor[0], neighbor[1], x, y);
      if (jumpPoint) {
        const [jx, jy] = jumpPoint;
        const jumpNode = this.grid.getNodeAt(jx, jy);
        if (jumpNode.closed) continue;

        // include distance, as parent may not be immediately adjacent:
        const d = PF.Heuristic.octile(Math.abs(jx - x), Math.abs(jy - y));
        const ng = node.g + d; // next `g` value

        if (!jumpNode.opened || ng < jumpNode.g) {
          jumpNode.g = ng;
          jumpNode.h =
            jumpNode.h ||
            this.heuristic(Math.abs(jx - endX), Math.abs(jy - endY));
          jumpNode.f = jumpNode.g + jumpNode.h;
          jumpNode.parent = node;

          if (!jumpNode.opened) {
            this.openList.push(jumpNode);
            jumpNode.opened = true;
          } else this.openList.updateItem(jumpNode);
        }
      }
    }
  }
}

/**
 * Path finder using the Jump Point Search algorithm allowing only horizontal
 * or vertical movements.
 */
class JPFNeverMoveDiagonally extends JPFBase {
  constructor(opt) {
    super(opt);
  }

  /**
   * Search recursively in the direction (parent -> child), stopping only when a
   * jump point is found.
   * @protected
   * @return {Array<Array<number>>} The x, y coordinate of the jump point
   *     found, or null if not found
   */
  _jump(x, y, px, py) {
    const grid = this.grid,
      dx = x - px,
      dy = y - py;

    if (!grid.isWalkableAt(x, y)) return null;
    if (this.trackJumpRecursion === true) grid.getNodeAt(x, y).tested = true;
    if (grid.getNodeAt(x, y) === this.endNode) return [x, y];

    if (dx !== 0) {
      if (
        (grid.isWalkableAt(x, y - 1) && !grid.isWalkableAt(x - dx, y - 1)) ||
        (grid.isWalkableAt(x, y + 1) && !grid.isWalkableAt(x - dx, y + 1))
      )
        return [x, y];
    } else if (dy !== 0) {
      if (
        (grid.isWalkableAt(x - 1, y) && !grid.isWalkableAt(x - 1, y - dy)) ||
        (grid.isWalkableAt(x + 1, y) && !grid.isWalkableAt(x + 1, y - dy))
      )
        return [x, y];

      //When moving vertically, must check for horizontal jump points
      if (this._jump(x + 1, y, x, y) || this._jump(x - 1, y, x, y))
        return [x, y];
    } else
      throw new Error("Only horizontal and vertical movements are allowed");

    return this._jump(x + dx, y + dy, x, y);
  }

  /**
   * Find the neighbors for the given node. If the node has a parent,
   * prune the neighbors based on the jump point search algorithm, otherwise
   * return all available neighbors.
   * @return {Array<Array<number>>} The neighbors found.
   */
  _findNeighbors(node) {
    const parent = node.parent,
      x = node.x,
      y = node.y,
      grid = this.grid,
      neighbors = [];

    // directed pruning: can ignore most neighbors, unless forced.
    if (parent) {
      const px = parent.x;
      const py = parent.y;
      // get the normalized direction of travel
      const dx = (x - px) / Math.max(Math.abs(x - px), 1);
      const dy = (y - py) / Math.max(Math.abs(y - py), 1);

      if (dx !== 0) {
        if (grid.isWalkableAt(x, y - 1)) neighbors.push([x, y - 1]);
        if (grid.isWalkableAt(x, y + 1)) neighbors.push([x, y + 1]);
        if (grid.isWalkableAt(x + dx, y)) neighbors.push([x + dx, y]);
      } else if (dy !== 0) {
        if (grid.isWalkableAt(x - 1, y)) neighbors.push([x - 1, y]);
        if (grid.isWalkableAt(x + 1, y)) neighbors.push([x + 1, y]);
        if (grid.isWalkableAt(x, y + dy)) neighbors.push([x, y + dy]);
      }
    } else {
      // return all neighbors
      const neighborNodes = grid.getNeighbors(
        node,
        PF.enums.DiagonalMovement.Never
      );
      for (let i = 0; i < neighborNodes.length; i++) {
        const neighborNode = neighborNodes[i];
        neighbors.push([neighborNode.x, neighborNode.y]);
      }
    }

    return neighbors;
  }
}

/**
 * Path finder using the Jump Point Search algorithm which always moves
 * diagonally irrespective of the number of obstacles.
 */
class JPFAlwaysMoveDiagonally extends JPFBase {
  constructor(opt) {
    super(opt);
  }

  /**
   * Search recursively in the direction (parent -> child), stopping only when a
   * jump point is found.
   * @protected
   * @return {Array<Array<number>>} The x, y coordinate of the jump point
   *     found, or null if not found
   */
  _jump(x, y, px, py) {
    var grid = this.grid,
      dx = x - px,
      dy = y - py;

    if (!grid.isWalkableAt(x, y)) return null;
    if (this.trackJumpRecursion === true) grid.getNodeAt(x, y).tested = true;
    if (grid.getNodeAt(x, y) === this.endNode) return [x, y];

    // check for forced neighbors
    // along the diagonal
    if (dx !== 0 && dy !== 0) {
      if (
        (grid.isWalkableAt(x - dx, y + dy) && !grid.isWalkableAt(x - dx, y)) ||
        (grid.isWalkableAt(x + dx, y - dy) && !grid.isWalkableAt(x, y - dy))
      ) {
        return [x, y];
      }
      // when moving diagonally, must check for vertical/horizontal jump points
      if (this._jump(x + dx, y, x, y) || this._jump(x, y + dy, x, y))
        return [x, y];
    }

    // horizontally/vertically
    else {
      if (dx !== 0) {
        // moving along x
        if (
          (grid.isWalkableAt(x + dx, y + 1) && !grid.isWalkableAt(x, y + 1)) ||
          (grid.isWalkableAt(x + dx, y - 1) && !grid.isWalkableAt(x, y - 1))
        ) {
          return [x, y];
        }
      } else {
        if (
          (grid.isWalkableAt(x + 1, y + dy) && !grid.isWalkableAt(x + 1, y)) ||
          (grid.isWalkableAt(x - 1, y + dy) && !grid.isWalkableAt(x - 1, y))
        ) {
          return [x, y];
        }
      }
    }

    return this._jump(x + dx, y + dy, x, y);
  }
  /**
   * Find the neighbors for the given node. If the node has a parent,
   * prune the neighbors based on the jump point search algorithm, otherwise
   * return all available neighbors.
   * @return {Array<Array<number>>} The neighbors found.
   */
  _findNeighbors(node) {
    const parent = node.parent,
      x = node.x,
      y = node.y,
      grid = this.grid,
      neighbors = [];

    // directed pruning: can ignore most neighbors, unless forced.
    if (parent) {
      const px = parent.x;
      const py = parent.y;
      // get the normalized direction of travel
      const dx = (x - px) / Math.max(Math.abs(x - px), 1);
      const dy = (y - py) / Math.max(Math.abs(y - py), 1);

      // search diagonally
      if (dx !== 0 && dy !== 0) {
        if (grid.isWalkableAt(x, y + dy)) neighbors.push([x, y + dy]);
        if (grid.isWalkableAt(x + dx, y)) neighbors.push([x + dx, y]);
        if (grid.isWalkableAt(x + dx, y + dy)) neighbors.push([x + dx, y + dy]);
        if (!grid.isWalkableAt(x - dx, y)) neighbors.push([x - dx, y + dy]);
        if (!grid.isWalkableAt(x, y - dy)) neighbors.push([x + dx, y - dy]);
      }

      // search horizontally/vertically
      else {
        if (dx === 0) {
          if (grid.isWalkableAt(x, y + dy)) neighbors.push([x, y + dy]);
          if (!grid.isWalkableAt(x + 1, y)) neighbors.push([x + 1, y + dy]);
          if (!grid.isWalkableAt(x - 1, y)) neighbors.push([x - 1, y + dy]);
        } else {
          if (grid.isWalkableAt(x + dx, y)) neighbors.push([x + dx, y]);
          if (!grid.isWalkableAt(x, y + 1)) neighbors.push([x + dx, y + 1]);
          if (!grid.isWalkableAt(x, y - 1)) neighbors.push([x + dx, y - 1]);
        }
      }
    } else {
      // return all neighbors
      const neighborNodes = grid.getNeighbors(
        node,
        PF.enums.DiagonalMovement.Always
      );
      for (let i = 0; i < neighborNodes.length; ++i) {
        const neighborNode = neighborNodes[i];
        neighbors.push([neighborNode.x, neighborNode.y]);
      }
    }

    return neighbors;
  }
}

/**
 * Path finder using the Jump Point Search algorithm which moves
 * diagonally only when there are no obstacles.
 */
class JPFMoveDiagonallyIfNoObstacles extends JPFBase {
  constructor(opt) {
    super(opt);
  }

  /**
   * Search recursively in the direction (parent -> child), stopping only when a
   * jump point is found.
   * @protected
   * @return {Array<Array<number>>} The x, y coordinate of the jump point
   *     found, or null if not found
   */
  _jump(x, y, px, py) {
    const grid = this.grid,
      dx = x - px,
      dy = y - py;

    if (!grid.isWalkableAt(x, y)) return null;
    if (this.trackJumpRecursion === true) grid.getNodeAt(x, y).tested = true;
    if (grid.getNodeAt(x, y) === this.endNode) return [x, y];

    // check for forced neighbors
    // along the diagonal
    if (dx !== 0 && dy !== 0) {
      // when moving diagonally, must check for vertical/horizontal jump points
      if (this._jump(x + dx, y, x, y) || this._jump(x, y + dy, x, y))
        return [x, y];
    }

    // horizontally/vertically
    else {
      if (dx !== 0) {
        if (
          (grid.isWalkableAt(x, y - 1) && !grid.isWalkableAt(x - dx, y - 1)) ||
          (grid.isWalkableAt(x, y + 1) && !grid.isWalkableAt(x - dx, y + 1))
        )
          return [x, y];
      } else if (dy !== 0) {
        if (
          (grid.isWalkableAt(x - 1, y) && !grid.isWalkableAt(x - 1, y - dy)) ||
          (grid.isWalkableAt(x + 1, y) && !grid.isWalkableAt(x + 1, y - dy))
        )
          return [x, y];
      }
    }

    // moving diagonally, must make sure one of the vertical/horizontal
    // neighbors is open to allow the path
    return grid.isWalkableAt(x + dx, y) && grid.isWalkableAt(x, y + dy)
      ? this._jump(x + dx, y + dy, x, y)
      : null;
  }
  /**
   * Find the neighbors for the given node. If the node has a parent,
   * prune the neighbors based on the jump point search algorithm, otherwise
   * return all available neighbors.
   * @return {Array<Array<number>>} The neighbors found.
   */
  _findNeighbors(node) {
    const parent = node.parent,
      x = node.x,
      y = node.y,
      grid = this.grid,
      neighbors = [];

    // directed pruning: can ignore most neighbors, unless forced.
    if (parent) {
      const px = parent.x;
      const py = parent.y;
      // get the normalized direction of travel
      const dx = (x - px) / Math.max(Math.abs(x - px), 1);
      const dy = (y - py) / Math.max(Math.abs(y - py), 1);

      // search diagonally
      if (dx !== 0 && dy !== 0) {
        if (grid.isWalkableAt(x, y + dy)) neighbors.push([x, y + dy]);
        if (grid.isWalkableAt(x + dx, y)) neighbors.push([x + dx, y]);
        if (grid.isWalkableAt(x, y + dy) && grid.isWalkableAt(x + dx, y))
          neighbors.push([x + dx, y + dy]);
      }

      // search horizontally/vertically
      else {
        let isNextWalkable;
        if (dx !== 0) {
          isNextWalkable = grid.isWalkableAt(x + dx, y);
          const isTopWalkable = grid.isWalkableAt(x, y + 1);
          const isBottomWalkable = grid.isWalkableAt(x, y - 1);

          if (isNextWalkable) {
            neighbors.push([x + dx, y]);
            if (isTopWalkable) neighbors.push([x + dx, y + 1]);
            if (isBottomWalkable) neighbors.push([x + dx, y - 1]);
          }
          if (isTopWalkable) neighbors.push([x, y + 1]);
          if (isBottomWalkable) neighbors.push([x, y - 1]);
        } else if (dy !== 0) {
          isNextWalkable = grid.isWalkableAt(x, y + dy);
          const isRightWalkable = grid.isWalkableAt(x + 1, y);
          const isLeftWalkable = grid.isWalkableAt(x - 1, y);

          if (isNextWalkable) {
            neighbors.push([x, y + dy]);
            if (isRightWalkable) neighbors.push([x + 1, y + dy]);
            if (isLeftWalkable) neighbors.push([x - 1, y + dy]);
          }
          if (isRightWalkable) neighbors.push([x + 1, y]);
          if (isLeftWalkable) neighbors.push([x - 1, y]);
        }
      }
    }

    // return all neighbors
    else {
      const neighborNodes = grid.getNeighbors(
        node,
        PF.enums.DiagonalMovement.OnlyWhenNoObstacles
      );
      for (let i = 0; i < neighborNodes.length; i++) {
        const neighborNode = neighborNodes[i];
        neighbors.push([neighborNode.x, neighborNode.y]);
      }
    }

    return neighbors;
  }
}

/**
 * Path finder using the Jump Point Search algorithm which moves
 * diagonally only when there is at most one obstacle.
 */
class JPFMoveDiagonallyIfAtMostOneObstacle extends JPFBase {
  constructor(opt) {
    super(opt);
  }

  /**
   * Search recursively in the direction (parent -> child), stopping only when a
   * jump point is found.
   * @protected
   * @return {Array<Array<number>>} The x, y coordinate of the jump point
   *     found, or null if not found
   */
  _jump(x, y, px, py) {
    const grid = this.grid,
      dx = x - px,
      dy = y - py;

    if (!grid.isWalkableAt(x, y)) return null;
    if (this.trackJumpRecursion === true) grid.getNodeAt(x, y).tested = true;
    if (grid.getNodeAt(x, y) === this.endNode) return [x, y];

    // check for forced neighbors
    // along the diagonal
    if (dx !== 0 && dy !== 0) {
      if (
        (grid.isWalkableAt(x - dx, y + dy) && !grid.isWalkableAt(x - dx, y)) ||
        (grid.isWalkableAt(x + dx, y - dy) && !grid.isWalkableAt(x, y - dy))
      )
        return [x, y];
      // when moving diagonally, must check for vertical/horizontal jump points
      if (this._jump(x + dx, y, x, y) || this._jump(x, y + dy, x, y))
        return [x, y];
    }

    // horizontally/vertically
    else {
      if (dx !== 0) {
        // moving along x
        if (
          (grid.isWalkableAt(x + dx, y + 1) && !grid.isWalkableAt(x, y + 1)) ||
          (grid.isWalkableAt(x + dx, y - 1) && !grid.isWalkableAt(x, y - 1))
        )
          return [x, y];
      } else {
        if (
          (grid.isWalkableAt(x + 1, y + dy) && !grid.isWalkableAt(x + 1, y)) ||
          (grid.isWalkableAt(x - 1, y + dy) && !grid.isWalkableAt(x - 1, y))
        )
          return [x, y];
      }
    }

    // moving diagonally, must make sure one of the vertical/horizontal
    // neighbors is open to allow the path
    return grid.isWalkableAt(x + dx, y) || grid.isWalkableAt(x, y + dy)
      ? this._jump(x + dx, y + dy, x, y)
      : null;
  }
  /**
   * Find the neighbors for the given node. If the node has a parent,
   * prune the neighbors based on the jump point search algorithm, otherwise
   * return all available neighbors.
   * @return {Array<Array<number>>} The neighbors found.
   */
  _findNeighbors(node) {
    const parent = node.parent,
      x = node.x,
      y = node.y,
      grid = this.grid,
      neighbors = [];

    // directed pruning: can ignore most neighbors, unless forced.
    if (parent) {
      const px = parent.x;
      const py = parent.y;
      // get the normalized direction of travel
      const dx = (x - px) / Math.max(Math.abs(x - px), 1);
      const dy = (y - py) / Math.max(Math.abs(y - py), 1);

      // search diagonally
      if (dx !== 0 && dy !== 0) {
        if (grid.isWalkableAt(x, y + dy)) neighbors.push([x, y + dy]);
        if (grid.isWalkableAt(x + dx, y)) neighbors.push([x + dx, y]);
        if (grid.isWalkableAt(x, y + dy) || grid.isWalkableAt(x + dx, y))
          neighbors.push([x + dx, y + dy]);
        if (!grid.isWalkableAt(x - dx, y) && grid.isWalkableAt(x, y + dy))
          neighbors.push([x - dx, y + dy]);
        if (!grid.isWalkableAt(x, y - dy) && grid.isWalkableAt(x + dx, y))
          neighbors.push([x + dx, y - dy]);
      }

      // search horizontally/vertically
      else {
        if (dx === 0) {
          if (grid.isWalkableAt(x, y + dy)) {
            neighbors.push([x, y + dy]);
            if (!grid.isWalkableAt(x + 1, y)) neighbors.push([x + 1, y + dy]);
            if (!grid.isWalkableAt(x - 1, y)) neighbors.push([x - 1, y + dy]);
          }
        } else {
          if (grid.isWalkableAt(x + dx, y)) {
            neighbors.push([x + dx, y]);
            if (!grid.isWalkableAt(x, y + 1)) neighbors.push([x + dx, y + 1]);
            if (!grid.isWalkableAt(x, y - 1)) neighbors.push([x + dx, y - 1]);
          }
        }
      }
    }

    // return all neighbors
    else {
      const neighborNodes = grid.getNeighbors(
        node,
        PF.enums.DiagonalMovement.IfAtMostOneObstacle
      );
      for (let i = 0; i < neighborNodes.length; i++) {
        const neighborNode = neighborNodes[i];
        neighbors.push([neighborNode.x, neighborNode.y]);
      }
    }

    return neighbors;
  }
}

PF.Algorithms.JumpPoint = class {
  constructor(diagonalMovement) {
    switch (diagonalMovement) {
      case PF.enums.DiagonalMovement.Never:
        this.algorithm = new JPFNeverMoveDiagonally();
        break;
      case PF.enums.DiagonalMovement.Always:
        this.algorithm = new JPFAlwaysMoveDiagonally();
        break;
      case PF.enums.DiagonalMovement.OnlyWhenNoObstacles:
        this.algorithm = new JPFMoveDiagonallyIfNoObstacles();
        break;
      case PF.enums.DiagonalMovement.IfAtMostOneObstacle:
        this.algorithm = new JPFMoveDiagonallyIfAtMostOneObstacle();
        break;
      default:
        this.algorithm = new JPFNeverMoveDiagonally();
        break;
    }
  }

  findPath(x0, y0, x1, y1, grid) {
    return this.algorithm.findPath(x0, y0, x1, y1, grid);
  }
};
