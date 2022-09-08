var PF = PF || {};
PF.utils = PF.utils || {};

PF.utils.Queue = class {
  get size() {
    return this.arr.length;
  }

  constructor(/** @type {any[]} */ arr) {
    this.arr = arr || [];
  }

  head() {
    return this.arr[0];
  }

  enqueue(val) {
    this.arr.push(val);
  }

  dequeue() {
    return this.arr.shift();
  }

  tail() {
    return this.arr[this.arr.length - 1];
  }
};

PF.utils.Point = class {
  static colors = {
    Start: "yellow",
    Empty: "white",
    Obstacle: "black",
    Goal: "gold",
  };

  constructor(x, y, status) {
    this.x = x;
    this.y = y;
    this.status = status;
    this.squareSize = PF.settings.squareSize;
  }

  draw() {
    ctx.fillStyle = PF.utils.Point.colors[this.status];
    ctx.lineWidth = 2;
    ctx.strokeStyle = "grey";
    const x = this.x * this.squareSize,
      y = this.y * this.squareSize;
    ctx.fillRect(x, y, this.squareSize, this.squareSize);
    ctx.strokeRect(x, y, this.squareSize, this.squareSize);
  }
};

PF.utils.Path = class {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.squareSize = PF.settings.squareSize;
  }

  draw() {
    ctx.fillStyle = "lightblue";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "grey";
    const x = this.x * this.squareSize,
      y = this.y * this.squareSize;
    ctx.fillRect(x, y, this.squareSize, this.squareSize);
    ctx.strokeRect(x, y, this.squareSize, this.squareSize);
  }
};

PF.utils.new2dCanvas = function (id, width, height) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  return [canvas, ctx];
};

PF.utils.moveInDirection = function (location, dir) {
  let { x, y } = location;
  switch (dir) {
    case "North":
      return { x, y: --y };
    case "South":
      return { x, y: ++y };
    case "East":
      return { x: ++x, y };
    case "West":
      return { x: --x, y };
    default:
      break;
  }
};