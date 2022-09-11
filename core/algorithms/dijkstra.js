var PF = PF || {};
PF.Algorithms = PF.Algorithms || {};

/**
 * Dijkstra path-finder.
 * @constructor
 * @extends PF.Algorithms.AStar
 * @param {Object} opt
 * @param {PF.enums.DiagonalMovement} opt.diagonalMovement Allowed diagonal movement. Defaults to "Never".
 */
PF.Algorithms.Dijkstra = class extends PF.Algorithms.AStar {
  constructor(opt) {
    super(opt);
    this.heuristic = () => 0;
  }
};
