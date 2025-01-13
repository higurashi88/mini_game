const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Set canvas size
canvas.width = 400;
canvas.height = 600;

// Game objects
const player = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    width: 30,
    height: 30,
    speed: 5,
    color: '#00ff00'
};

const obstacles = [];
let score = 0;
let gameOver = false;
let animationId;
let gameTime = 0;  // Track game time in seconds
let lastTimeCheck = Date.now();

// Difficulty settings
const difficulty = {
    baseSpawnRate: 0.02,
    baseSpeed: 2,
    maxSpeed: 8,
    getSpawnRate: () => Math.min(difficulty.baseSpawnRate * (1 + gameTime / 30), 0.08),
    getSpeed: () => Math.min(difficulty.baseSpeed * (1 + gameTime / 20), difficulty.maxSpeed)
};

// Controls
let leftPressed = false;
let rightPressed = false;

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') leftPressed = true;
    if (e.key === 'ArrowRight') rightPressed = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') leftPressed = false;
    if (e.key === 'ArrowRight') rightPressed = false;
});

// Touch controls
let touchStartX = null;
canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (touchStartX === null) return;
    
    const touchX = e.touches[0].clientX;
    const diff = touchX - touchStartX;
    
    if (diff > 0) {
        rightPressed = true;
        leftPressed = false;
    } else {
        leftPressed = true;
        rightPressed = false;
    }
    
    touchStartX = touchX;
});

canvas.addEventListener('touchend', () => {
    touchStartX = null;
    leftPressed = false;
    rightPressed = false;
});

// Create obstacle
function createObstacle() {
    const width = Math.random() * 30 + 20;
    const currentSpeed = difficulty.getSpeed();
    obstacles.push({
        x: Math.random() * (canvas.width - width),
        y: -20,
        width: width,
        height: 20,
        speed: currentSpeed + Math.random(),  // Add some variation to speed
        color: `hsl(${Math.random() * 360}, 50%, 50%)`
    });
}

// Update game time
function updateGameTime() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTimeCheck) / 1000; // Convert to seconds
    gameTime += deltaTime;
    lastTimeCheck = currentTime;
}

// Update game objects
function update() {
    updateGameTime();

    // Move player
    if (leftPressed && player.x > 0) {
        player.x -= player.speed;
    }
    if (rightPressed && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.y += obstacle.speed;

        // Remove obstacles that are off screen
        if (obstacle.y > canvas.height) {
            obstacles.splice(i, 1);
            score++;
            scoreElement.textContent = `Score: ${score}`;
        }

        // Check collision
        if (collision(player, obstacle)) {
            gameOver = true;
        }
    }

    // Create new obstacles based on current spawn rate
    if (Math.random() < difficulty.getSpawnRate()) {
        createObstacle();
    }
}

// Check collision between two rectangles
function collision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Draw game objects
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw obstacles
    obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw game time and difficulty
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Time: ${Math.floor(gameTime)}s`, canvas.width - 10, 30);

    // Draw game over screen
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText(`Time: ${Math.floor(gameTime)}s`, canvas.width / 2, canvas.height / 2 + 70);
        ctx.fillText('Click to restart', canvas.width / 2, canvas.height / 2 + 110);
    }
}

// Game loop
function gameLoop() {
    if (!gameOver) {
        update();
        draw();
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Start game
function startGame() {
    obstacles.length = 0;
    score = 0;
    gameOver = false;
    gameTime = 0;
    lastTimeCheck = Date.now();
    player.x = canvas.width / 2;
    scoreElement.textContent = 'Score: 0';
    gameLoop();
}

// Restart game on click when game over
canvas.addEventListener('click', () => {
    if (gameOver) {
        cancelAnimationFrame(animationId);
        startGame();
    }
});

// Start the game initially
startGame();