var PF = PF || {};
PF.enums = PF.enums || {};

const FPS = 60;
PF.settings = {
  fps: FPS,
  fpsInterval: 1000 / FPS,
  squareSize: 40,
  searchPathDrawInterval: 0.1, // in seconds
};

PF.enums.DiagonalMovement = {
  Always: 1,
  Never: 2,
  IfAtMostOneObstacle: 3,
  OnlyWhenNoObstacles: 4,
};

PF.enums.Algo = {
  ASTAR: 1,
  BIASTAR: 2,
  BESTFIRST: 3,
  BIBESTFIRST: 4,
  BREADTHFIRST: 5,
  BIBREADTHFIRST: 6,
  DIJKSTRA: 7,
  BIDIJKSTRA: 8,
  IDASTAR: 9,
  JUMPPOINT: 10,
};