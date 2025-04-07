// Game variables
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreDisplay = document.getElementById('score-display');
const finalScoreDisplay = document.getElementById('final-score');

// Set canvas size
canvas.width = 400;
canvas.height = 600;

// Game state
let gameRunning = false;
let score = 0;

// Bird properties
const bird = {
    x: 100,
    y: 300,
    width: 40,
    height: 30,
    velocity: 0,
    gravity: 0.5,
    jump: -10,
    color: '#f8d347'
};

// Pipes properties
const pipes = [];
const pipeWidth = 60;
const pipeGap = 150;
const pipeFrequency = 1500; // milliseconds
let lastPipeTime = 0;

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
canvas.addEventListener('click', flap);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        flap();
    }
});

function startGame() {
    // Reset game state
    gameRunning = true;
    score = 0;
    scoreDisplay.textContent = score;
    bird.y = 300;
    bird.velocity = 0;
    pipes.length = 0;
    
    // Hide screens
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    
    // Start game loop
    lastPipeTime = Date.now() - pipeFrequency;
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw bird
    updateBird();
    drawBird();
    
    // Update and draw pipes
    updatePipes();
    drawPipes();
    
    // Check collisions
    if (checkCollisions()) {
        endGame();
        return;
    }
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

function updateBird() {
    // Apply gravity
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Prevent bird from going above canvas
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
}

function drawBird() {
    ctx.fillStyle = bird.color;
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    
    // Draw beak
    ctx.fillStyle = '#ff8c00';
    ctx.fillRect(bird.x + bird.width, bird.y + 10, 15, 10);
    
    // Draw eye
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.x + 30, bird.y + 10, 5, 0, Math.PI * 2);
    ctx.fill();
}

function flap() {
    if (gameRunning) {
        bird.velocity = bird.jump;
    }
}

function updatePipes() {
    const now = Date.now();
    
    // Add new pipes
    if (now - lastPipeTime > pipeFrequency) {
        const gapPosition = Math.random() * (canvas.height - pipeGap - 100) + 50;
        pipes.push({
            x: canvas.width,
            topHeight: gapPosition,
            bottomY: gapPosition + pipeGap,
            passed: false
        });
        lastPipeTime = now;
    }
    
    // Move pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 2;
        
        // Check if bird passed the pipe
        if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
            pipes[i].passed = true;
            score++;
            scoreDisplay.textContent = score;
        }
        
        // Remove pipes that are off screen
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

function drawPipes() {
    ctx.fillStyle = '#4CAF50';
    
    for (const pipe of pipes) {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
    }
}

function checkCollisions() {
    // Check if bird hits the ground or ceiling
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        return true;
    }
    
    // Check pipe collisions
    for (const pipe of pipes) {
        if (
            bird.x + bird.width > pipe.x && 
            bird.x < pipe.x + pipeWidth && 
            (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY)
        ) {
            return true;
        }
    }
    
    return false;
}

function endGame() {
    gameRunning = false;
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'flex';
}
