document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    let snake = [{x: 200, y: 200}];
    let food = {x: 100, y: 100};
    let dx = 0, dy = 0;
    let score = 0;
    const snakeSize = 20;
    const boardSize = 400;
  
    function drawSnake() {
      gameBoard.innerHTML = '';
      snake.forEach(segment => {
        const snakeElement = document.createElement('div');
        snakeElement.style.left = segment.x + 'px';
        snakeElement.style.top = segment.y + 'px';
        snakeElement.classList.add('snake');
        gameBoard.appendChild(snakeElement);
      });
    }
  
    function drawFood() {
      const foodElement = document.createElement('div');
      foodElement.style.left = food.x + 'px';
      foodElement.style.top = food.y + 'px';
      foodElement.classList.add('food');
      gameBoard.appendChild(foodElement);
    }
  
    function moveSnake() {
      const head = {x: snake[0].x + dx, y: snake[0].y + dy};
      snake.unshift(head);
  
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        generateFood();
      } else {
        snake.pop();
      }
    }
  
    function generateFood() {
      const maxPos = boardSize / snakeSize;
      food = {
        x: Math.floor(Math.random() * maxPos) * snakeSize,
        y: Math.floor(Math.random() * maxPos) * snakeSize
      };
    }
  
    function gameOver() {
      alert('Game over! Final score: ' + score);
      snake = [{x: 200, y: 200}];
      dx = 0;
      dy = 0;
      score = 0;
      generateFood();
    }
  
    function checkCollision() {
      const head = snake[0];
      if (
        head.x < 0 ||
        head.x >= boardSize ||
        head.y < 0 ||
        head.y >= boardSize ||
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
      ) {
        gameOver();
      }
    }
  
    function changeDirection(event) {
      const LEFT_KEY = 37;
      const RIGHT_KEY = 39;
      const UP_KEY = 38;
      const DOWN_KEY = 40;
  
      const keyPressed = event.keyCode;
      const goingUp = dy === -snakeSize;
      const goingDown = dy === snakeSize;
      const goingLeft = dx === -snakeSize;
      const goingRight = dx === snakeSize;
  
      if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -snakeSize;
        dy = 0;
      }
      if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -snakeSize;
      }
      if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = snakeSize;
        dy = 0;
      }
      if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = snakeSize;
      }
    }
  
    function gameLoop() {
      setTimeout(function() {
        drawSnake();
        drawFood();
        moveSnake();
        checkCollision();
        gameLoop();
      }, 80);
    }
  
    document.addEventListener('keydown', changeDirection);
    generateFood();
    gameLoop();
  });