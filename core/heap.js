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

PF.utils.Heap = class {
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
    const heap = new Heap();
    heap.nodes = this.nodes.slice(0);
    return heap;
  }

  copy() {
    return this.clone();
  }

  toArray() {
    return this.nodes.slice(0);
  }
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
