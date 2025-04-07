// Add this at the top of game.js
console.log("Game script loaded");

// Replace the flap function with:
function flap(e) {
    e.preventDefault();
    if (!gameRunning) startGame();
    bird.velocity = bird.jump;
}
