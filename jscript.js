// GAME_PIXEL_COUNT is the pixels on horizontal or vertical axis of the game board (SQUARE).
const AVAILABLE_FOOD = ['sap','sap', 'boomi', 'wso2', 'axway', 'informatica', 'tibco', 'tibco', 'microsoft', 'workato', 'softwareag', 'apigee']
const GAME_PIXEL_COUNT = 20;
const SQUARE_OF_GAME_PIXEL_COUNT = Math.pow(GAME_PIXEL_COUNT, 2);

let totalFoodEaten = 0;
let totalDistanceTravelled = 0;

/// THE GAME BOARD:
const gameContainer = document.getElementById("gameContainer");

const createGameBoardPixels = () => {
  let gamePixelDivs = '';
  for (let i = 1; i <= SQUARE_OF_GAME_PIXEL_COUNT; ++i) {
    gamePixelDivs = `${gamePixelDivs} <div class="gameBoardPixel" id="pixel${i}"></div>`;
  }
  // Populate the [#gameContainer] div with small div's representing game pixels
  gameContainer.innerHTML = `${gameContainer.innerHTML} ${gamePixelDivs}`;
};

// This variable always holds the updated array of game pixels created by createGameBoardPixels() :
const gameBoardPixels = document.getElementsByClassName("gameBoardPixel");

/// THE FOOD:
let currentFoodPostion = 0;
const createFood = () => {
  // Remove previous food;
  gameBoardPixels[currentFoodPostion].classList.remove("food");
  gameBoardPixels[currentFoodPostion].style.backgroundImage = null
  
  // Create new food
  currentFoodPostion = Math.random();
  currentFoodPostion = Math.floor(
    currentFoodPostion * SQUARE_OF_GAME_PIXEL_COUNT
  );
  while (gameBoardPixels[currentFoodPostion].classList.contains("snakeBodyPixel")) {
    currentFoodPostion = Math.random();
    currentFoodPostion = Math.floor(
      currentFoodPostion * SQUARE_OF_GAME_PIXEL_COUNT
    );
  }


  let newFood = AVAILABLE_FOOD[Math.floor(Math.random()*AVAILABLE_FOOD.length)];
  gameBoardPixels[currentFoodPostion].style.backgroundImage = "url('images/food/".concat(newFood).concat(".png')");
  gameBoardPixels[currentFoodPostion].classList.add("food");
};

/// THE SNAKE:

// Direction codes (Keyboard key codes for arrow keys):
const LEFT_DIR = 37;
const UP_DIR = 38;
const RIGHT_DIR = 39;
const DOWN_DIR = 40;

// Set snake direction initially to right
let snakeCurrentDirection = RIGHT_DIR;
let snakeHasMoved = true;

const changeDirection = (newDirectionCode) => {
  // This is to cover a race condition where the snake would make a 180 degree turn
  // without moving therefore biting it's tail
  if (!snakeHasMoved) {
    return
  }

  // Change the direction of the snake
  if (newDirectionCode == snakeCurrentDirection) return;

  if (newDirectionCode == LEFT_DIR && snakeCurrentDirection != RIGHT_DIR) {
    snakeCurrentDirection = newDirectionCode;
  } else if (newDirectionCode == UP_DIR && snakeCurrentDirection != DOWN_DIR) {
    snakeCurrentDirection = newDirectionCode;
  } else if (newDirectionCode == RIGHT_DIR && snakeCurrentDirection != LEFT_DIR ) {
    snakeCurrentDirection = newDirectionCode;
  } else if (newDirectionCode == DOWN_DIR && snakeCurrentDirection != UP_DIR) {
    snakeCurrentDirection = newDirectionCode;
  }
  snakeHasMoved = false
};

// Let the starting position of the snake be at the middle of game board
let currentSnakeHeadPosition = SQUARE_OF_GAME_PIXEL_COUNT / 2;

// Initial snake length
let snakeLength = 1000;

// Move snake continously by calling this function repeatedly :
const moveSnake = () => {
  switch (snakeCurrentDirection) {
    case LEFT_DIR:
      --currentSnakeHeadPosition;
      const isSnakeHeadAtLastGameBoardPixelTowardsLeft =
        currentSnakeHeadPosition % GAME_PIXEL_COUNT == GAME_PIXEL_COUNT - 1 ||
        currentSnakeHeadPosition < 0;
      if (isSnakeHeadAtLastGameBoardPixelTowardsLeft) {
        currentSnakeHeadPosition = currentSnakeHeadPosition + GAME_PIXEL_COUNT;
      }
      break;
    case UP_DIR:
      currentSnakeHeadPosition = currentSnakeHeadPosition - GAME_PIXEL_COUNT;
      const isSnakeHeadAtLastGameBoardPixelTowardsUp =
        currentSnakeHeadPosition < 0;
      if (isSnakeHeadAtLastGameBoardPixelTowardsUp) {
        currentSnakeHeadPosition =
          currentSnakeHeadPosition + SQUARE_OF_GAME_PIXEL_COUNT;
      }
      break;
    case RIGHT_DIR:
      ++currentSnakeHeadPosition;
      const isSnakeHeadAtLastGameBoardPixelTowardsRight =
        currentSnakeHeadPosition % GAME_PIXEL_COUNT == 0;
      if (isSnakeHeadAtLastGameBoardPixelTowardsRight) {
        currentSnakeHeadPosition = currentSnakeHeadPosition - GAME_PIXEL_COUNT;
      }
      break;
    case DOWN_DIR:
      currentSnakeHeadPosition = currentSnakeHeadPosition + GAME_PIXEL_COUNT;
      const isSnakeHeadAtLastGameBoardPixelTowardsDown =
        currentSnakeHeadPosition > SQUARE_OF_GAME_PIXEL_COUNT - 1;
      if (isSnakeHeadAtLastGameBoardPixelTowardsDown) {
        currentSnakeHeadPosition =
          currentSnakeHeadPosition - SQUARE_OF_GAME_PIXEL_COUNT;
      }
      break;
    default:
      break;
  }

  let nextSnakeHeadPixel = gameBoardPixels[currentSnakeHeadPosition];

  // Kill snake if it bites itself:
  if (nextSnakeHeadPixel.classList.contains("snakeBodyPixel")) {
    // Stop moving the snake
    clearInterval(moveSnakeInterval);
    if (
      !alert(
        `You have replaced ${totalFoodEaten} legacy connections after ${totalDistanceTravelled} time units.`
      )
    )
      window.location.reload();
  }

  nextSnakeHeadPixel.classList.add("snakeBodyPixel");

  setTimeout(() => {
    nextSnakeHeadPixel.classList.remove("snakeBodyPixel");
  }, snakeLength);

  // Update total distance travelled
  totalDistanceTravelled++;
  // Update in UI:
  document.getElementById("blocksTravelled").innerHTML = totalDistanceTravelled;

  if (currentSnakeHeadPosition == currentFoodPostion) {
    // Update total food eaten
    totalFoodEaten++;
    // Update in UI:
    document.getElementById("pointsEarned").innerHTML = totalFoodEaten;

    // Increase Snake length:
    snakeLength = snakeLength + 100;
    createFood();
  }
  snakeHasMoved = true
};

/// CALL THE FOLLOWING FUNCTIONS TO RUN THE GAME:

// Create game board pixels:
createGameBoardPixels();

// Create initial food:
createFood();

// Move snake:
var moveSnakeInterval = setInterval(moveSnake, 100);

// Call change direction function on keyboard key-down event:
addEventListener("keydown", (e) => {
  changeDirection(e.keyCode);

  // ensure change direction keys don't trigger page scrolling
  if (e.keyCode == LEFT_DIR ||
      e.keyCode == RIGHT_DIR ||
      e.keyCode == UP_DIR ||
      e.keyCode == DOWN_DIR) {
        e.preventDefault()
      }
});

// ON SCREEN CONTROLLERS:
const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");
const upButton = document.getElementById("upButton");
const downButton = document.getElementById("downButton");

leftButton.onclick = () => changeDirection(LEFT_DIR);
rightButton.onclick = () => changeDirection(RIGHT_DIR);
upButton.onclick = () => changeDirection(UP_DIR);
downButton.onclick = () => changeDirection(DOWN_DIR);
