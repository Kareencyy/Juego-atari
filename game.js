const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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
}

function drawScore() {
  ctx.fillStyle = "#0ff";
  ctx.font = "10px 'Press Start 2P'";
  ctx.fillText(`Puntos: ${score}`, 10, 10);
  ctx.fillText(`Nivel: ${level}`, canvas.width - 100, 10);
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPaddle();
  drawBricks();
  drawBalls();
  drawScore();
  moveBalls();

  requestAnimationFrame(loop);
}
