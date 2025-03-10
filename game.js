const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    speed: 5,
    width: 10,
    height: 30,
    gunLength: 30,
    gunAngle: 0
};

const bullets = [];
const bulletSpeed = 7;
const bulletColor = 'red';

const enemies = [];
const enemySpeed = 2;
let enemiesKilled = 0;

let isGameOver = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const keys = { up: false, left: false, down: false, right: false };

window.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'ArrowUp') keys.up = true;
    if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 's' || e.key === 'ArrowDown') keys.down = true;
    if (e.key === 'd' || e.key === 'ArrowRight') keys.right = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 'ArrowUp') keys.up = false;
    if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 's' || e.key === 'ArrowDown') keys.down = false;
    if (e.key === 'd' || e.key === 'ArrowRight') keys.right = false;
});

canvas.addEventListener('mousemove', (e) => {
    const dx = e.clientX - player.x;
    const dy = e.clientY - player.y;
    player.gunAngle = Math.atan2(dy, dx);
});

canvas.addEventListener('click', () => {
    if (isGameOver) return;

    const bullet = {
        x: player.x + Math.cos(player.gunAngle) * player.gunLength,
        y: player.y + Math.sin(player.gunAngle) * player.gunLength,
        angle: player.gunAngle
    };
    bullets.push(bullet);
});

function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;

    if (side === 0) { x = 0; y = Math.random() * canvas.height; }
    else if (side === 1) { x = canvas.width; y = Math.random() * canvas.height; }
    else if (side === 2) { x = Math.random() * canvas.width; y = 0; }
    else { x = Math.random() * canvas.width; y = canvas.height; }

    enemies.push({ x, y, speed: enemySpeed });
}

function movePlayer() {
    if (keys.up && player.y - player.speed - 45 > 0) player.y -= player.speed;
    if (keys.left && player.x - player.speed - 30 > 0) player.x -= player.speed;
    if (keys.down && player.y + player.speed + 60 < canvas.height) player.y += player.speed;
    if (keys.right && player.x + player.speed + player.gunLength + 10 < canvas.width) player.x += player.speed;
}

function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.x += Math.cos(bullet.angle) * bulletSpeed;
        bullet.y += Math.sin(bullet.angle) * bulletSpeed;

        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });
}

function moveEnemies() {
    enemies.forEach((enemy, index) => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 20) {
            isGameOver = true;
        }

        enemy.x += (dx / distance) * enemy.speed;
        enemy.y += (dy / distance) * enemy.speed;
    });
}

function detectCollisions() {
    enemies.forEach((enemy, enemyIndex) => {
        bullets.forEach((bullet, bulletIndex) => {
            const dx = bullet.x - enemy.x;
            const dy = bullet.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 20) {
                enemies.splice(enemyIndex, 1);
                bullets.splice(bulletIndex, 1);
                enemiesKilled++;

                if (enemiesKilled % 10 === 0) {
                    enemies.forEach(enemy => enemy.speed += 0.5);
                }
            }
        });
    });
}

function drawStickFigure() {
    ctx.beginPath();
    ctx.arc(player.x, player.y - 30, 15, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(player.x, player.y - 15);
    ctx.lineTo(player.x, player.y + 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x + Math.cos(player.gunAngle) * player.gunLength, player.y + Math.sin(player.gunAngle) * player.gunLength);
    ctx.stroke();
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = bulletColor;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (isGameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '50px Arial';
        ctx.fillText('Məğlub oldun!', canvas.width / 2 - 150, canvas.height / 2);
        return;
    }
    movePlayer();
    moveBullets();
    moveEnemies();
    detectCollisions();
    drawStickFigure();
    drawBullets();
    drawEnemies();
}

function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

setInterval(spawnEnemy, 1500);
gameLoop();