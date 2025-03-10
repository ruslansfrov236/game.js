
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    speed: 5,
    width: 10,
    height: 30,
    gunLength: 30,
    gunAngle: 0,
    health: 100
};

const bullets = [];
const bulletSpeed = 7;
const bulletColor = 'red';

const enemies = [];
var enemySpeed = 2;
let enemiesKilled = 0;

let isGameOver = false;
let score = 0;

let level = 1;
let healthPackAvailable = false;

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
    let type = 'circle'; // Başlangıçda dairə

    if (side === 0) { x = 0; y = Math.random() * canvas.height; }
    else if (side === 1) { x = canvas.width; y = Math.random() * canvas.height; }
    else if (side === 2) { x = Math.random() * canvas.width; y = 0; }
    else { x = Math.random() * canvas.width; y = canvas.height; }
    if (score < 100) type = 'circle';
    
    if (score >= 100 && score < 300) type = 'square'; // 2-ci səviyyə kvadrat
    if (score >= 300) type = 'star'; // 3-cü səviyyə ulduz

    enemies.push({ x, y, speed: enemySpeed, type });
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
    // Sondan geriyə iterasiya edirik
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Səviyyəyə görə zərər miqdarı
        let damage = 0;
        if (level === 1) {
            damage = 10;
        } else if (level === 2) {
            damage = 20;
        } else if (level === 3) {
            damage = 30;
        }

        // Düşmən ilə toqquşma (mesafe 30-dan az olduqda)
        if (distance < 30) {
            player.health -= damage;
            if (player.health <= 0) {
                player.health = 0;
                isGameOver = true;
            }
            // Toqquşma olduqda həmin düşməni silirik
            enemies.splice(i, 1);
            // Döngüdən çıxmayırıq, digər düşmənlər yoxlanılır
            continue;
        }

        // Düşmənin oyunçuya doğru hərəkəti
        enemy.x += (dx / distance) * enemy.speed;
        enemy.y += (dy / distance) * enemy.speed;
    }
}
function detectCollisions() {
    enemies.forEach((enemy, enemyIndex) => {
        bullets.forEach((bullet, bulletIndex) => {
            const dx = bullet.x - enemy.x;
            const dy = bullet.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

          
            if (distance < 30) {
                enemies.splice(enemyIndex, 1);
                bullets.splice(bulletIndex, 1);
                enemiesKilled++;
                score += 10;

                if (score % 10 === 0) {
                    enemySpeed += 0.5; // Düşmən sürətini artır
                }

                if (score >= 100) {
                    level = 2; // 100 xal ilə 2-ci səviyyə
                }

                if (score >= 200) {
                    level = 3; // 200 xal ilə 3-cü səviyyə
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
        if (enemy.type === 'circle') {
            ctx.arc(enemy.x, enemy.y, 15, 0, Math.PI * 2);
        } else if (enemy.type === 'square') {
            ctx.rect(enemy.x - 15, enemy.y - 15, 30, 30);
        } else if (enemy.type === 'star') {
            ctx.moveTo(enemy.x, enemy.y - 15);
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(enemy.x + Math.cos((18 + i * 72) / 180 * Math.PI) * 15, enemy.y - Math.sin((18 + i * 72) / 180 * Math.PI) * 15);
            }
            ctx.closePath();
        }
        ctx.fillStyle = 'black';
        ctx.fill();
    });
}



function spawnHealthPack() {
    if (player.health <=50 && !healthPackAvailable) {
        healthPack = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 20,
            type: 'heart'
        };
        healthPackAvailable = true;
    }
}

function drawHealthPack() {
    if (healthPackAvailable && healthPack) {
        ctx.beginPath();
        ctx.fillStyle = 'red';
        // Sadə ürək forması üçün Bézier əyrilərindən istifadə edirik:
        ctx.moveTo(healthPack.x, healthPack.y);
        ctx.bezierCurveTo(healthPack.x - 10, healthPack.y - 10, healthPack.x - 20, healthPack.y + 10, healthPack.x, healthPack.y + 20);
        ctx.bezierCurveTo(healthPack.x + 20, healthPack.y + 10, healthPack.x + 10, healthPack.y - 10, healthPack.x, healthPack.y);
        ctx.fill();
    }
}

function collectHealthPack() {
    if (healthPackAvailable && healthPack) {
        const dx = player.x - healthPack.x;
        const dy = player.y - healthPack.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < healthPack.radius + 15) { // Toxunma məsafəsi
            player.health  += 10;
            healthPack = null;
            healthPackAvailable = false;
        }
    }
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
    spawnHealthPack();
    collectHealthPack()
    detectCollisions();
    drawStickFigure();
    drawBullets();
    drawEnemies();
    drawHealthPack();

    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Xal: ${score} | Can: ${player.health} | Level: ${level}`, 20, 30);

}

function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

setInterval(spawnEnemy, 1500);
gameLoop();
