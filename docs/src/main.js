// main.js — entrypoint
window.addEventListener('load', () => {
  // Check if we should show launcher first
  const launchMode = localStorage.getItem('eagler_launch_mode');
  
  // If no launch mode is set, redirect to launcher
  if (!launchMode) {
    window.location.href = 'launcher.html';
    return;
  }
  
  // Clear launch mode so we go back to launcher on next visit
  localStorage.removeItem('eagler_launch_mode');
  const launchTarget = localStorage.getItem('eagler_launch_target');
  localStorage.removeItem('eagler_launch_target');
  
  // Start the game
  const canvasContainer = document.body;
  const game = new Game({container: canvasContainer});
  game.start();
  
  // Log launch info for debugging
  console.log('Launched in', launchMode, 'mode with target:', launchTarget);
});
