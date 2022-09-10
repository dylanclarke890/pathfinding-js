var PF = PF || {};

const FPS = 60;
PF.settings = {
  fps: FPS,
  fpsInterval: 1000 / FPS,
  squareSize: 40,
  searchPathDrawInterval: 0.1, // in seconds
};

PF.DiagonalMovement = {
  Always: 1,
  Never: 2,
  IfAtMostOneObstacle: 3,
  OnlyWhenNoObstacles: 4,
};

PF.CanvasStatus = {
  INIT: 1,
  DRAWING: 2,
  PAUSED: 3,
  STOPPED: 4,
  DONE: 5,
};