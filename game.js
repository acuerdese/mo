// Game setup
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreDisplay = document.getElementById('score-display');
const finalScoreDisplay = document.getElementById('final-score');
const pauseScreen = document.getElementById('pause-screen');
const touchControls = document.getElementById('touch-controls');

// Set canvas size to full container
function resizeCanvas() {
    const container = document.getElementById('game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Adjust bird position on resize
    if (gameRunning && !gamePaused) {
        bird.y = Math.min(bird.y, canvas.height - bird.height);
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Load images
const birdImg = new Image();
birdImg.src = 'bird.png';

const pipeTopImg = new Image();
pipeTopImg.src = 'pipe-top.png';

const pipeBottomImg = new Image();
pipeBottomImg.src = 'pipe-bottom.png';

const backgroundImg = new Image();
backgroundImg.src = 'background.png';

const tapIcon = new Image();
tapIcon.src = 'tap-icon.png';

// Game state
let gameRunning = false;
let gamePaused = false;
let score = 0;
let animationId = null;
let imagesLoaded = 0;
const totalImages = 5;

// Bird properties
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 40,
    height: 30,
    velocity: 0,
    gravity: 0.5,
    jump: -10,
    rotation: 0,
    wingState: 0,
    wingDirection: 1
};

// Pipes properties
const pipes = [];
const pipeWidth = 60;
const pipeGap = Math.min(200, canvas.height * 0.3);
const pipeFrequency = 1500; // milliseconds
let lastPipeTime = 0;

// Check when all images are loaded
function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        startBtn.disabled = false;
    }
}

birdImg.onload = imageLoaded;
pipeTopImg.onload = imageLoaded;
pipeBottomImg.onload = imageLoaded;
backgroundImg.onload = imageLoaded;
tapIcon.onload = imageLoaded;

// Touch event listeners
function setupTouchControls() {
    // Enable full-screen touch area
    touchControls.style.display = 'block';
    
    // Touch start handler
    const handleStart = (e) => {
        e.preventDefault();
        if (!gameRunning) {
            startGame();
            return;
        }
        if (gamePaused) {
            resumeGame();
            return;
        }
        flap();
    };
    
    // Add both touch and mouse events
    touchControls.addEventListener('touchstart', handleStart);
    touchControls.addEventListener('mousedown', handleStart);
    
    // Prevent scrolling on touch devices
    document.addEventListener('touchmove', (e) => {
        if (gameRunning) {
            e.preventDefault();
        }
    }, { passive: false });
}

// Event listeners for buttons
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Handle visibility changes (pause when tab loses focus)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && gameRunning && !gamePaused) {
        pauseGame();
    }
});

function startGame() {
    // Reset game state
    gameRunning = true;
    gamePaused = false;
    score = 0;
    scoreDisplay.textContent = score;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.rotation = 0;
    pipes.length = 0;
    
    // Hide screens
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    pauseScreen.style.display = 'none';
    
    // Start game loop
    lastPipeTime = Date.now() - pipeFrequency;
    gameLoop();
}

function gameLoop() {
    if (!gameRunning || gamePaused) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    
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
    animationId = requestAnimationFrame(gameLoop);
}

function drawBackground() {
    // Draw sky background
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
}

function updateBird() {
    // Apply gravity
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Update rotation based on velocity
    bird.rotation = Math.min(Math.max(bird.velocity * 3, -25), 25);
    
    // Update wing animation
    bird.wingState += 0.1 * bird.wingDirection;
    if (Math.abs(bird.wingState) > 0.5) {
        bird.wingDirection *= -1;
    }
    
    // Prevent bird from going above canvas
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation * Math.PI / 180);
    
    // Draw bird image
    ctx.drawImage(
        birdImg,
        -bird.width / 2,
        -bird.height / 2,
        bird.width,
        bird.height
    );
    
    ctx.restore();
}

function flap() {
    if (gameRunning && !gamePaused) {
        bird.velocity = bird.jump;
        bird.wingState = -0.5;
    }
}

function updatePipes() {
    const now = Date.now();
    
    // Add new pipes
    if (now - lastPipeTime > pipeFrequency) {
        const gapPosition = Math.random() * (canvas.height - pipeGap - 200) + 100;
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
    for (const pipe of pipes) {
        // Top pipe
        ctx.drawImage(
            pipeTopImg,
            pipe.x,
            pipe.topHeight - pipeTopImg.height,
            pipeWidth,
            pipeTopImg.height
        );
        
        // Bottom pipe
        ctx.drawImage(
            pipeBottomImg,
            pipe.x,
            pipe.bottomY,
            pipeWidth,
            pipeBottomImg.height
        );
    }
}

function checkCollisions() {
    // Check if bird hits the ground
    if (bird.y + bird.height > canvas.height) {
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

function pauseGame() {
    gamePaused = true;
    pauseScreen.style.display = 'flex';
    cancelAnimationFrame(animationId);
}

function resumeGame() {
    gamePaused = false;
    pauseScreen.style.display = 'none';
    gameLoop();
}

function endGame() {
    gameRunning = false;
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'flex';
    cancelAnimationFrame(animationId);
}

// Initialize the game
setupTouchControls();

// Optional: Add to home screen prompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    // You can show an "Add to Home Screen" button here
    console.log('PWA install prompt available');
});
