class Queue {
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
    if (this.arr.length === 0) return null;
    return this.arr.splice(0, 1)[0];
  }

  tail() {
    return this.arr[this.arr.length - 1];
  }
}