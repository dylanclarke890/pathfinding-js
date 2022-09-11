var PF = PF || {};
PF.Data = PF.Data || {};

/**
 * A node in a grid.
 * This class holds some basic information about a node and custom
 * attributes may be added, depending on the algorithms' needs.
 * @constructor
 * @param {number} x - The x coordinate of the node on the grid.
 * @param {number} y - The y coordinate of the node on the grid.
 * @param {boolean} [walkable] - Whether this node is walkable.
 */
PF.Data.Node = class {
  constructor(x, y, walkable) {
    /**
     * The x coordinate of the node on the grid.
     * @type number
     */
    this.x = x;
    /**
     * The y coordinate of the node on the grid.
     * @type number
     */
    this.y = y;
    /**
     * Whether this node can be walked through.
     * @type boolean
     */
    this.walkable = walkable === undefined ? true : walkable;
  }
};

/**
 * The Grid class, which serves as the encapsulation of the layout of the nodes.
 * @constructor
 * @param {number|Array<Array<(number|boolean)>>} width Number of columns of the grid
 * @param {number} height Number of rows of the grid.
 * @param {Array<Array<(number|boolean)>>} [matrix] - A 0-1 matrix
 * @param {HTMLElement} element An element to dispatch events to.
 * representing the walkable status of the nodes(0 or false for walkable).
 * If the matrix is not supplied, all the nodes will be walkable.  */
PF.Data.Grid = class {
  constructor({ width, height, matrix, element }) {
    if (matrix != null) {
      height = matrix.length;
      width = matrix[0].length;
    }

    /**
     * The number of columns of the grid.
     * @type number
     */
    this.width = width;

    /**
     * The number of rows of the grid.
     * @type number
     */
    this.height = height;

    /**
     * A 2D array of nodes.
     */
    this.nodes = this.#constructNodes(width, height, matrix);
  }

  /**
   * Build and return the nodes.
   * @private
   * @param {number} w
   * @param {number} h
   * @param {Array<Array<number|boolean>>} [matrix] - A 0-1 matrix representing
   * the walkable status of the nodes.
   * @see PF.Data.Grid
   */
  #constructNodes(w, h, matrix) {
    const nodes = new Array(h);
    for (let i = 0; i < h; i++) {
      nodes[i] = new Array(w);
      for (let j = 0; j < w; j++) nodes[i][j] = new PF.Data.Node(j, i);
    }

    if (matrix === undefined) return nodes;
    if (matrix.length !== h || matrix[0].length !== w)
      throw new Error("Matrix size does not fit");

    // falsy vals mean walkable
    for (let i = 0; i < h; i++)
      for (let j = 0; j < w; j++)
        if (matrix[i][j]) nodes[i][j].walkable = false;

    return nodes;
  }

  getNodeAt(x, y) {
    return this.nodes[y][x];
  }

  /**
   * Determine whether the node at the given position is walkable.
   * (Also returns false if the position is outside the grid.)
   * @param {number} x - The x coordinate of the node.
   * @param {number} y - The y coordinate of the node.
   * @return {boolean} - The walkability of the node.
   */
  isWalkableAt(x, y) {
    return this.containsPosition(x, y) && this.nodes[y][x].walkable;
  }

  /**
   * Determine whether the position is inside the grid.
   * @param {number} x - The x coordinate of the node.
   * @param {number} y - The y coordinate of the node.
   * @return {boolean} - .
   */
  containsPosition(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * Set whether the node on the given position is walkable.
   * NOTE: throws exception if the coordinate is not inside the grid.
   * @param {number} x - The x coordinate of the node.
   * @param {number} y - The y coordinate of the node.
   * @param {boolean} walkable - Whether the position is walkable.
   */
  setWalkableAt(x, y, walkable) {
    this.nodes[y][x].walkable = walkable;
  }

  /**
   * Get the neighbors of the given node.
   *
   *     offsets      diagonalOffsets:
   *  +---+---+---+    +---+---+---+
   *  |   | 0 |   |    | 0 |   | 1 |
   *  +---+---+---+    +---+---+---+
   *  | 3 |   | 1 |    |   |   |   |
   *  +---+---+---+    +---+---+---+
   *  |   | 2 |   |    | 3 |   | 2 |
   *  +---+---+---+    +---+---+---+
   *
   *  When allowDiagonal is true, if offsets[i] is valid, then
   *  diagonalOffsets[i] and
   *  diagonalOffsets[(i + 1) % 4] is valid.
   * @param {PF.Data.Node} node
   * @param {DiagonalMovement} diagonalMovement
   */
  getNeighbors(node, diagonalMovement) {
    const nodes = this.nodes;
    const neighbors = [];
    const { x, y } = node;

    let s0 = false,
      s1 = false,
      s2 = false,
      s3 = false;
    // ↑
    if (this.isWalkableAt(x, y - 1)) {
      neighbors.push(nodes[y - 1][x]);
      s0 = true;
    }
    // →
    if (this.isWalkableAt(x + 1, y)) {
      neighbors.push(nodes[y][x + 1]);
      s1 = true;
    }
    // ↓
    if (this.isWalkableAt(x, y + 1)) {
      neighbors.push(nodes[y + 1][x]);
      s2 = true;
    }
    // ←
    if (this.isWalkableAt(x - 1, y)) {
      neighbors.push(nodes[y][x - 1]);
      s3 = true;
    }

    let d0 = false,
      d1 = false,
      d2 = false,
      d3 = false;

    switch (diagonalMovement) {
      case PF.enums.DiagonalMovement.Never:
        return neighbors;
      case PF.enums.DiagonalMovement.Always:
        d0 = true;
        d1 = true;
        d2 = true;
        d3 = true;
        break;
      case PF.enums.DiagonalMovement.OnlyWhenNoObstacles:
        d0 = s3 && s0;
        d1 = s0 && s1;
        d2 = s1 && s2;
        d3 = s2 && s3;
        break;
      case PF.enums.DiagonalMovement.IfAtMostOneObstacle:
        d0 = s3 || s0;
        d1 = s0 || s1;
        d2 = s1 || s2;
        d3 = s2 || s3;
        break;
      default:
        throw new Error(`Invalid diagonalMovement type: ${diagonalMovement}`);
    }

    // ↖
    if (d0 && this.isWalkableAt(x - 1, y - 1))
      neighbors.push(nodes[y - 1][x - 1]);
    // ↗
    if (d1 && this.isWalkableAt(x + 1, y - 1))
      neighbors.push(nodes[y - 1][x + 1]);
    // ↘
    if (d2 && this.isWalkableAt(x + 1, y + 1))
      neighbors.push(nodes[y + 1][x + 1]);
    // ↙
    if (d3 && this.isWalkableAt(x - 1, y + 1))
      neighbors.push(nodes[y + 1][x - 1]);

    return neighbors;
  }
  /**
   * Get a clone of this grid.
   * @return {PF.Data.Grid} Cloned grid.
   */
  clone() {
    const { width, height, nodes } = this;
    const newGrid = new PF.Data.Grid({ width, height }),
      newNodes = new Array(height);

    for (let i = 0; i < height; i++) {
      newNodes[i] = new Array(width);
      for (let j = 0; j < width; j++)
        newNodes[i][j] = new PF.Data.Node(j, i, nodes[i][j].walkable);
    }
    newGrid.nodes = newNodes;

    return newGrid;
  }
};

PF.Data.Queue = class {
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

  contains(v) {
    return this.arr.includes(v);
  }
};

/*
Default comparison function to fallback to.
*/
function defaultComparer(x, y) {
  return x < y ? -1 : x > y ? 1 : 0;
}

/*
Insert item x in list a, and keep it sorted assuming a is sorted.
If x is already in a, insert it to the right of the rightmost x.
Optional args lo (default 0) and hi (default a.length) bound the slice
of a to be searched.
*/
function insort(a, x, lo, hi, cmp) {
  cmp = cmp || defaultComparer;
  lo = lo || 0;
  hi = hi || a.length;
  if (lo < 0) throw new Error("lo must be non-negative");
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (cmp(x, a[mid]) < 0) hi = mid;
    else lo = mid + 1;
  }
  return a.splice(lo, lo - lo, ...[].concat(x)), x;
}

/*
Push item onto heap, maintaining the heap invariant.
*/
function heappush(array, item, cmp) {
  cmp = cmp || defaultComparer;
  array.push(item);
  return _siftdown(array, 0, array.length - 1, cmp);
}

/*
Pop the smallest item off the heap, maintaining the heap invariant.
*/
const heappop = function (array, cmp) {
  cmp = cmp || defaultComparer;
  let returnitem;
  const lastelt = array.pop();
  if (array.length) {
    returnitem = array[0];
    array[0] = lastelt;
    _siftup(array, 0, cmp);
  } else returnitem = lastelt;
  return returnitem;
};

/*
Pop and return the current smallest value, and add the new item.
This is more efficient than heappop() followed by heappush(), and can be
more appropriate when using a fixed size heap. Note that the value
returned may be larger than item! That constrains reasonable use of
this routine unless written as part of a conditional replacement:
    if item > array[0]
      item = heapreplace(array, item)
*/
const heapreplace = function (array, item, cmp) {
  cmp = cmp || defaultComparer;
  const returnitem = array[0];
  array[0] = item;
  _siftup(array, 0, cmp);
  return returnitem;
};

/*
Fast version of a heappush followed by a heappop.
*/
const heappushpop = function (array, item, cmp) {
  cmp = cmp || defaultComparer;
  if (array.length && cmp(array[0], item) < 0) {
    [item, array[0]] = Array.from([array[0], item]);
    _siftup(array, 0, cmp);
  }
  return item;
};

/*
Transform list into a heap, in-place, in O(array.length) time.
*/
const heapify = function (array, cmp) {
  cmp = cmp || defaultComparer;
  return __range__(0, Math.floor(array.length / 2), false)
    .reverse()
    .map((i) => _siftup(array, i, cmp));
};

/*
Update the position of the given item in the heap.
This function should be called every time the item is being modified.
*/
const updateItem = function (array, item, cmp) {
  cmp = cmp || defaultComparer;
  const pos = array.indexOf(item);
  if (pos === -1) return;
  _siftdown(array, 0, pos, cmp);
  return _siftup(array, pos, cmp);
};

/*
Find the n largest elements in a dataset.
*/
const nlargest = function (array, n, cmp) {
  cmp = cmp || defaultComparer;
  const result = array.slice(0, n);
  if (!result.length) return result;
  heapify(result, cmp);
  for (let elem of array.slice(n)) heappushpop(result, elem, cmp);
  return result.sort(cmp).reverse();
};

/*
Find the n smallest elements in a dataset.
*/
const nsmallest = function (array, n, cmp) {
  cmp = cmp || defaultComparer;
  if (n * 10 <= array.length) {
    const result = array.slice(0, n).sort(cmp);
    if (!result.length) return result;
    let los = result[result.length - 1];
    for (let elem of array.slice(n)) {
      if (cmp(elem, los) < 0) {
        insort(result, elem, 0, null, cmp);
        result.pop();
        los = result[result.length - 1];
      }
    }
    return result;
  }

  heapify(array, cmp);
  return __range__(0, Math.min(n, array.length), false).map(() =>
    heappop(array, cmp)
  );
};

function _siftdown(array, startpos, pos, cmp) {
  cmp = cmp || defaultComparer;
  const newitem = array[pos];
  while (pos > startpos) {
    const parentpos = (pos - 1) >> 1;
    const parent = array[parentpos];
    if (cmp(newitem, parent) < 0) {
      array[pos] = parent;
      pos = parentpos;
      continue;
    }
    break;
  }
  return (array[pos] = newitem);
}

function _siftup(array, pos, cmp) {
  cmp = cmp || defaultComparer;
  const endpos = array.length;
  const startpos = pos;
  const newitem = array[pos];
  let childpos = 2 * pos + 1;
  while (childpos < endpos) {
    const rightpos = childpos + 1;
    if (rightpos < endpos && !(cmp(array[childpos], array[rightpos]) < 0))
      childpos = rightpos;
    array[pos] = array[childpos];
    pos = childpos;
    childpos = 2 * pos + 1;
  }
  array[pos] = newitem;
  return _siftdown(array, startpos, pos, cmp);
}

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}

PF.Data.Heap = class {
  constructor(cmp) {
    cmp = cmp || defaultComparer;
    this.cmp = cmp;
    this.nodes = [];
  }

  push(x) {
    return heappush(this.nodes, x, this.cmp);
  }

  insert(x) {
    return this.push(x);
  }

  pop() {
    return heappop(this.nodes, this.cmp);
  }

  peek() {
    return this.nodes[0];
  }

  top() {
    return this.peek();
  }

  front() {
    return this.peek();
  }

  contains(x) {
    return this.nodes.indexOf(x) !== -1;
  }

  has(x) {
    return this.contains(x);
  }

  replace(x) {
    return heapreplace(this.nodes, x, this.cmp);
  }

  pushpop(x) {
    return heappushpop(this.nodes, x, this.cmp);
  }

  heapify() {
    return heapify(this.nodes, this.cmp);
  }

  updateItem(x) {
    return updateItem(this.nodes, x, this.cmp);
  }

  clear() {
    return (this.nodes = []);
  }

  empty() {
    return this.nodes.length === 0;
  }

  size() {
    return this.nodes.length;
  }

  clone() {
    const heap = new PF.Data.Heap();
    heap.nodes = this.nodes.slice(0);
    return heap;
  }

  copy() {
    return this.clone();
  }

  toArray() {
    return this.nodes.slice(0);
  }
};
