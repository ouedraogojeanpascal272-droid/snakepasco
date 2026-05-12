// Éléments DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('score');
const restartBtn = document.getElementById('restart');
const pauseBtn = document.getElementById('pauseBtn');
const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');

// Paramètres fixes
const tileCount = 20;
let gridSize;
const MAX_CANVAS_SIZE = 265;

// Variables du jeu
let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let food = {};
let score = 0;
let gameRunning = false;
let gameLoop = null;
let gameSpeed = 100; // ms (par défaut)
let paused = false;   // état de pause

// ===================== CANVAS RESPONSIVE =====================
function resizeCanvas() {
    const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.6, MAX_CANVAS_SIZE);
    canvas.width = size;
    canvas.height = size;
    gridSize = canvas.width / tileCount;
    if (gameRunning && !paused) {
        drawGame();
    } else if (paused) {
        drawPauseOverlay();
    } else {
        ctx.fillStyle = '#34495e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ===================== VITESSE =====================
speedRange.addEventListener('input', () => {
    gameSpeed = parseInt(speedRange.value);
    speedValue.textContent = gameSpeed;
    if (gameRunning && !paused) {
        clearInterval(gameLoop);
        gameLoop = setInterval(gameStep, gameSpeed);
    }
});

// ===================== JEU =====================
function randomFood() {
    while (true) {
        const x = Math.floor(Math.random() * tileCount);
        const y = Math.floor(Math.random() * tileCount);
        if (!snake.some(segment => segment.x === x && segment.y === y)) {
            return { x, y };
        }
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Serpent
    ctx.fillStyle = '#2ecc71';
    for (let segment of snake) {
        ctx.fillRect(
            segment.x * gridSize,
            segment.y * gridSize,
            gridSize - 2,
            gridSize - 2
        );
    }

    // Nourriture (cercle rouge)
    ctx.fillStyle = '#e74c3c';
    const centerX = food.x * gridSize + gridSize / 2;
    const centerY = food.y * gridSize + gridSize / 2;
    const radius = gridSize / 2 - 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawPauseOverlay() {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f39c12';
    ctx.font = `${canvas.width / 10}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('PAUSE', canvas.width / 2, canvas.height / 2);
    ctx.font = `${canvas.width / 20}px Arial`;
    ctx.fillText('Appuyez sur ▶️ pour reprendre', canvas.width / 2, canvas.height / 2 + 40);
}

function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    // Collision avec les murs
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return false;
    }
    // Collision avec soi-même
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        return false;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreSpan.textContent = score;
        food = randomFood();
    } else {
        snake.pop();
    }
    return true;
}

function gameStep() {
    if (!moveSnake()) {
        gameOver();
        return;
    }
    drawGame();
}

function startGame() {
    paused = false;
    pauseBtn.textContent = '⏸️ Pause';
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    score = 0;
    scoreSpan.textContent = score;
    food = randomFood();
    gameRunning = true;
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, gameSpeed);
    drawGame();
}

function gameOver() {
    paused = false;
    pauseBtn.textContent = '⏸️ Pause';
    gameRunning = false;
    clearInterval(gameLoop);
    drawGame();
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e74c3c';
    ctx.font = `${canvas.width / 10}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    ctx.font = `${canvas.width / 20}px Arial`;
    ctx.fillText('Appuyez sur "Nouvelle partie"', canvas.width / 2, canvas.height / 2 + 40);
}

// ===================== PAUSE =====================
function togglePause() {
    if (!gameRunning) return;

    if (paused) {
        // Reprendre
        paused = false;
        pauseBtn.textContent = '⏸️ Pause';
        drawGame();
        gameLoop = setInterval(gameStep, gameSpeed);
    } else {
        // Mettre en pause
        paused = true;
        pauseBtn.textContent = '▶️ Reprendre';
        clearInterval(gameLoop);
        drawPauseOverlay();
    }
}

pauseBtn.addEventListener('click', togglePause);

// ===================== CONTRÔLES =====================
function setDirection(dx, dy) {
    // Empêche le demi-tour
    if (direction.x === -dx && direction.y === -dy) return;
    direction = { x: dx, y: dy };
}

// Clavier
window.addEventListener('keydown', (e) => {
    if (!gameRunning || paused) return;
    const key = e.key;
    if (key === 'ArrowUp') setDirection(0, -1);
    else if (key === 'ArrowDown') setDirection(0, 1);
    else if (key === 'ArrowLeft') setDirection(-1, 0);
    else if (key === 'ArrowRight') setDirection(1, 0);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        e.preventDefault();
    }
});

// Boutons tactiles
document.getElementById('btnUp').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (gameRunning && !paused) setDirection(0, -1);
});
document.getElementById('btnDown').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (gameRunning && !paused) setDirection(0, 1);
});
document.getElementById('btnLeft').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (gameRunning && !paused) setDirection(-1, 0);
});
document.getElementById('btnRight').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (gameRunning && !paused) setDirection(1, 0);
});

// Nouvelle partie (redémarrage)
restartBtn.addEventListener('click', startGame);

// Démarrer
startGame();
