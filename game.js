const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const musicToggle = document.getElementById("musicToggle");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const bgMusic = document.getElementById("bgMusic");

let gameInterval;
let isPaused = false;
let score = 0;
let level = 1;
let bricks = [];
let balls = [];

const paddle = {
  width: 75,
  height: 10,
  x: canvas.width / 2 - 75 / 2,
  y: canvas.height - 20,
  dx: 5
};

function createBricks(rows) {
  bricks = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < 5; c++) {
      bricks.push({
        x: 10 + c * 90,
        y: 30 + r * 20,
        width: 80,
        height: 10,
        alive: true
      });
    }
  }
}

function createBall(x, y, dx, dy) {
  balls.push({ x, y, dx, dy, radius: 5 });
}

function drawPaddle() {
  ctx.fillStyle = "#0ff";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBricks() {
  bricks.forEach(brick => {
    if (brick.alive) {
      ctx.fillStyle = "#f00";
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    }
  });
}

function drawBalls() {
  balls.forEach(ball => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();
  });
}

function moveBalls() {
  balls.forEach(ball => {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
      ball.dx = -ball.dx;
    }

    if (ball.y - ball.radius < 0) {
      ball.dy = -ball.dy;
    }

    if (
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.width &&
      ball.y + ball.radius > paddle.y
    ) {
      ball.dy = -ball.dy;
    }

    bricks.forEach(brick => {
      if (brick.alive &&
          ball.x > brick.x &&
          ball.x < brick.x + brick.width &&
          ball.y - ball.radius < brick.y + brick.height &&
          ball.y + ball.radius > brick.y) {
        brick.alive = false;
        ball.dy = -ball.dy;
        score += 10;
        if (Math.random() < 0.1) {
          createBall(ball.x, ball.y, ball.dx, -ball.dy);
        }
      }
    });
  });

  balls = balls.filter(ball => ball.y - ball.radius < canvas.height);
  if (balls.length === 0) {
    resetGame();
  }
}

function drawScore() {
  ctx.fillStyle = "#0ff";
  ctx.font = "10px 'Press Start 2P'";
  ctx.fillText(`Puntos: ${score}`, 10, 10);
  ctx.fillText(`Nivel: ${level}`, canvas.width - 100, 10);
}

function loop() {
  if (isPaused) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPaddle();
  drawBricks();
  drawBalls();
  drawScore();
  moveBalls();

  if (bricks.every(b => !b.alive)) {
    level++;
    createBricks(level);
    createBall(canvas.width / 2, canvas.height / 2, 2, -2);
  }

  requestAnimationFrame(loop);
}

function resetGame() {
  score = 0;
  level = 1;
  createBricks(level);
  balls = [];
  createBall(canvas.width / 2, canvas.height / 2, 2, -2);
  saveProgress();
}

function saveProgress() {
  localStorage.setItem("breakerScore", score);
  localStorage.setItem("breakerLevel", level);
}

function loadProgress() {
  score = parseInt(localStorage.getItem("breakerScore")) || 0;
  level = parseInt(localStorage.getItem("breakerLevel")) || 1;
}

canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  paddle.x = mouseX - paddle.width / 2;
});

canvas.addEventListener("touchmove", e => {
  const rect = canvas.getBoundingClientRect();
  const touchX = e.touches[0].clientX - rect.left;
  paddle.x = touchX - paddle.width / 2;
  e.preventDefault();
}, { passive: false });

startBtn.addEventListener("click", () => {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";
  bgMusic.play();
  loadProgress();
  createBricks(level);
  createBall(canvas.width / 2, canvas.height / 2, 2, -2);
  loop();
});

musicToggle.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play();
    musicToggle.textContent = "🔊";
  } else {
    bgMusic.pause();
    musicToggle.textContent = "🔇";
  }
});

pauseBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  if (!isPaused) loop();
});

restartBtn.addEventListener("click", () => {
  resetGame();
  if (bgMusic.paused) bgMusic.play();
  isPaused = false;
  loop();
});
