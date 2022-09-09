const [canvas, ctx] = PF.utils.new2dCanvas("play-area", 680, 560);
const grid = new PF.Grid(10, 10);
const finder = new PF.Algorithms.BreadthFirst();
const result = finder.findPath(5, 5, 9, 9, grid);

function update() {}

let stop = false,
  now,
  lastFrame;

function animate(newtime) {
  if (stop) return;
  requestAnimationFrame(animate);
  now = newtime;
  const elapsed = now - lastFrame;
  if (elapsed > PF.settings.fpsInterval) {
    lastFrame = now - (elapsed % PF.settings.fpsInterval);
    update();
  }
}

(function startAnimating() {
  lastFrame = window.performance.now();
  animate();
})();
