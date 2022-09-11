PF.PathFinder = class {
  constructor({
    algorithmType,
    heuristicType,
    bi,
    allowDiagonal,
    crossCorners,
    weight,
  }) {
    let heuristic;
    switch (heuristicType) {
      default:
      case PF.enums.Heuristic.Manhattan:
        heuristic = PF.Heuristic.manhattan;
        break;
      case PF.enums.Heuristic.Euclidean:
        heuristic = PF.Heuristic.euclidean;
        break;
      case PF.enums.Heuristic.Octile:
        heuristic = PF.Heuristic.octile;
        break;
      case PF.enums.Heuristic.Chebyshev:
        heuristic = PF.Heuristic.chebyshev;
        break;
    }

    const { Never, IfAtMostOneObstacle, OnlyWhenNoObstacles } =
      PF.enums.DiagonalMovement;
    const diagonalMovement = allowDiagonal
      ? crossCorners
        ? IfAtMostOneObstacle
        : OnlyWhenNoObstacles
      : Never;

    weight = weight || 1;

    const opt = {
      heuristic,
      diagonalMovement,
      weight,
    };

    const {
      BreadthFirst,
      BiBreadthFirst,
      AStar,
      BiAStar,
      BestFirst,
      BiBestFirst,
      Dijkstra,
      BiDijkstra,
      IDAStar,
      JumpPoint,
    } = PF.Algorithms;
    switch (algorithmType) {
      default:
      case PF.enums.Algo.AStar:
        this.finder = bi ? new BiAStar(opt) : new AStar(opt);
        break;
      case PF.enums.Algo.BestFirst:
        this.finder = bi ? new BiBestFirst(opt) : new BestFirst(opt);
        break;
      case PF.enums.Algo.BreadthFirst:
        this.finder = bi ? new BiBreadthFirst(opt) : new BreadthFirst(opt);
        break;
      case PF.enums.Algo.Dijkstra:
        this.finder = bi ? new BiDijkstra(opt) : new Dijkstra(opt);
        break;
      case PF.enums.Algo.IDAStar:
        this.finder = new IDAStar(opt);
        break;
      case PF.enums.Algo.JumpPoint:
        this.finder = new JumpPoint(opt);
        break;
    }
  }

  findPath(x0, y0, x1, y1, grid) {
    return this.finder.findPath(x0, y0, x1, y1, grid);
  }
};
