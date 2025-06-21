const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

let paddle = {
  w: width * 0.2,
  h: 15,
  x: width / 2 - width * 0.1,
  y: height - 30
};

let balls = [
  { x: width / 2, y: height / 2, r: 10, dx: 4, dy: -4 }
];

let bricks = [];
let rows = 3;
let cols = Math.floor(width / 100);
let brickW = width / cols - 10;
let brickH = 20;
let padding = 10;

let score = Number(localStorage.getItem('breakerScore')) || 0;
document.getElementById('score').textContent = `Puntos: ${score}`;

function createBricks() {
  bricks = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      bricks.push({
        x: c * (brickW + padding),
        y: r * (brickH + padding) + 50,
        w: brickW,
        h: brickH,
        alive: true
      });
    }
  }
}

createBricks();

function drawPaddle() {
  ctx.fillStyle = '#0f0';
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
}

function drawBalls() {
  balls.forEach(ball => {
    ctx.fillStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBricks() {
  bricks.forEach(brick => {
    if (brick.alive) {
      ctx.fillStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
      ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
    }
  });
}

function moveBalls() {
  balls.forEach((ball, index) => {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x < ball.r || ball.x > width - ball.r) ball.dx *= -1;
    if (ball.y < ball.r) ball.dy *= -1;

    if (
      ball.y + ball.r > paddle.y &&
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.w
    ) {
      ball.dy *= -1;
    }

    bricks.forEach(brick => {
      if (
        brick.alive &&
        ball.x > brick.x &&
        ball.x < brick.x + brick.w &&
        ball.y > brick.y &&
        ball.y < brick.y + brick.h
      ) {
        ball.dy *= -1;
        brick.alive = false;
        score += 10;
        localStorage.setItem('breakerScore', score);
        document.getElementById('score').textContent = `Puntos: ${score}`;

        if (Math.random() < 0.2) {
          let multiplier = Math.random() < 0.5 ? 2 : 3;
          for (let i = 0; i < multiplier - 1; i++) {
            balls.push({
              x: ball.x,
              y: ball.y,
              r: 10,
              dx: ball.dx * (Math.random() > 0.5 ? 1 : -1),
              dy: ball.dy
            });
          }
        }
      }
    });

    if (ball.y - ball.r > height) {
      balls.splice(index, 1);
    }
  });

  if (balls.length === 0) {
    alert('¡Perdiste!');
    score = 0;
    localStorage.setItem('breakerScore', score);
    document.getElementById('score').textContent = `Puntos: 0`;
    rows = 3;
    createBricks();
    balls = [{ x: width / 2, y: height / 2, r: 10, dx: 4, dy: -4 }];
  }
}

function checkBricksCleared() {
  if (bricks.every(b => !b.alive)) {
    rows++;
    createBricks();
    balls.push({
      x: width / 2,
      y: height / 2,
      r: 10,
      dx: 4 * (Math.random() > 0.5 ? 1 : -1),
      dy: -4
    });
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, width, height);
  drawPaddle();
  drawBalls();
  drawBricks();
  moveBalls();
  checkBricksCleared();
  requestAnimationFrame(gameLoop);
}

gameLoop();

function updatePaddlePos(e) {
  let clientX = e.touches ? e.touches[0].clientX : e.clientX;
  paddle.x = clientX - paddle.w / 2;
  paddle.x = Math.max(0, Math.min(paddle.x, width - paddle.w));
}

window.addEventListener('mousemove', updatePaddlePos);
window.addEventListener('touchmove', updatePaddlePos, { passive: false });

window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  paddle.w = width * 0.2;
  paddle.y = height - 30;
  brickW = width / cols - 10;
  createBricks();
});

//  Música control
const bgMusic = document.getElementById('audiopou');
const musicToggle = document.getElementById('musicToggle');
let musicPlaying = false;

function startMusicOnce() {
  if (!musicPlaying) {
    bgMusic.play();
    musicPlaying = true;
    musicToggle.textContent = '🔊';
  }
  window.removeEventListener('click', startMusicOnce);
  window.removeEventListener('touchstart', startMusicOnce);
}
window.addEventListener('click', startMusicOnce);
window.addEventListener('touchstart', startMusicOnce);

  musicToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (bgMusic.paused) {
      bgMusic.play();
      musicToggle.textContent = '🔊';
    } else {
      bgMusic.pause();
      musicToggle.textContent = '🔇';
    }
  });
  document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('startScreen').style.display = 'none';
    bgMusic.play();
    gameLoop(); 
  });
