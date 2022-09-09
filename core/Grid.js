/**
 * A node in a grid.
 * This class holds some basic information about a node and custom
 * attributes may be added, depending on the algorithms' needs.
 * @constructor
 * @param {number} x - The x coordinate of the node on the grid.
 * @param {number} y - The y coordinate of the node on the grid.
 * @param {boolean} [walkable] - Whether this node is walkable.
 */
PF.Node = class {
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
 * @param {number|Array<Array<(number|boolean)>>} width_or_matrix Number of columns of the grid, or matrix
 * @param {number} height Number of rows of the grid.
 * @param {Array<Array<(number|boolean)>>} [matrix] - A 0-1 matrix
 * representing the walkable status of the nodes(0 or false for walkable).
 * If the matrix is not supplied, all the nodes will be walkable.  */
PF.Grid = class {
  constructor(width_or_matrix, height, matrix) {
    let width;

    if (typeof width_or_matrix !== "object") width = width_or_matrix;
    else {
      height = width_or_matrix.length;
      width = width_or_matrix[0].length;
      matrix = width_or_matrix;
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
   * @see Grid
   */
  #constructNodes(w, h, matrix) {
    const nodes = new Array(h);
    for (let i = 0; i < h; i++) {
      nodes[i] = new Array(w);
      for (let j = 0; j < w; j++) nodes[i][j] = new Node(j, i);
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
   * @param {Node} node
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
      case PF.DiagonalMovement.Never:
        return neighbors;
      case PF.DiagonalMovement.Always:
        d0 = true;
        d1 = true;
        d2 = true;
        d3 = true;
        break;
      case PF.DiagonalMovement.OnlyWhenNoObstacles:
        d0 = s3 && s0;
        d1 = s0 && s1;
        d2 = s1 && s2;
        d3 = s2 && s3;
        break;
      case PF.DiagonalMovement.IfAtMostOneObstacle:
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
   * @return {Grid} Cloned grid.
   */
  clone() {
    const newGrid = new Grid(width, height),
      newNodes = new Array(height);
    const { width, height, nodes } = this;

    for (let i = 0; i < height; i++) {
      newNodes[i] = new Array(width);
      for (let j = 0; j < width; j++)
        newNodes[i][j] = new Node(j, i, nodes[i][j].walkable);
    }
    newGrid.nodes = newNodes;

    return newGrid;
  }
};
