// GAME_PIXEL_COUNT is the pixels on horizontal or vertical axis of the game board (SQUARE).
const AVAILABLE_FOOD = ['sap','sap', 'tibco', 'tibco', 'boomi', 'wso2', 'axway', 'microsoft', 'workato', 'softwareag', 'apigee']
const AVAILABLE_FOOD_UNIQUE = Array.from(new Set(AVAILABLE_FOOD))
const GAME_PIXEL_COUNT = 20;
const SQUARE_OF_GAME_PIXEL_COUNT = Math.pow(GAME_PIXEL_COUNT, 2);

let totalFoodEaten = 0;
let totalDistanceTravelled = 0;
let timeout = null
timeLimit = 0

if (urlParams.has('event') && urlParams.has('timer')) {
  console.warn("Warning, specifying a timer and event has no effect. The timer is defined by the event-specific leaderboard (same rules for all).")
}

if (urlParams.has('timer')) {
  console.warn("Warning, hardcoding a timer disables the leaderboard (same rules for all).")
}

let apiUrl = 'https://mule-snake-api-fu1jjb.m3jzw3-2.deu-c1.cloudhub.io/api/leaderboard';
// let apiUrl = 'http://localhost:8081/api/leaderboard';
if (urlParams.has('event')) {
  apiUrl = apiUrl.concat("?event=").concat(urlParams.get('event'))
}
let leaderboardItems = []

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
  gameBoardPixels[currentFoodPostion].removeAttribute("id");
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
  gameBoardPixels[currentFoodPostion].setAttribute('id', 'food')
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
    clearTimeout(timeout)
    gameOverHeader.textContent = "Oh bummer... you bit your tail!"
    gameOverText.textContent = `You have replaced ${totalFoodEaten} legacy connections after ${Number(totalDistanceTravelled/10).toFixed(1)} seconds.`
    if (urlParams.has('timer')) {
      // if timer defined in query param, then disable deaderboard
      document.querySelector("#joinLeaderboard").style.display = "none";
    }
    gameOverDialog.showModal();
  }

  nextSnakeHeadPixel.classList.add("snakeBodyPixel");

  setTimeout(() => {
    nextSnakeHeadPixel.classList.remove("snakeBodyPixel");
  }, snakeLength);

  // Update total distance travelled
  totalDistanceTravelled++;
  // Update in UI:
  document.getElementById("blocksTravelled").innerHTML = Number(totalDistanceTravelled/10).toFixed(1);

  if (currentSnakeHeadPosition == currentFoodPostion) {
    updateFoodTable()
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

const createFoodTable = () => {
  let foodTable = document.getElementById("foodTable");
  AVAILABLE_FOOD_UNIQUE.forEach(element => {
    let row = foodTable.insertRow(-1);
    let c = row.insertCell(0);
    var img = document.createElement('img');
    img.setAttribute('id', element)
    img.src = "images/food/".concat(element).concat(".png");
    img.classList.add("foodTableElement")
    c.appendChild(img);
  });
}

const updateFoodTable = () => {
  let foodTypeEaten = gameBoardPixels[currentFoodPostion].style.backgroundImage.split('/').slice(-1);
  foodTypeEaten= foodTypeEaten[0].split('.')[0];
  let tableElement = document.getElementById(foodTypeEaten);
  tableElement.classList.add("eatenFood");

  let allFoodtypesEaten = true
  for (let el of document.getElementsByClassName('foodTableElement')) {
    if (!el.classList.contains('eatenFood')){
      allFoodtypesEaten = false;
      break;
    }
  }
  if (allFoodtypesEaten) {
    document.body.classList.replace('light-top-gradient', 'topscorer-top-gradient');
  }
}

/// CALL THE FOLLOWING FUNCTIONS TO RUN THE GAME:

// Create game board pixels:
createGameBoardPixels();
createFoodTable();

// Create initial food:
createFood();

const timerExpired = () => {
  clearInterval(moveSnakeInterval);
  gameOverHeader.textContent = "Time's up, well done!"
  gameOverText.textContent = `You have replaced ${totalFoodEaten} legacy connections after ${timeLimit} seconds.`
  if (urlParams.has('timer')) {
    // if timer defined in query param, then disable deaderboard
    document.querySelector("#joinLeaderboard").style.display = "none";
  }
  gameOverDialog.showModal();
}

// Start timer
// var timer
const startTimer = () => {
    update() // defined in countdown.js
    timeout = setTimeout(timerExpired, timeLimit*1000 + 100) // give 100ms more
  // }
}


// Move snake:
var moveSnakeInterval = null
const startGame = () => {
  moveSnakeInterval = setInterval(moveSnake, 100);
  if (timeLimit > 0) {
    // console.log("starting timer ", timeLimit)
    document.getElementById("timer").classList.remove('hide-timer')
    startTimer()
  } else {
    document.getElementById("timer").classList.add('hide-timer')
  }
}


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
// const leftButton = document.getElementById("leftButton");
// const rightButton = document.getElementById("rightButton");
// const upButton = document.getElementById("upButton");
// const downButton = document.getElementById("downButton");

// leftButton.onclick = () => changeDirection(LEFT_DIR);
// rightButton.onclick = () => changeDirection(RIGHT_DIR);
// upButton.onclick = () => changeDirection(UP_DIR);
// downButton.onclick = () => changeDirection(DOWN_DIR);


const openButton = document.querySelector("#openButton");
const restartButton = document.querySelector("#restartButton");
const submitButton = document.querySelector("#submitButton");
const errorLeaderboardText = document.querySelector("#errorLeaderboardText");
const beginButton = document.querySelector("#beginButton");
const gameOverDialog = document.querySelector("#gameOverDialog");
const leaderboardDialog = document.querySelector("#leaderboardDialog");
const gameOverHeader = document.querySelector("#gameOverHeader");
const gameOverText = document.querySelector("#gameOverText");


const createLeaderbaordTable = () => {
  let foodTable = document.getElementById("leaderboardTable");
  leaderboardItems.forEach((element, i) => {
    let row = foodTable.insertRow(-1);
    let rank = row.insertCell(0);
    rank.textContent = i+1;
    rank.style = "font-family: 'AvantGardeBold'; text-align: left;"
    let nicknameCell = row.insertCell(1);
    nicknameCell.textContent = element.nickname;
    nicknameCell.style = "font-family: 'AvantGardeBold'; text-align: left;"
    let pointsCell = row.insertCell(2);
    pointsCell.textContent = element.points;
    pointsCell.style = "font-family: 'AvantGardeBold';"
    let efficiencyCell = row.insertCell(3);
    efficiencyCell.textContent = element.efficiency.toFixed(2);
    let dateCell = row.insertCell(4);
    dateCell.textContent = element.date;
  });
}


if (!urlParams.has('timer')){
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        response.text().then( text => console.error(text))
        // throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      leaderboardItems = data
      // console.log(leaderboardItems.shift())
      timeLimit = leaderboardItems.shift().timer
      if (timeLimit > 0) {
        fields[0].value = timeLimit
        fields[0].size = timeLimit
      }
      
      createLeaderbaordTable()
      leaderboardDialog.showModal()
    })
    .catch(error => {
      console.info("Starting game without a leaderboard");
      startGame()
    });
  } else {
    let t = urlParams.get('timer')
    if (!Number.isNaN(t)) {
      timeLimit = t
    } else console.log(typeof t)
    startGame()
  }

  submitButton.addEventListener("click", (clickEvent) => {
  let name = document.getElementById("nicknameInput").value;
  let email = document.getElementById("emailInput").value;
  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify({
        nickname: name,
        email: email,
        points: totalFoodEaten,
        duration_s: totalDistanceTravelled/10
    })
  })
    .then(response => {
      if (!response.ok) {
        response.text().then( text => console.error(text))
        if (response.status = 400) {
          errorLeaderboardText.textContent = "Invalid input - Allowed are alphanumeric Names with an email address."
          errorLeaderboardText.style.display = "inherit"
        }
        // throw new Error('Network response was not ok');
      } else {
        submitButton.innerHTML = '<span style="color: green">&#10003;</span>' // checkmark
        submitButton.disabled = true
        errorLeaderboardText.style.display = "none"
        restartButton.focus()
      }
    })
    .then(data => {

    })
    .catch(error => {
      console.info("Error when submitting score to leaderboard");
    });
    clickEvent.preventDefault()
});


restartButton.addEventListener("click", () => {
    window.location.reload();
});

restartButton.addEventListener("click", () => {
  window.location.reload();
});

beginButton.addEventListener("click", () => {
  beginButton.disabled = true
  leaderboardDialog.style = "display: none;"
  // timeLimit = 0
  startGame()
});

