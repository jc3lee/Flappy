const bird = document.querySelector(".bird")
const birdImg = document.querySelector(".birdImg")
const container = document.querySelector(".container")

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

let INITIAL_WIDTH, INITIAL_HEIGHT
if (screenWidth < screenHeight) {
  INITIAL_WIDTH = screenWidth
  INITIAL_HEIGHT = INITIAL_WIDTH * 4 / 3
} else {
  INITIAL_HEIGHT = screenHeight
  INITIAL_WIDTH = INITIAL_HEIGHT * 3 / 4
}

document.documentElement.style.setProperty("--initialWidth", INITIAL_WIDTH + "px")
document.documentElement.style.setProperty("--initialHeight", INITIAL_HEIGHT + "px")
//bird 
console.log("initial width", INITIAL_WIDTH)
console.log("initial height", INITIAL_HEIGHT)

const BIRD_SIZE = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--birdSize").replace("px", ""))
const JUMP_POWER = BIRD_SIZE * 1.75

console.log(BIRD_SIZE)

let isJumping = false
let currentBirdY = INITIAL_HEIGHT / 2 - BIRD_SIZE
let drop_step = 2.5

//obstacle 

const MIN_HEIGHT = INITIAL_HEIGHT * 1 / 5
const MAX_HEIGHT = INITIAL_HEIGHT * 3 / 5
const OBSTACLE_WIDTH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--obstacleWidth").replace("px", ""))
const OBSTACLE_STEP = 2
const CENTER_ZONE_LEFT = INITIAL_WIDTH / 2 - BIRD_SIZE - OBSTACLE_WIDTH
const CENTER_ZONE_RIGHT = INITIAL_WIDTH / 2

const OBSTACLE_HEIGHT_GAP = 3.5 * BIRD_SIZE
let obstaclePairLeft = INITIAL_WIDTH
let addObstacleInterval = ""
const obstaclesArr = []

//game
let startTime, elapsed, obstacleIndex = 0
let score = 0
let highscore = 0
let gameMovingInterval = ""
let isGameOver = false

const getRandomObstacleHeight = () => Math.floor(Math.random() * (MAX_HEIGHT - MIN_HEIGHT)) + MIN_HEIGHT

const jumpBird = () => {
  isJumping = true
}

const moveBird = () => {
  if (currentBirdY > INITIAL_HEIGHT - BIRD_SIZE) {
    gameOver()
    return
  }
  if (isJumping) {
    isJumping = false
    currentBirdY -= JUMP_POWER
  } else {
    currentBirdY += drop_step
  }
  bird.style.transform = `translateY(${currentBirdY}px)`
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
  const obstaclePairs = document.querySelectorAll(".pair")
  for (let i = obstaclePairs.length - 1; i >= 0; i--) {
    const obstacleLeft = obstaclesArr[i].left - OBSTACLE_STEP
    obstaclesArr[i].left = obstacleLeft
    if (obstacleLeft < -OBSTACLE_WIDTH) {
      //remove obstaclePair 
      container.removeChild(obstaclePairs[i])
      //remove obstacleArr
      obstaclesArr.splice(i, 1)
      return
    }
    obstaclePairs[i].style.left = obstacleLeft + "px"
    if (obstacleLeft + OBSTACLE_STEP < CENTER_ZONE_RIGHT && !obstaclesArr[i].passedBird) {
      //change passedBird to true and add score
      obstaclesArr[i].passedBird = true
      scoreUp()
    }
    if (obstacleLeft < CENTER_ZONE_RIGHT && obstacleLeft > CENTER_ZONE_LEFT) {
      //obstacle inside the center zone
      if (currentBirdY < obstaclesArr[i].gap || currentBirdY + BIRD_SIZE > obstaclesArr[i].gap + OBSTACLE_HEIGHT_GAP) {
        //collision
        gameOver()
        return
      }
    }
  }
}

const scoreUp = () => {
  score++
  console.log("score", score)
}

const gameOver = () => {
  isGameOver = true
  console.log("game over")
  //birdImg anim
  birdImg.classList.add("gameOverBird")
  isJumping = true
  drop_step *= 5
  requestAnimationFrame(animEndGame)
}

function animGame(timestamp) {
  moveBird()
  moveObstacles()
  if (startTime === undefined)
    startTime = timestamp
  elapsed = timestamp - startTime
  if (elapsed > 2500 * obstacleIndex) {
    getObstaclePair()
    obstacleIndex++
  }
  if (!isGameOver) {
    requestAnimationFrame(animGame)
  }
}

function animEndGame() {
  moveBird()
  if (currentBirdY < INITIAL_HEIGHT - BIRD_SIZE) {
    requestAnimationFrame(animEndGame)
  }
}

requestAnimationFrame(animGame)

document.addEventListener("click", jumpBird)


