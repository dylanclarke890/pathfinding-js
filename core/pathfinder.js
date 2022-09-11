var PF = PF || {};

PF.PathFinder = class {
  /**
   * Create a new instance of the pathfinder class.
   * @param {Object} opt
   * @param {string} opt.algorithm The algorithm to use. Defaults to "Breadth-First".
   * @param {Object} opt.heuristic The heuristic to use. Defaults to "manhattan".
   */
  constructor(opt) {
    opt = opt || {};
    const algoType = opt.algorithm || PF.enums.Algo.BREADTHFIRST;
  }
};
