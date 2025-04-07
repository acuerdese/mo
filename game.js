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

// Set canvas size
canvas.width = 400;
canvas.height = 600;

// Load images
const birdImg = new Image();
birdImg.src = 'https://cdn1.iconfinder.com/data/icons/video-games-32/24/video-game-flappy-bird-512.png';

const pipeTopImg = new Image();
pipeTopImg.src = 'pipe-top.png';

const pipeBottomImg = new Image();
pipeBottomImg.src = 'pipe-bottom.png';

const backgroundImg = new Image();
backgroundImg.src = 'background.png';

// Game state
let gameRunning = false;
let gamePaused = false;
let score = 0;
let animationId = null;
let imagesLoaded = 0;
const totalImages = 4;

// Bird properties
const bird = {
    x: 100,
    y: 300,
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
const pipeGap = 150;
const pipeFrequency = 1500; // milliseconds
let lastPipeTime = 0;

// Clouds in background
const clouds = Array(5).fill().map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * (canvas.height / 2),
    width: 60 + Math.random() * 60,
    speed: 0.5 + Math.random() * 1
}));

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

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
canvas.addEventListener('click', flap);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameRunning) return;
        if (gamePaused) {
            resumeGame();
        } else {
            flap();
            pauseGame();
        }
    }
});

function startGame() {
    // Reset game state
    gameRunning = true;
    gamePaused = false;
    score = 0;
    scoreDisplay.textContent = score;
    bird.y = 300;
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
    
    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    clouds.forEach(cloud => {
        // Update cloud position
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) {
            cloud.x = canvas.width;
            cloud.y = Math.random() * (canvas.height / 2);
        }
        
        // Draw cloud
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.width / 3, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width / 3, cloud.y - cloud.width / 6, cloud.width / 4, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width / 2, cloud.y, cloud.width / 3, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width / 1.5, cloud.y + cloud.width / 6, cloud.width / 5, 0, Math.PI * 2);
        ctx.fill();
    });
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
        bird.wingState = -0.5; // Reset wing position on flap
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
