var PF = PF || {};
PF.enums = PF.enums || {};

const FPS = 60;
PF.settings = {
  fps: FPS,
  fpsInterval: 1000 / FPS,
  squareSize: 40,
  searchPathDrawInterval: 0.1, // in seconds
  matrixSize: 15,
};

PF.enums.DiagonalMovement = {
  Always: 1,
  Never: 2,
  IfAtMostOneObstacle: 3,
  OnlyWhenNoObstacles: 4,
};

PF.enums.Algo = {
  AStar: 1,
  BiAStar: 2,
  BestFirst: 3,
  BiBestFirst: 4,
  BreadthFirst: 5,
  BiBreadthFirst: 6,
  Dijkstra: 7,
  BiDijkstra: 8,
  IDAStar: 9,
  JumpPoint: 10,
};

PF.enums.Heuristic = {
  Manhattan: 1,
  Euclidean: 2,
  Octile: 3,
  Chebyshev: 4,
};