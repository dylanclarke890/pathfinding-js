/**
 * Best-First path-finder.
 * @constructor
 * @extends PF.Algorithms.BiAStar
 * @param {Object} opt
 * @param {PF.enums.DiagonalMovement} opt.diagonalMovement Allowed diagonal movement. Defaults to "Never".
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 */
PF.Algorithms.BiBestFirst = class extends PF.Algorithms.BiAStar {
  constructor(opt) {
    super(opt);
    const orig = this.heuristic;
    this.heuristic = (dx, dy) => orig(dx, dy) * 1000000;
  }
};
