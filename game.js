// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Responsive canvas sizing
function resizeCanvas() {
    const aspectRatio = 9 / 16;
    const windowRatio = window.innerHeight / window.innerWidth;
    
    if (windowRatio > aspectRatio) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth * aspectRatio;
    } else {
        canvas.height = window.innerHeight;
        canvas.width = window.innerHeight / aspectRatio;
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Load configuration
fetch('config.json')
    .then(response => response.json())
    .then(config => startGame(config));

function startGame(config) {
    // Load images
    const birdImg = new Image();
    const pipeImg = new Image();
    const bgImg = new Image();
    
    birdImg.src = config.bird.image;
    pipeImg.src = config.pipe.image;
    bgImg.src = config.background.image;

    // Game objects
    const bird = {
        x: canvas.width / 4,
        y: canvas.height / 2,
        width: config.bird.width,
        height: config.bird.height,
        speed: config.bird.speed,
        gravity: config.bird.gravity,
        jump: config.bird.jump
    };

    let pipes = [];
    let score = 0;
    let frameCount = 0;
    let gameOver = false;
    let bgX = 0;

    // Touch controls
    canvas.addEventListener('touchstart', () => {
        if (!gameOver) {
            bird.speed = bird.jump;
        } else {
            resetGame();
        }
    });

    function spawnPipe() {
        const pipeHeight = Math.random() * (canvas.height - config.pipe.gap - 100) + 50;
        pipes.push({
            x: canvas.width,
            topHeight: pipeHeight,
            passed: false
        });
    }

    function resetGame() {
        bird.y = canvas.height / 2;
        bird.speed = 0;
        pipes = [];
        score = 0;
        gameOver = false;
        frameCount = 0;
    }

    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, bgX + canvas.width, 0, canvas.width, canvas.height);

        // Update background position
        bgX -= config.background.speed;
        if (bgX <= -canvas.width) bgX = 0;

        // Update bird
        bird.speed += bird.gravity;
        bird.y += bird.speed;

        // Draw bird
        ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

        // Pipe logic
        if (frameCount % config.pipe.frequency === 0) {
            spawnPipe();
        }

        pipes.forEach((pipe, index) => {
            pipe.x -= config.pipe.speed;

            // Draw pipes
            ctx.drawImage(pipeImg, pipe.x, 0, config.pipe.width, pipe.topHeight);
            ctx.drawImage(pipeImg, pipe.x, pipe.topHeight + config.pipe.gap, 
                         config.pipe.width, canvas.height);

            // Collision detection
            if (bird.x + bird.width > pipe.x && 
                bird.x < pipe.x + config.pipe.width &&
                (bird.y < pipe.topHeight || 
                 bird.y + bird.height > pipe.topHeight + config.pipe.gap)) {
                gameOver = true;
            }

            // Score
            if (!pipe.passed && bird.x > pipe.x + config.pipe.width) {
                pipe.passed = true;
                score++;
            }

            // Remove off-screen pipes
            if (pipe.x + config.pipe.width < 0) {
                pipes.splice(index, 1);
            }
        });

        // Ground collision
        if (bird.y + bird.height > canvas.height || bird.y < 0) {
            gameOver = true;
        }

        // Draw score
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText(`Score: ${score}`, 20, 40);

        if (gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '40px Arial';
            ctx.fillText('Game Over', canvas.width/2 - 100, canvas.height/2 - 20);
            ctx.font = '20px Arial';
            ctx.fillText('Tap to restart', canvas.width/2 - 60, canvas.height/2 + 20);
        }

        frameCount++;
    }

    // Game loop
    function gameLoop() {
        draw();
        requestAnimationFrame(gameLoop);
    }

    // Wait for images to load before starting
    Promise.all([
        new Promise(resolve => birdImg.onload = resolve),
        new Promise(resolve => pipeImg.onload = resolve),
        new Promise(resolve => bgImg.onload = resolve)
    ]).then(() => {
        gameLoop();
    });
}
