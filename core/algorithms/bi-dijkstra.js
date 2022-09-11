var PF = PF || {};
PF.Algorithms = PF.Algorithms || {};

/**
 * Dijkstra path-finder.
 * @constructor
 * @extends PF.Algorithms.BiAStar
 * @param {Object} opt
 * @param {PF.enums.DiagonalMovement} opt.diagonalMovement Allowed diagonal movement. Defaults to "Never".
 */
PF.Algorithms.BiDijkstra = class extends PF.Algorithms.BiAStar {
  constructor(opt) {
    super(opt);
    this.heuristic = () => 0;
  }
};
