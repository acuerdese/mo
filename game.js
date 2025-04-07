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

// Game state
let gameRunning = false;
let gamePaused = false;
let score = 0;
let animationId = null;

// Bird properties
const bird = {
    x: 100,
    y: 300,
    width: 40,
    height: 30,
    velocity: 0,
    gravity: 0.5,
    jump: -10,
    color: '#ffcc00',
    wingAngle: 0,
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
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#56ccf2');
    skyGradient.addColorStop(1, '#2f80ed');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
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
    
    // Update wing animation
    bird.wingAngle += 0.2 * bird.wingDirection;
    if (Math.abs(bird.wingAngle) > 0.5) {
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
    ctx.translate(bird.x, bird.y);
    
    // Body
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.ellipse(bird.width / 2, bird.height / 2, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#ff8c00';
    ctx.beginPath();
    ctx.moveTo(bird.width, bird.height / 2 - 5);
    ctx.lineTo(bird.width + 15, bird.height / 2);
    ctx.lineTo(bird.width, bird.height / 2 + 5);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.width - 10, bird.height / 2 - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Wings
    ctx.fillStyle = '#d4a600';
    ctx.save();
    ctx.translate(bird.width / 2, bird.height / 2);
    ctx.rotate(bird.wingAngle);
    ctx.beginPath();
    ctx.ellipse(-10, 0, 15, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    ctx.restore();
}

function flap() {
    if (gameRunning && !gamePaused) {
        bird.velocity = bird.jump;
        bird.wingAngle = -0.8; // Reset wing position on flap
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
        const topPipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
        topPipeGradient.addColorStop(0, '#4CAF50');
        topPipeGradient.addColorStop(1, '#2E7D32');
        ctx.fillStyle = topPipeGradient;
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        
        // Top pipe edge
        ctx.fillStyle = '#1B5E20';
        ctx.fillRect(pipe.x, pipe.topHeight - 15, pipeWidth, 15);
        
        // Bottom pipe
        const bottomPipeGradient = ctx.createLinearGradient(pipe.x, pipe.bottomY, pipe.x + pipeWidth, pipe.bottomY);
        bottomPipeGradient.addColorStop(0, '#4CAF50');
        bottomPipeGradient.addColorStop(1, '#2E7D32');
        ctx.fillStyle = bottomPipeGradient;
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
        
        // Bottom pipe edge
        ctx.fillStyle = '#1B5E20';
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, 15);
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
