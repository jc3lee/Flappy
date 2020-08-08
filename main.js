const bird = document.querySelector(".bird")
const tail = document.querySelector(".tail")
const leftEar = document.querySelector(".left_ear")
const rightEar = document.querySelector(".right_ear")
const birdImg = document.querySelector(".birdImg")
const container = document.querySelector(".container")
const band = document.querySelector(".band")
const mainScoreBoard = document.querySelector(".mainScoreBoard")

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

//adding a responsive  4 : 3 design
let INITIAL_WIDTH, INITIAL_HEIGHT
if (screenWidth < screenHeight) {
  INITIAL_WIDTH = screenWidth
  INITIAL_HEIGHT = INITIAL_WIDTH * 4 / 3
} else {
  INITIAL_HEIGHT = screenHeight
  INITIAL_WIDTH = INITIAL_HEIGHT * 3 / 4
}
//prevent ultra large resolution, ipad pro for example
if (INITIAL_HEIGHT > 600) {
  INITIAL_HEIGHT = 600
  INITIAL_WIDTH = INITIAL_HEIGHT * 3 / 4
}

console.log(INITIAL_WIDTH, INITIAL_HEIGHT)
document.documentElement.style.setProperty("--initialWidth", INITIAL_WIDTH + "px")
document.documentElement.style.setProperty("--initialHeight", INITIAL_HEIGHT + "px")

//bird 
const BIRD_SIZE = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--birdSize").replace("px", ""))

console.log(BIRD_SIZE)

const JUMP_POWER = BIRD_SIZE * 0.22

let isJumping = false
let currentBirdY = INITIAL_HEIGHT / 2 - BIRD_SIZE
let DROP_STEP = INITIAL_HEIGHT > 500 ? 3.25 : 3

//obstacle 

const MIN_HEIGHT = INITIAL_HEIGHT * 0.2
const MAX_HEIGHT = INITIAL_HEIGHT * 0.5
const OBSTACLE_WIDTH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--obstacleWidth").replace("px", ""))
const BACKGROUND_STEP = 2.5
const CENTER_ZONE_LEFT = INITIAL_WIDTH / 2 - BIRD_SIZE - OBSTACLE_WIDTH
const CENTER_ZONE_RIGHT = INITIAL_WIDTH / 2

const OBSTACLE_HEIGHT_GAP = 3.5 * BIRD_SIZE
let obstaclePairLeft = INITIAL_WIDTH
const obstaclesArr = []

//tail
let tailDeg = 0
//ears
let leftEarDeg = 0, rightEarDeg = 0

// background band
const BAND_HEIGHT = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--bandHeight").replace("px", ""))
const BAND_WIDTH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--bandWidth").replace("px", ""))
let bandPosition = 0

//game
const GAME_SPEED = 15
const JUMP_ANIM_DURATION = 500
const OBSTACLE_INTERVAL = 2000
let jumpElapsed = 0, obstacleElapsed = OBSTACLE_INTERVAL
let score = 0
let highscore = 0
let gameMovingInterval = ""
let gameEndMovingInterval = ""
let isGameOver = false

//game over
let failJumped = false, birdImgDeg = 0
let dropBirdEnded = false, faceDownBirdEnded = false

const getRandomObstacleHeight = () => Math.floor(Math.random() * (MAX_HEIGHT - MIN_HEIGHT)) + MIN_HEIGHT

const hasCollided = (gap) => currentBirdY < gap || currentBirdY + BIRD_SIZE > gap + OBSTACLE_HEIGHT_GAP

const isCurrentObstacle = obstacleLeft => obstacleLeft < CENTER_ZONE_RIGHT && obstacleLeft > CENTER_ZONE_LEFT

//initiate game

gameMovingInterval = setInterval(() => {
  animGame()
}, GAME_SPEED)

document.addEventListener("click", jumpBird)

function jumpBird() {
  isJumping = true
  //try animating tail
}

const rotateBird = () => {
  if (isJumping) birdImgDeg = -5
  if (birdImgDeg >= 90) {
    birdImgDeg = 90
    return
  }
  birdImgDeg += 0.5
}

const moveBird = () => {
  if (currentBirdY > INITIAL_HEIGHT - BIRD_SIZE - BAND_HEIGHT) {
    gameOver()
    return
  }
  if (jumpElapsed > JUMP_ANIM_DURATION * 0.85) {
    currentBirdY -= JUMP_POWER * 1.5
  } else if (jumpElapsed > JUMP_ANIM_DURATION * 0.65) {
    currentBirdY -= JUMP_POWER / 3
  } else {
    currentBirdY += DROP_STEP
  }
}

const addObstacle = () => {
  obstacleElapsed -= 15
  if (obstacleElapsed <= 0) {
    getObstaclePair()
    obstacleElapsed = OBSTACLE_INTERVAL
  }
}

const getObstaclePair = () => {
  const obstacleTop = document.createElement("div")
  const obstacleBtm = document.createElement("div")
  const obstaclePair = document.createElement("div")

  obstacleTop.classList.add("obstacleTop")
  obstacleBtm.classList.add("obstacleBtm")
  obstaclePair.classList.add("pair")

  const obStacleTopHeight = getRandomObstacleHeight()
  const obStacleBtmHeight = INITIAL_HEIGHT - obStacleTopHeight - OBSTACLE_HEIGHT_GAP

  obstacleTop.style.height = obStacleTopHeight + "px"
  obstacleBtm.style.height = obStacleBtmHeight + "px"

  obstaclePair.appendChild(obstacleTop)
  obstaclePair.appendChild(obstacleBtm)

  obstaclePair.style.left = obstaclePairLeft + "px"

  container.appendChild(obstaclePair)

  //add left and gap
  obstaclesArr.push({ left: obstaclePairLeft, gap: obStacleTopHeight, passedBird: false })
}

const moveObstacles = () => {
  for (let i = obstaclesArr.length - 1; i >= 0; i--) {
    const obstacleLeft = obstaclesArr[i].left - BACKGROUND_STEP
    obstaclesArr[i].left = obstacleLeft
    if (obstacleLeft + BACKGROUND_STEP < CENTER_ZONE_RIGHT && !obstaclesArr[i].passedBird) {
      //change passedBird to true and add score
      obstaclesArr[i].passedBird = true
      scoreUp()
    }
    if (isCurrentObstacle(obstacleLeft)) {
      //obstacle inside the center zone
      if (hasCollided(obstaclesArr[i].gap)) {
        //collision
        gameOver()
        return
      }
    }
  }
}

const moveTailAndEarsOnJump = () => {
  if (jumpElapsed > JUMP_ANIM_DURATION * 2 / 4) {
    tailDeg = -70
    leftEarDeg = -25
    rightEarDeg = -25
    tailDeg = -70
    leftEarDeg = -25
    rightEarDeg = -25
  } else {
    tailDeg = 0
    leftEarDeg = 0
    rightEarDeg = 0
  }
}

const moveBackgroundBand = () => {
  //background 
  bandPosition -= BACKGROUND_STEP
  if (bandPosition <= -BAND_WIDTH) bandPosition = 0
}

const renderGame = () => {

  //move bird
  bird.style.transform = `translateY(${currentBirdY}px)`
  //check if need to remove first pair
  if (obstaclesArr[0] && obstaclesArr[0].left < -OBSTACLE_WIDTH) {
    //remove first item
    const firstPair = document.querySelector(".pair")
    container.removeChild(firstPair)
    obstaclesArr.shift()
    console.log("removed")
    return
  }

  //move obstacles
  const obstaclePairs = document.querySelectorAll(".pair")
  for (let i = 0; i < obstaclePairs.length; i++) {
    obstaclePairs[i].style.left = obstaclesArr[i].left + "px"
  }

  //move tail
  tail.style.transform = `rotate(${tailDeg}deg)`
  //move left ear
  leftEar.style.transform = `rotate(${leftEarDeg}deg)`
  //move right ear
  rightEar.style.transform = `rotate(${rightEarDeg}deg)`
  //rotate body while preserving scale
  // birdImg.style.transform = `rotate(${birdImgDeg}deg) scale(2)`
  //move background band
  band.style.backgroundPosition = `${bandPosition}px 0`
}

const animGame = () => {

  if (isJumping) jumpElapsed = JUMP_ANIM_DURATION
  jumpElapsed -= 15

  // rotateBird()
  addObstacle()
  moveBird()
  moveObstacles()
  moveTailAndEarsOnJump()
  moveBackgroundBand()
  renderGame()
  //remove jump if was jumping
  if (isJumping) isJumping = false
  // if (!isGameOver) {
  //   requestAnimationFrame(animGame)
  // } else {
  //   requestAnimationFrame(animGameOver)
  // }
}

const scoreUp = () => {
  score++
  mainScoreBoard.innerHTML = score
  console.log("score", score)
}

const gameOver = () => {
  isGameOver = true
  console.log("game over")
  document.removeEventListener("click", jumpBird)
  clearInterval(gameMovingInterval)
  //
  gameEndMovingInterval = setInterval(() => {
    animGameOver()
  }, GAME_SPEED)
}

const dropBird = () => {
  if (dropBirdEnded) return
  if (currentBirdY > INITIAL_HEIGHT - BIRD_SIZE * 1.1 - BAND_HEIGHT) {
    currentBirdY = INITIAL_HEIGHT - BIRD_SIZE * 1.1 - BAND_HEIGHT
    dropBirdEnded = true
    return
  }
  if (!failJumped) {
    failJumped = true
    currentBirdY -= JUMP_POWER * 10
  }
  else {
    currentBirdY += DROP_STEP * 5
  }
}

const faceDownBird = () => {
  if (faceDownBirdEnded) return
  if (birdImgDeg > 90) {
    birdImgDeg = 90
    faceDownBirdEnded = true
    return
  }
  birdImgDeg += 6.75
}

const renderEndGame = () => {
  //move bird
  bird.style.transform = `translateY(${currentBirdY}px)`
  //rotation should be handle here too
  birdImg.style.transform = `rotate(${birdImgDeg}deg) scale(2)`
}

const animGameOver = () => {

  dropBird()
  faceDownBird()
  renderEndGame()

  if (dropBirdEnded && faceDownBirdEnded) {
    console.log("everything ended")
    clearInterval(gameEndMovingInterval)
  } else {
    // requestAnimationFrame(animGameOver)
  }
}

// requestAnimationFrame(animGame)
