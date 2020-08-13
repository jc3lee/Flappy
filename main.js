const bird = document.querySelector(".bird")
const tail = document.querySelector(".tail")
const leftEar = document.querySelector(".left_ear")
const rightEar = document.querySelector(".right_ear")
const birdImg = document.querySelector(".birdImg")
const container = document.querySelector(".container")
const band = document.querySelector(".band")
const mainScoreBoard = document.querySelector(".mainScoreBoard")
const musicBtn = document.querySelector(".musicBtn")
const musicOn = document.querySelector(".on")
const musicOff = document.querySelector(".off")

//music
const gameAudio = new Audio("./assets/sounds/bgm1.mp3")
gameAudio.loop = true
const MUSIC_BTN_COLOR = "rgb(0, 88, 22)"

//menu
const menu = document.querySelector(".menu")
const startBtn = document.querySelector(".startBtn")
const scoreBoard = document.querySelector(".score")
const highscoreBoard = document.querySelector(".highscore")

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

// console.log(INITIAL_WIDTH, INITIAL_HEIGHT)

document.documentElement.style.setProperty("--initialWidth", INITIAL_WIDTH + "px")
document.documentElement.style.setProperty("--initialHeight", INITIAL_HEIGHT + "px")

//tail
let tailDeg

//ears
let leftEarDeg, rightEarDeg

// background band
const BAND_HEIGHT = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--bandHeight").replace("px", ""))
const BAND_WIDTH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--bandWidth").replace("px", ""))
let bandPosition

//bird 
const BIRD_SIZE = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--birdSize").replace("px", ""))

// console.log(BIRD_SIZE)

const JUMP_POWER = BIRD_SIZE * 0.15
const DROP_STEP = INITIAL_HEIGHT > 500 ? 3.1 : 2.8

let isJumping
let currentBirdY

//obstacle 

const MIN_HEIGHT = INITIAL_HEIGHT * 0.12
const MAX_HEIGHT = INITIAL_HEIGHT * 0.5
const OBSTACLE_WIDTH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--obstacleWidth").replace("px", ""))
const BACKGROUND_STEP = 2.5
const CENTER_ZONE_LEFT = INITIAL_WIDTH / 2 - BIRD_SIZE - OBSTACLE_WIDTH
const CENTER_ZONE_RIGHT = INITIAL_WIDTH / 2

const OBSTACLE_HEIGHT_GAP = 3.5 * BIRD_SIZE
const OBSTACLE_PAIR_X = INITIAL_WIDTH + OBSTACLE_WIDTH
let obstaclesArr

//game
const GAME_SPEED = 15
const JUMP_ANIM_DURATION = 250
const OBSTACLE_INTERVAL = 2100
let jumpElapsed, obstacleElapsed, obstacleCounter = 0
let score
let highscore
let gameMovingInterval
let gameEndMovingInterval
let isGameOver
let hasStarted = false

//game over
let failJumped, birdImgDeg
let dropBirdEnded, faceDownBirdEnded

const getRandomObstacleHeight = () => Math.floor(Math.random() * (MAX_HEIGHT - MIN_HEIGHT)) + MIN_HEIGHT

const hasPassed = obstacle => obstacle.x + BACKGROUND_STEP < CENTER_ZONE_RIGHT && !obstacle.passedBird

const hasCollided = obstacle => currentBirdY < obstacle.gap - 5 || currentBirdY + BIRD_SIZE > obstacle.gap + OBSTACLE_HEIGHT_GAP
// const hasCollided = () => false

const isCurrentObstacle = obstacle => obstacle.x < CENTER_ZONE_RIGHT && obstacle.x > CENTER_ZONE_LEFT

//initiate game

const initGame = () => {
  //tail
  tailDeg = 0
  //ears
  leftEarDeg = 0
  rightEarDeg = 0
  // background band
  bandPosition = 0
  //bird
  isJumping = false
  currentBirdY = INITIAL_HEIGHT / 2 - BIRD_SIZE - BAND_HEIGHT
  //obstacle 
  obstaclesArr = []
  //game
  jumpElapsed = 0
  obstacleElapsed = OBSTACLE_INTERVAL
  score = 0
  highscore = localStorage.getItem("flappy_highscore") || 0
  gameMovingInterval = ""
  gameEndMovingInterval = ""
  isGameOver = false
  //game over
  failJumped = false
  birdImgDeg = 0
  dropBirdEnded = false
  faceDownBirdEnded = false
  //init bird position & rotation
  bird.style.transform = `translate3d(0, ${currentBirdY}px, 0)`
  birdImg.style.transform = `rotate3d(0, 0, 1, 0deg) scale3d(2, 2, 1)`
  //reset score
  mainScoreBoard.innerHTML = score

  //remove all obstacles
  const obstaclePairs = document.querySelectorAll(".pair")
  if (obstaclePairs.length > 0) {
    obstaclePairs.forEach(obstaclePair => container.removeChild(obstaclePair))
  }

}

initGame()

const handleKeyDown = e => {
  if (e.keyCode === 32) {
    jumpBird()
  }
}
const jumpBird = () => {
  if (!hasStarted) return
  isJumping = true
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
  if (jumpElapsed > JUMP_ANIM_DURATION * 0.64) {
    currentBirdY -= JUMP_POWER * 1.9
  } else if (jumpElapsed > JUMP_ANIM_DURATION * 0.4) {
    currentBirdY -= JUMP_POWER / 3
  } else {
    currentBirdY += DROP_STEP
  }
}

const addObstacle = () => {
  obstacleElapsed -= GAME_SPEED
  if (obstacleElapsed <= 0) {
    // console.log("here")
    obstacleElapsed = OBSTACLE_INTERVAL
    obstacleCounter++
    getObstaclePair()
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

  obstaclePair.style.transform = `translate3d(${OBSTACLE_PAIR_X}px, 0, 0)`

  container.appendChild(obstaclePair)

  //add x and gap
  obstaclesArr.push({ x: OBSTACLE_PAIR_X, gap: obStacleTopHeight, passedBird: false })
}

const moveObstacles = () => {
  for (obstacle of obstaclesArr) {
    obstacle.x -= BACKGROUND_STEP
    if (hasPassed(obstacle)) {
      //change passedBird to true and add score
      obstacle.passedBird = true
      scoreUp()
    }
    if (isCurrentObstacle(obstacle)) {
      //obstacle inside the center zone
      if (hasCollided(obstacle)) {
        //collision
        gameOver()
        return
      }
    }
  }
}

const moveTailAndEarsOnJump = () => {
  if (jumpElapsed > JUMP_ANIM_DURATION * 0.2) {
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
  if (bandPosition <= -BAND_WIDTH / 4) bandPosition = 0
}

const renderGame = () => {

  //move bird
  bird.style.transform = `translate3d(0, ${currentBirdY}px, 0)`

  //check if need to remove first pair
  if (obstaclesArr[0] && obstaclesArr[0].x < -OBSTACLE_WIDTH) {
    //remove first item
    const firstPair = document.querySelector(".pair")
    container.removeChild(firstPair)
    obstaclesArr.shift()
    // console.log("removed")
    return
  }

  //move obstacles
  const obstaclePairs = document.querySelectorAll(".pair")
  for (let i = 0; i < obstaclePairs.length; i++) {
    obstaclePairs[i].style.transform = `translate3d(${obstaclesArr[i].x}px, 0, 0)`
  }

  //move tail
  tail.style.transform = `rotate3d(0, 0, 1, ${tailDeg}deg)`

  //move left ear
  leftEar.style.transform = `rotate3d(0, 0, 1, ${leftEarDeg}deg)`

  //move right ear
  rightEar.style.transform = `rotate3d(0, 0, 1, ${rightEarDeg}deg)`

  //rotate body while preserving scale
  // birdImg.style.transform = `rotate3d(0, 0, 1, ${birdImgDeg}deg) scale(2, 2, 1)`

  //move background band
  band.style.transform = `translate3d(${bandPosition}px, 0, 0)`

}

const animGame = () => {
  if (isJumping) jumpElapsed = JUMP_ANIM_DURATION

  // rotateBird()
  addObstacle()
  moveBird()
  moveObstacles()
  moveTailAndEarsOnJump()
  moveBackgroundBand()
  renderGame()

  if (jumpElapsed > 0) jumpElapsed -= GAME_SPEED

  //remove jump if was jumping
  if (isJumping) isJumping = false
}

const scoreUp = () => {
  score++
  mainScoreBoard.innerHTML = score
  if (score > highscore) {
    highscore = score
    localStorage.setItem("flappy_highscore", highscore)
  }
  // console.log("score", score)
}

const gameOver = () => {
  isGameOver = true
  // console.log("game over")
  //game over clear gameMovingInterval, set gameEndMovingInterval
  clearInterval(gameMovingInterval)
  if (gameEndMovingInterval === "") {
    gameEndMovingInterval = setInterval(() => {
      animGameOver()
    }, GAME_SPEED)
  }
  //show menu
  showMenu()
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
  bird.style.transform = `translate3d(0, ${currentBirdY}px, 0)`
  //rotation should be handle here too
  birdImg.style.transform = `rotate3d(0, 0, 1,  ${birdImgDeg}deg) scale3d(2, 2, 1)`
}

const animGameOver = () => {

  dropBird()
  faceDownBird()
  renderEndGame()

  if (dropBirdEnded && faceDownBirdEnded) {
    // console.log("everything ended")
    hasStarted = false
    clearInterval(gameEndMovingInterval)
  }
}

//show menu

const showMenu = () => {
  updateScoreBoard()
  menu.classList.add("showMenu")
}

//hide menu

const hideMenu = () => {
  updateScoreBoard()
  menu.classList.remove("showMenu")
}

//update
const updateScoreBoard = () => {
  highscore = localStorage.getItem("flappy_highscore") || 0
  scoreBoard.innerHTML = score
  highscoreBoard.innerHTML = highscore
}

//start
const handleStartClick = e => {
  e.stopPropagation()
  if (hasStarted) return
  hasStarted = true
  hideMenu()
  showBird()
  //start game
  startGame()
}

const showBird = () => {
  bird.style.visibility = "visible"
}

const startGame = () => {
  initGame()
  if (gameMovingInterval === "") {
    gameMovingInterval = setInterval(() => {
      animGame()
    }, GAME_SPEED)
  }
}

const tryToStartMusic = () => {
  gameAudio.currentTime = 0
  gameAudio.play()
    .then(() => {
      musicOn.style.fill = MUSIC_BTN_COLOR
      musicOff.style.fill = "none"
    })
    .catch(() => {
      musicOn.style.fill = "none"
      musicOff.style.fill = MUSIC_BTN_COLOR
    })
}

const toggleMusic = () => {
  if (gameAudio.paused) {
    // console.log("paused")
    // console.log("play it")
    gameAudio.play()
    musicOn.style.fill = MUSIC_BTN_COLOR
    musicOff.style.fill = "none"
  } else {
    // console.log("not paused")
    // console.log("paused it")
    gameAudio.pause()
    musicOn.style.fill = "none"
    musicOff.style.fill = MUSIC_BTN_COLOR
  }
  // console.log("time", gameAudio.currentTime)
}


musicBtn.addEventListener("click", toggleMusic)
startBtn.addEventListener("click", handleStartClick)
document.addEventListener("click", jumpBird)
document.addEventListener("keydown", handleKeyDown)
gameAudio.addEventListener("loadedmetadata", tryToStartMusic)

//hide bird
bird.style.visibility = "hidden"
showMenu()
