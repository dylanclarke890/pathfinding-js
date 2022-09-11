var PF = PF || {};
PF.utils = PF.utils || {};

PF.utils.new2dCanvas = function (id, width, height) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  return [canvas, ctx];
};

/**
 * Backtrace according to the parent records and return the path.
 * (including both start and end nodes)
 * @param {Node} node End node
 * @return {Array<Array<number>>} the path
 */
PF.utils.backtrace = function (node) {
  const path = [[node.x, node.y]];
  while (node.parent) {
    node = node.parent;
    path.push([node.x, node.y]);
  }
  return path.reverse();
};

/**
 * Backtrace from start and end node, and return the path.
 * (including both start and end nodes)
 * @param {Node}
 * @param {Node}
 */
PF.utils.biBacktrace = function (startNode, endNode) {
  const startPath = PF.utils.backtrace(startNode),
    endPath = PF.utils.backtrace(endNode);
  return startPath.concat(endPath.reverse());
};

/**
 * Compute the length of the path.
 * @param {Array<Array<number>>} path The path
 * @return {number} The length of the path
 */
PF.utils.pathLength = function (path) {
  let sum = 0;
  for (let i = 1; i < path.length; ++i) {
    const a = path[i - 1];
    const b = path[i];
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    sum += Math.sqrt(dx * dx + dy * dy);
  }
  return sum;
};

/**
 * Given the start and end coordinates, return all the coordinates lying
 * on the line formed by these coordinates, based on Bresenham's algorithm.
 * http://en.wikipedia.org/wiki/Bresenham's_line_algorithm#Simplification
 * @param {number} x0 Start x coordinate
 * @param {number} y0 Start y coordinate
 * @param {number} x1 End x coordinate
 * @param {number} y1 End y coordinate
 * @return {Array<Array<number>>} The coordinates on the line
 */
PF.utils.interpolate = function (x0, y0, x1, y1) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;

  const line = [];
  let err = dx - dy;
  while (true) {
    line.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    let e2 = 2 * err;
    if (e2 > -dy) {
      err = err - dy;
      x0 = x0 + sx;
    }
    if (e2 < dx) {
      err = err + dx;
      y0 = y0 + sy;
    }
  }

  return line;
};

/**
 * Given a compressed path, return a new path that has all the segments
 * in it interpolated.
 * @param {Array<Array<number>>} path The path
 * @return {Array<Array<number>>} expanded path
 */
PF.utils.expandPath = function (path) {
  const expanded = [];
  if (path.length < 2) return expanded;
  for (let i = 0; i < path.length - 1; ++i) {
    const [x0, y0] = path[i];
    const [x1, y1] = path[i + 1];
    const line = PF.utils.interpolate(x0, y0, x1, y1);
    for (let j = 0; j < line.length - 1; j++) expanded.push(line[j]);
  }
  expanded.push(path[path.length - 1]);

  return expanded;
};

/**
 * Smoothen the given path.
 * The original path will not be modified, a new path will be returned.
 * @param {PF.Data.Grid} grid
 * @param {Array<Array<number>>} path The path
 */
PF.utils.smoothenPath = function (grid, path) {
  const start = path[0]; // path start coords.
  let sx = start[0],
    sy = start[1];
  const newPath = [[sx, sy]];

  for (let i = 2; i < path.length; ++i) {
    let currCoords = path[i];
    let ex = currCoords[0];
    let ey = currCoords[1];
    const line = interpolate(sx, sy, ex, ey);

    let blocked = false;
    for (let j = 1; j < line.length; ++j) {
      let testCoord = line[j];

      if (!grid.isWalkableAt(testCoord[0], testCoord[1])) {
        blocked = true;
        break;
      }
    }
    if (blocked) {
      let lastValid = path[i - 1];
      newPath.push(lastValid);
      sx = lastValid[0];
      sy = lastValid[1];
    }
  }

  const end = path[path.length - 1]; // path end coords.
  newPath.push([end[0], end[1]]);

  return newPath;
};

/**
 * Compress a path, remove redundant nodes without altering the shape
 * The original path is not modified
 * @param {Array<Array<number>>} path The path
 * @return {Array<Array<number>>} The compressed path
 */
PF.utils.compressPath = function (path) {
  if (path.length < 3) return path; // nothing to compress

  let sx = path[0][0], // start x
    sy = path[0][1], // start y
    px = path[1][0], // second point x
    py = path[1][1], // second point y
    dx = px - sx, // direction between the two points
    dy = py - sy, // direction between the two points
    sq = Math.sqrt(dx * dx + dy * dy); // normalize the direction

  // start the new path
  const compressed = [[sx, sy]];

  dx /= sq;
  dy /= sq;

  for (let i = 2; i < path.length; i++) {
    // store the last point
    let lx = px;
    let ly = py;

    // store the last direction
    let ldx = dx;
    let ldy = dy;

    // next point
    px = path[i][0];
    py = path[i][1];

    // next direction
    dx = px - lx;
    dy = py - ly;

    // normalize
    sq = Math.sqrt(dx * dx + dy * dy);
    dx /= sq;
    dy /= sq;

    // if the direction has changed, store the point
    if (dx !== ldx || dy !== ldy) compressed.push([lx, ly]);
  }

  compressed.push([px, py]); // store the last point
  return compressed;
};

/**
 * Used for the demo. Intercepts method calls to the grid to allow tracking of the search steps
 * without needing to add the logic to the Grid class itself as in practical applications they aren't
 * likely to be used.
 */
PF.utils.interceptGridOperations = function (grid, interceptCallback) {
  return new Proxy(grid, {
    get(target, prop) {
      if (typeof target[prop] !== "function") return target[prop];
      return new Proxy(target[prop], {
        apply: (target, thisArg, argumentsList) => {
          const result = Reflect.apply(target, thisArg, argumentsList);
          interceptCallback(prop, argumentsList, result);
          return result;
        },
      });
    },
  });
};

PF.utils.toPageCoords = function ({ x, y }) {
  return {
    x: Math.floor(x * PF.settings.squareSize),
    y: Math.floor(y * PF.settings.squareSize),
  };
};

PF.utils.toGridCoords = function ({ x, y }) {
  return {
    x: Math.floor(x / PF.settings.squareSize),
    y: Math.floor(y / PF.settings.squareSize),
  };
};

PF.utils.rectsAreColliding = function (first, second) {
  if (!first || !second) return false;
  if (
    !(
      first.x > second.x + second.w ||
      first.x + first.w < second.x ||
      first.y > second.y + second.h ||
      first.y + first.h < second.y
    )
  ) {
    return true;
  }
  return false;
};
