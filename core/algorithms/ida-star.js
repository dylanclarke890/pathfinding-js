var PF = PF || {};
PF.Algorithms = PF.Algorithms || {};

/**
 * Iterative Deeping A Star (IDA*) path-finder.
 * @constructor
 * @param {Object} opt
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 * @param {number} opt.weight Weight to apply to the heuristic to allow for
 *     suboptimal paths, in order to speed up the search.
 */
PF.Algorithms.IDAStar = class {
  constructor(opt) {
    opt = opt || {};
    this.diagonalMovement =
      opt.diagonalMovement || PF.enums.DiagonalMovement.Never;
    this.heuristic = opt.heuristic || PF.Heuristic.manhattan;
    this.weight = opt.weight || 1;

    // When diagonal movement is allowed the manhattan heuristic is not
    // admissible, it should be octile instead
    this.heuristic =
      this.diagonalMovement === PF.enums.DiagonalMovement.Never
        ? opt.heuristic || PF.Heuristic.manhattan
        : opt.heuristic || PF.Heuristic.octile;
    this.nodeHeuristic = (a, b) =>
      this.heuristic(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
  }

  /**
   * Find and return the the path. When an empty array is returned, either
   * no path is possible, or the maximum execution time is reached.
   * @return {Array<Array<number>>} The path, including both start and
   *     end positions.
   */
  findPath(startX, startY, endX, endY, grid) {
    // Execution time limitation:
    this.startTime = Date.now();

    // Node instance lookups:
    const start = grid.getNodeAt(startX, startY),
      end = grid.getNodeAt(endX, endY);

    // Initial search depth, given the typical heuristic contraints,
    // there should be no cheaper route possible.
    let cutOff = this.nodeHeuristic(start, end);

    // Has overflow protection.
    for (let j = 0; true; ++j) {
      const route = [];
      const searchResult = this.search(start, 0, cutOff, route, 0, end, grid); // Search till cut-off depth.
      if (searchResult === Infinity) return []; // Route not possible, or not found in time limit.
      // If t is a node, it's also the end node. Route is now
      // populated with a valid path to the end node.
      if (searchResult instanceof PF.Data.Node) return route;
      // Try again, this time with a deeper cut-off. The searchResult score
      // is the closest we got to the end node.
      cutOff = searchResult;
    }
  }

  /** Step cost from a to b. */
  cost(a, b) {
    return a.x === b.x || a.y === b.y ? 1 : Math.SQRT2;
  }

  /**
   * IDA* search implementation.
   * @param {PF.Data.Node} node The node currently expanding from.
   * @param {number} nodeCost Cost to reach the given node.
   * @param {number} cutoff Maximum search depth (cut-off value).
   * @param {Array<Array<number>>} route The found route.
   * @param {number} depth Recursion depth.
   * @return {number || PF.Data.Node} either a number with the new optimal cut-off depth,
   * or a valid node instance, in which case a path was found.
   */
  search(node, nodeCost, cutoff, route, depth, end, grid) {
    const current = nodeCost + this.nodeHeuristic(node, end) * this.weight;

    if (current > cutoff) return current; // We've searched too deep for this iteration.
    if (node == end) {
      route[depth] = [node.x, node.y];
      return node;
    }

    let min = Infinity;
    const neighbours = grid.getNeighbors(node, this.diagonalMovement);

    for (let i = 0; i < neighbours.length; i++) {
      const neighbour = neighbours[i];
      // Retain a copy for visualisation. Due to recursion, this
      // node may be part of other paths too.

      const searchResult = this.search(
        neighbour,
        nodeCost + this.cost(node, neighbour),
        cutoff,
        route,
        depth + 1,
        end,
        grid
      );

      if (searchResult instanceof PF.Data.Node) {
        route[depth] = [node.x, node.y];
        return searchResult;
      }

      // Decrement count, then determine whether it's actually closed.
      if (searchResult < min) min = searchResult;
    }

    return min;
  }
};
