// main.js — entrypoint
window.addEventListener('load', () => {
  const canvasContainer = document.body;
  const game = new Game({container: canvasContainer});
  game.start();
});
