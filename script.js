"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const messageEl = document.getElementById("message");
  const qr = document.getElementById("qr");

  const GROUND_H = 20;

  let Ana = { x: 50, y: 0, vy: 0, jumping: false, size: 30, jumpVelocity: -20 };
  let obstacle = { x: 0, y: 0, size: 30 };
  let gravity = 2;
  let score = 0;
  let gameOver = false;
  let gamePaused = false;

  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  let obstacleSpeed = 5; // same for both

  function resizeCanvas() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (isMobile) {
      canvas.width = Math.floor(vw * 0.95);
      canvas.height = Math.floor(Math.min(vh * 0.6, canvas.width * 0.33));

      Ana.size = Math.floor(canvas.height * 0.15);
      obstacle.size = Math.floor(canvas.height * 0.15);

      obstacleSpeed = 5; // same as desktop
      gravity = 2;       // same as desktop

      // Lower jump to avoid hitting top but still clear obstacle
      Ana.jumpVelocity = -Math.min(canvas.height * 0.13, canvas.height - Ana.size - 10);
    } else {
      canvas.width = 600;
      canvas.height = 200;
      Ana.size = 30;
      obstacle.size = 30;
      obstacleSpeed = 5;
      gravity = 2;
      Ana.jumpVelocity = -20;
    }

    const floorY = canvas.height - GROUND_H;
    Ana.y = floorY - Ana.size;
    obstacle.y = floorY - obstacle.size;
    obstacle.x = canvas.width;
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function showMessage(text, persist = false) {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.style.opacity = "1";
    if (!persist) {
      clearTimeout(messageEl._timeout);
      messageEl._timeout = setTimeout(() => {
        messageEl.style.opacity = "0";
      }, 3000);
    }
  }

  function hideMessage() {
    if (messageEl) messageEl.style.opacity = "0";
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const floorY = canvas.height - GROUND_H;

    // Ground
    ctx.fillStyle = "#999";
    ctx.fillRect(0, floorY, canvas.width, GROUND_H);

    // Ana
    ctx.save();
    ctx.font = Ana.size + "px Arial";
    ctx.textBaseline = "bottom";
    ctx.translate(Ana.x + Ana.size / 2, 0);
    ctx.scale(-1, 1);
    ctx.fillText("🏃‍♀️", -Ana.size / 2, Ana.y + Ana.size);
    ctx.restore();

    // Obstacle
    ctx.font = obstacle.size + "px Arial";
    ctx.textBaseline = "bottom";
    ctx.fillText("🚧", obstacle.x, obstacle.y + obstacle.size);

    // Score
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.textBaseline = "top";
    ctx.fillText("Score: " + score, 10, 10);
  }

  function update() {
    if (!gameOver && !gamePaused) {
      const floorY = canvas.height - GROUND_H;
      const floorTop = floorY - Ana.size;

      Ana.y += Ana.vy;

      // Slow jump and clamp to top
      if (Ana.y < floorTop) {
        Ana.vy += gravity * 0.5; // slower fall
        if (Ana.y < 0) Ana.y = 0; // prevent leaving top
      } else {
        Ana.y = floorTop;

        // Move forward when landing
        if (Ana.jumping) {
          Ana.x += Math.floor(canvas.width * 0.03);
          if (Ana.x + Ana.size > canvas.width - 10) Ana.x = canvas.width - Ana.size - 10;
        }

        Ana.vy = 0;
        Ana.jumping = false;
      }

      // Obstacle movement
      obstacle.x -= obstacleSpeed;
      if (obstacle.x + obstacle.size < 0) {
        obstacle.x = canvas.width;
        score++;

        if (score === 3) showMessage("You are almost there!");
        if (score === 5) {
          showMessage("Congratulations! You made it!", true);
          if (qr) qr.style.display = "block";
          gamePaused = true; // stop game at 5 points
        }
      }

      // Collision detection
      if (
        Ana.x < obstacle.x + obstacle.size &&
        Ana.x + Ana.size > obstacle.x &&
        Ana.y + Ana.size > obstacle.y
      ) {
        gameOver = true;
        showMessage("Don't give up! You can do it!");
        setTimeout(() => window.location.reload(), 3000);
      }
    }

    draw();
    requestAnimationFrame(update);
  }

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !Ana.jumping && !gamePaused) {
      Ana.vy = Ana.jumpVelocity;
      Ana.jumping = true;
    }
  });

  document.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      if (!Ana.jumping && !gamePaused) {
        Ana.vy = Ana.jumpVelocity;
        Ana.jumping = true;
      }
    },
    { passive: false }
  );

  draw();
  update();
});
