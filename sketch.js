/* commentary 
This snooker game uses a fully mouse-based cue control system to provide intuitive and accessible interaction. Players can drag the cue ball to reposition it when allowed (`isDraggingcueBalll` and `iscueBalllInPlay`), and shoot by clicking and dragging away from the cue ball. The drag direction and distance determine the direction and magnitude of force applied using `Body.applyForce()` from Matter.js. A visual force line (`drawForceLinee`) helps players aim and control power. Keyboard input was deliberately avoided to ensure a smoother, more natural interaction model that aligns with how users expect to play physics-based games. At the start of the game, players are prompted to enter their initials, which are displayed dynamically during each turn to personalize the experience (`playerTurnDisplay`). Several game modes are included: `'starting'` for the standard triangle formation, `'randomReds'` and `'randomAll'` for unpredictable setups, and `'straightLine'` for practice. Players can toggle between these using keys 1–4, with each reset handled through `resetBalls()`. A unique visual extension is the flame trail added to the cue ball using `drawFlameeTrail()`. It uses `cueBalllHistory` and `lerpColor()` to create a red-yellow trail that visually intensifies with movement, enhancing gameplay feedback and immersion. Ball-pocket interactions are handled in `checkAndPotBalls()` with animations using `pockettAnimation()`. Coloured balls reset to their original positions, red balls are removed from the game, and if the cue ball is potted, it is repositioned using `resetcueBalllPosition()`. The game also detects rule violations such as potting the same coloured ball consecutively via `checkAndUpdateConsecutivee()`. Visual elements like the live player turn display, power bar (`drawPowerBar()`), and real-time collision messages (`updatesMessagess()`) enhance the user experience. Overall, this game balances realistic physics with arcade-style visuals, offering an engaging, polished, and rule-driven snooker simulation with immersive feedback and unique extensions.
*/

// --- Matter.js Setup ---
var Engine = Matter.Engine;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Body = Matter.Body;
var Events = Matter.Events;
// --- Global Game Variables ---
var engine;
var cueBalll;
var walls = [];
var cushions = [];
var balls = [];
var colouredballs = [];
var pocketts = [];

var mode = 'starting';
var ballLocations = [];

var tableLengthh = 1000;
var tableWidthh = tableLengthh / 2;
var canvasCenterrX = 600;
var canvasCenterrY = 400;

var ballDiameterr = tableLengthh / 36;
var pockettSizee = (ballDiameterr * 2) / 2;
var tableWidthhOffsett = 20;

var baulkLineeX = (tableLengthh / 5) + 150;
var baulkLineToppY = canvasCenterrY - (tableWidthh / 2) + 10;
var baulkLineBottommY = canvasCenterrY + (tableWidthh / 2) - 10;
var baulkRadiuss = tableWidthh * 0.16;

var redBallLocationss = [];
var coloredBallLocationsss = [];
var appliedForcee = { x: 0, y: 0 };
var level = 1;

let playerNames = ["Player 1", "Player 2"];
let currentPlayer = 0;
let gameStarted = false;
let scoreboardLayer;
let messagesContainer;
let iscueBalllInPlay = true;

let dragStart = null;

let currentPower = 0;
const maxPower = 1.5; 

// --- Setup Helper Functions ---
function updatesMessagess(message) {
  console.log("Updating messages: " + message);
}

function drawHalffSemicircle(x, y, radius, startAngle, endAngle) {
  noFill();
  stroke(255);
  strokeWeight(2);
  arc(x, y, radius * 2, radius * 2, startAngle, endAngle);
}

function setup() {
  createCanvas(1200, 900);
  engine = Engine.create();
  engine.world.gravity.y = 0;

  // UI layers
  scoreboardLayer = createGraphics(width, height);
  scoreboardLayer.pixelDensity(1);
  imageMode(CENTER);

  messagesContainer = createDiv();
  messagesContainer.position(10, height + 20);
  messagesContainer.style('color', '#fff');

  const startBtn = document.getElementById("startGameButton");
  startBtn.onclick = startGame;
}

function startGame() {
  const name1 = document.getElementById("player1").value.trim();
  const name2 = document.getElementById("player2").value.trim();

  if (!name1 || !name2 || name1.toLowerCase() === name2.toLowerCase()) {
    alert("Please enter two different initials for both players.");
    return;
  }

  gameStarted = true;
  playerNames = [name1, name2];
  currentPlayer = 0;

  document.getElementById("playerNameEntry").style.display = "none";
  document.getElementById("playerInfo").style.display = "block";
  document.getElementById("playerTurnDisplay").innerText = `${playerNames[currentPlayer]}'s Turn`;

  setupwallss();
  generateCueeBall();
  generateeBalls();
  generatecolouredballs();
  initCollisionDetection();
  updatesMessagess("Cue Ball is in Play");
}

function initCollisionDetection() {
  Events.on(engine, 'collisionStart', function(event) {
    var pairs = event.pairs;
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];

      if (pair.bodyA === cueBalll || pair.bodyB === cueBalll) {
        handlecueBallllCollision(pair);
      } else {
        handleOtherBallCollision(pair);
      }
    }
  });
}

function handlecueBallllCollision(pair) {
  var bodyA = pair.bodyA;
  var bodyB = pair.bodyB;

  if (cushions.includes(bodyA) || cushions.includes(bodyB)) {
    updatesMessagess("Cue ball collided with cushion");
  }
  if (colouredballs.includes(bodyA) || colouredballs.includes(bodyB)) {
    updatesMessagess("Cue ball collided with colored ball");
  }
  if (balls.includes(bodyA) || balls.includes(bodyB)) {
    updatesMessagess("Cue ball collided with red ball");
  }
  if (pocketts.includes(bodyA) || pocketts.includes(bodyB)) {
    updatesMessagess("Cue ball collided with pockett");
  }
}

function handleOtherBallCollision(pair) {
  var bodyA = pair.bodyA;
  var bodyB = pair.bodyB;

  if ((colouredballs.includes(bodyA) || colouredballs.includes(bodyB)) &&
      (colouredballs.includes(bodyA) || colouredballs.includes(bodyB))) {
  }

  if ((balls.includes(bodyA) || balls.includes(bodyB)) &&
      (balls.includes(bodyA) || balls.includes(bodyB))) {
    // Placeholder: red-red collision
  }

  if ((colouredballs.includes(bodyA) || colouredballs.includes(bodyB) || balls.includes(bodyA) || balls.includes(bodyB)) &&
      (cushions.includes(bodyA) || cushions.includes(bodyB))) {
    // Placeholder: ball-cushion collision
  }

  if ((colouredballs.includes(bodyA) || colouredballs.includes(bodyB) || balls.includes(bodyA) || balls.includes(bodyB)) &&
      (pocketts.includes(bodyA) || pocketts.includes(bodyB))) {
    // Placeholder: ball-pockett collision
  }
}

function draw() {
  background(5, 61, 5); // Green table

  if (!gameStarted) return;

  Engine.update(engine);

  drawallss();
  drawForceLinee();
  drawpockettss();
  checkpocketttCollisionn();
  drawBallss();
  drawCueeBall();
  drawcolouredballs();
  drawPowerBar();

  let velocity = cueBalll.velocity;
  currentPower = constrain(Math.sqrt(velocity.x ** 2 + velocity.y ** 2), 0, maxPower);
    
if (!iscueBalllInPlay) {
  const speed = Math.sqrt(cueBalll.velocity.x ** 2 + cueBalll.velocity.y ** 2);
  if (speed < 0.01) {
    iscueBalllInPlay = true; 
    currentPlayer = (currentPlayer + 1) % 2;
    document.getElementById("playerTurnDisplay").innerText = `${playerNames[currentPlayer]}'s Turn`;
    currentPower = 0;
  }
}
}

function createRoundedRectanglee(x, y, w, h, radius, options) {
  return Bodies.rectangle(x, y, w, h, {
    ...options,
    chamfer: { radius: radius }
  });
}

function drawPowerBar() {
  const barWidth = 30;
  const barHeight = 150;
  const margin = 20;

  const x = width - barWidth - margin;
  const y = height - barHeight - margin;

  // Outer container
  stroke(0);
  strokeWeight(2);
  fill(180);
  rect(x, y, barWidth, barHeight);

  // Filled force level (green)
  const filled = map(currentPower, 0, maxPower, 0, barHeight);
  noStroke();
  fill(0, 255, 0);
  rect(x, y + (barHeight - filled), barWidth, filled);

  // Text: Force value
  fill(255);
  textSize(14);
  textAlign(CENTER, CENTER);
  text(`Force: ${currentPower.toFixed(2)}`, x + barWidth / 2, y + barHeight + 15);

  // Optional: ↑ ↓ instructions
  textSize(12);
  text("↑ Increase  ↓ Decrease", x + barWidth / 2, y + barHeight + 35);
}

function setupwallss() {
    var wallOptionss = {
    isStatic: true,
    restitution: 1,
    collisionFilter: {
      category: 0x0001,
      mask: 0xFFFFFFFF,
    },
  };

  var bottommWall = createRoundedRectanglee(canvasCenterrX, canvasCenterrY + tableWidthh / 2 + tableWidthhOffsett / 2, tableLengthh+40, 20, 10, wallOptionss);
  var toppwall = createRoundedRectanglee(canvasCenterrX, canvasCenterrY - tableWidthh / 2 - tableWidthhOffsett / 2, tableLengthh+40, 20, 10, wallOptionss);
  var lefttwall = createRoundedRectanglee(canvasCenterrX - (tableLengthh / 2) - tableWidthhOffsett / 2, canvasCenterrY, 20, tableWidthh + tableWidthhOffsett+20, 10, wallOptionss);
  var righttwall = createRoundedRectanglee(canvasCenterrX + (tableLengthh / 2) + tableWidthhOffsett / 2, canvasCenterrY, 20, tableWidthh + tableWidthhOffsett+20, 10, wallOptionss);

  var pockettoptionss = {
    isStatic: true,
    ispockett: true,
    friction: 0,
    restitution: 1,
    isSensor: true,
  };

  var pockett01 = Bodies.circle(canvasCenterrX - (tableLengthh / 2)+10, canvasCenterrY - (tableWidthh / 2)+10, pockettSizee, pockettoptionss);
  var pockett02 = Bodies.circle(canvasCenterrX + (tableLengthh / 2)-10, canvasCenterrY - (tableWidthh / 2)+10, pockettSizee, pockettoptionss);
  var pockett03 = Bodies.circle(canvasCenterrX - (tableLengthh / 2)+10, canvasCenterrY + (tableWidthh / 2)-10, pockettSizee, pockettoptionss);
  var pockett04 = Bodies.circle(canvasCenterrX + (tableLengthh / 2)-10, canvasCenterrY + (tableWidthh / 2)-10, pockettSizee, pockettoptionss);
  var pockett05 = Bodies.circle(canvasCenterrX, canvasCenterrY - (tableWidthh / 2)+10, pockettSizee, pockettoptionss);
  var pockett06 = Bodies.circle(canvasCenterrX, canvasCenterrY + (tableWidthh / 2)-10, pockettSizee, pockettoptionss);

  // Cushions
  var cushionOptions = {
    isStatic: true,
    restitution: 1,
    collisionFilter: {
      category: 0x0001,
      mask: 0xFFFFFFFF,
    },
  };

  var cushionntop = createRoundedRectanglee(canvasCenterrX, canvasCenterrY - (tableWidthh / 2), tableLengthh - tableWidthhOffsett, 20, 10, cushionOptions);
  var cushionnbottom = createRoundedRectanglee(canvasCenterrX, canvasCenterrY + (tableWidthh / 2), tableLengthh - tableWidthhOffsett, 20, 10, cushionOptions);
  var cushionnleft = createRoundedRectanglee(canvasCenterrX - (tableLengthh / 2), canvasCenterrY, 20, tableWidthh - tableWidthhOffsett-10, 10, cushionOptions);
  var cushionnright = createRoundedRectanglee(canvasCenterrX + (tableLengthh / 2), canvasCenterrY, 20, tableWidthh - tableWidthhOffsett-10, 10, cushionOptions);

  walls.push(toppwall, bottommWall, lefttwall, righttwall);
  pocketts.push(pockett01, pockett02, pockett03, pockett04, pockett05, pockett06);
  cushions.push(cushionntop, cushionnbottom, cushionnleft, cushionnright);
    
  World.add(engine.world, walls);
  World.add(engine.world, pocketts);
  World.add(engine.world,cushions);
}

function drawallss() {

    fill(0, 100, 0); 

  for (i = 0; i < cushions.length; i++) {
    drawwVerticess(cushions[i].vertices);
  }

    push();
    noStroke();
  fill(139, 69, 19); 
  for (i = 0; i < walls.length; i++) {
    drawwVerticess(walls[i].vertices);
  }
    pop();
  stroke(255);
  strokeWeight(2);
  line(baulkLineeX, baulkLineToppY, baulkLineeX, baulkLineBottommY);

  rotate(-HALF_PI);
  drawHalffSemicircle(-canvasCenterrY, baulkLineeX, baulkRadiuss, PI, 0);

  rotate(HALF_PI);
}

function drawpockettss() {
  fill(0);
  for (var i = 0; i < pocketts.length; i++) {
    drawwVerticess(pocketts[i].vertices);
  }
}

function generateCueeBall() {
    cueBalll = Bodies.circle(baulkLineeX-100, canvasCenterrY, ballDiameterr / 2, { restitution: 1, friction: 0.2 });

    cueBalll.iscueBalll = true;

    World.add(engine.world, [cueBalll]);
}

var cueBalllHistory = [];

function drawCueeBall() {
    push();
    drawFlameeTrail();
    pop();
    fill(255);
    drawwVerticess(cueBalll.vertices);
    
     drawFlameeTrail();
}

function drawFlameeTrail() {
  var traillengthh = 60; 

  cueBalllHistory.push({ x: cueBalll.position.x, y: cueBalll.position.y });

  if (cueBalllHistory.length > traillengthh) {
    cueBalllHistory.shift();
  }
    push();

    noFill();
  beginShape();
  for (var i = 0; i < cueBalllHistory.length; i++) {
    var flameColour = lerpColor(color(255, 255, 0), color(255, 0, 0), i / traillengthh);
    stroke(flameColour);
    strokeWeight(map(i, 0, traillengthh, 5, 1)); 
    vertex(cueBalllHistory[i].x, cueBalllHistory[i].y);
  }
  endShape();
    pop();
}

function drawCueeBallTrail() {
  var traillengthh = 10;  

  cueBalllHistory.push({ x: cueBalll.position.x, y: cueBalll.position.y });

  if (cueBalllHistory.length > traillengthh) {
    cueBalllHistory.shift(); 
  }


  noFill();
  stroke(255, 100);
  beginShape();
  for (var i = 0; i < cueBalllHistory.length; i++) {
    vertex(cueBalllHistory[i].x, cueBalllHistory[i].y);
  }
  endShape();
}

var ballRadiuss = ballDiameterr/2;

function generateeBalls() {
  var ballSepp = ballDiameterr * 0.95; 
  redBallLocationss = [];

  if (mode === 'starting') {
    let startX = width * 0.7;
    let startY = canvasCenterrY;

    let i = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col <= row; col++) {
        if (i >= 15) break;
        let x = startX + row * ballSepp;
        let y = startY - (row * ballSepp) / 2 + col * ballSepp;
        redBallLocationss.push({ x, y });
        i++;
      }
    }

  } else if (mode === 'randomReds' || mode === 'randomAll') {
    redBallLocationss = generateRandommLocations(15);

  } else if (mode === 'challenge') {
    redBallLocationss = generateRandommLocations(level);

  }else if (mode === 'straightLine') {
  let startX = width * 0.3;
  let startY = canvasCenterrY;
  for (let i = 0; i < 15; i++) {
    redBallLocationss.push({
      x: startX + i * (ballDiameterr + 5),
      y: startY
    });
  }
}

  // Create and add red balls
  for (let i = 0; i < redBallLocationss.length; i++) {
    let data = redBallLocationss[i];
    let ball = Bodies.circle(data.x, data.y, ballDiameterr / 2, {
      restitution: 1,
      friction: 0.2,
      render: {
        fillStyle: "rgb(255, 0, 0)",
      },
      isRedBall: true,
    });

    balls.push(ball);
  }

  World.add(engine.world, balls);
}

function drawBallss() {
  for (var i = 0; i < balls.length; i++) {
    var ball = balls[i];
    var ballColor = ball.render.fillStyle || "rgb(255, 255, 255)"; 
    fill(ballColor);
    drawwVerticess(ball.vertices);

  }
}


var ballColors = ["rgb(74, 183, 142)", 
                  "rgb(144, 70, 23)", 
                  "rgb(255, 234, 45)", 
                  "rgb(55, 78, 233)", 
                  "rgb(250, 155, 197)", 
                  "rgb(89, 89, 89)"];

var coloredBallLocationsss = [
  { x: baulkLineeX, y: canvasCenterrY - baulkRadiuss },
  { x: baulkLineeX, y: canvasCenterrY }, 
  { x: baulkLineeX, y: canvasCenterrY + baulkRadiuss }, 
  { x: canvasCenterrX, y: canvasCenterrY},
  { x: (tableLengthh * 0.75) - 20, y: canvasCenterrY },
  { x: canvasCenterrX+tableWidthh/1.251, y: canvasCenterrY },
   
];

function generatecolouredballs() {
  if (mode === 'starting' || mode === 'randomReds') {
    for (var i = 0; i < coloredBallLocationsss.length; i++) {
      var data = coloredBallLocationsss[i];
      var coloredBall = Bodies.circle(data.x, data.y, ballRadiuss, {
        restitution: 1,
        friction: 0.2,
        render: {
          fillStyle: ballColors[i % ballColors.length],
        },
      });

      colouredballs.push(coloredBall);
    }
  } else if (mode === 'randomAll') {
    var randomLocations = generateRandommLocations(coloredBallLocationsss.length);
    for (var i = 0; i < coloredBallLocationsss.length; i++) {
      var data = randomLocations[i];
      var coloredBall = Bodies.circle(data.x, data.y, ballRadiuss, {
        restitution: 1,
        friction: 0.2,
        render: {
          fillStyle: ballColors[i % ballColors.length],
        },
      });

      colouredballs.push(coloredBall);
    }
  }

  World.add(engine.world, colouredballs);
}


function resetColouredBalls(ball) {
  var index = colouredballs.indexOf(ball);
  if (index !== -1 && index < coloredBallLocationsss.length) {
    var originalPositionn = coloredBallLocationsss[index];
    Body.setPosition(ball, originalPositionn);
    ball.ispocketted = false;

    Body.setVelocity(ball, { x: 0, y: 0 });
    Body.setAngularVelocity(ball, 0);
  }
}


function drawcolouredballs() {
  for (var i = 0; i < colouredballs.length; i++) {
    var ball = colouredballs[i];
    var color = ball.render.fillStyle;
    push();
    fill(color);
    noStroke();
    ellipse(ball.position.x, ball.position.y, ballRadiuss * 2);
    pop();
  }
}


var isDraggingcueBalll = false;

function drawForceLinee() {
  push();

  var direction = createVector(mouseX - cueBalll.position.x, mouseY - cueBalll.position.y);
  direction.normalize();

  var fixedForceLineLengthh = 280; 

  var distancetooMouse = dist(cueBalll.position.x, cueBalll.position.y, mouseX, mouseY);

  var distancetooLine = map(distancetooMouse, 0, fixedForceLineLengthh, 0, fixedForceLineLengthh);

  var forceLineEnddX = cueBalll.position.x + direction.x * (fixedForceLineLengthh + distancetooLine);
  var forceLineEnddY = cueBalll.position.y + direction.y * (fixedForceLineLengthh + distancetooLine);

  stroke(101, 67, 33)
  strokeWeight(10);
  line(forceLineEnddX, forceLineEnddY,mouseX, mouseY);

  noStroke();
  fill(0);
  ellipse(mouseX,mouseY, 10, 10);

  pop();
     
var oppositeeX = cueBalll.position.x - (mouseX - cueBalll.position.x);
var oppositeeY = cueBalll.position.y - (mouseY - cueBalll.position.y);

stroke(0);
line(cueBalll.position.x, cueBalll.position.y, oppositeeX, oppositeeY);
}


function mouseReleased() {
  if (isDraggingcueBalll) {
    isDraggingcueBalll = false;
    if (iscueBalllInPlay) {
      Body.setPosition(cueBalll, { x: mouseX, y: mouseY });
    }
    cueBalllHistory = [];
  }

  if (!iscueBalllInPlay && dragStart) {
    let force = p5.Vector.sub(dragStart, createVector(mouseX, mouseY));
    force.mult(0.02); 
    Body.applyForce(cueBalll, cueBalll.position, { x: force.x, y: force.y });

    setTimeout(() => {
      currentPlayer = (currentPlayer + 1) % 2;
      document.getElementById("playerTurnDisplay").innerText = `${playerNames[currentPlayer]}'s Turn`;
      currentPower = 0;

      iscueBalllInPlay = true;

    }, 1000);

    dragStart = null;
  }
}


function mousePressed() {
  if (!cueBalll || !cueBalll.position) return;  // safety check

  if (isMouseInsidecueBalll()) {
    isDraggingcueBalll = true;
  } else {
      
      dragStart = createVector(mouseX, mouseY); //
    currentPower = 0; 

    var forceMultiplierr = 0.0004;
    var forceX = (cueBalll.position.x - mouseX) * forceMultiplierr;
    var forceY = (cueBalll.position.y - mouseY) * forceMultiplierr;

    var maxForcee = 0.05;
    var forceMagnitudee = dist(0, 0, forceX, forceY);
    if (forceMagnitudee > maxForcee) {
      var scaleFactor = maxForcee / forceMagnitudee;
      forceX *= scaleFactor;
      forceY *= scaleFactor;
    }

    var appliedForcee = { x: forceX, y: forceY };
    Body.applyForce(cueBalll, cueBalll.position, appliedForcee);

    iscueBalllInPlay = false;
  }
    
    if (!iscueBalllInPlay && cueBalll) {
    dragStart = createVector(mouseX, mouseY);
  }
}

function isMouseInsidecueBalll() {
  if (!cueBalll || !cueBalll.position) return false;

  let dx = mouseX - cueBalll.position.x;
  let dy = mouseY - cueBalll.position.y;
  return sqrt(dx * dx + dy * dy) < ballRadiuss;
}

function mouseDragged() {
  if (isDraggingcueBalll && iscueBalllInPlay) {
    const margin = ballRadiuss + 5;

    const minX = canvasCenterrX - tableLengthh / 2 + margin;
    const maxX = canvasCenterrX + tableLengthh / 2 - margin;
    const minY = canvasCenterrY - tableWidthh / 2 + margin;
    const maxY = canvasCenterrY + tableWidthh / 2 - margin;

    const clampedX = constrain(mouseX, minX, maxX);
    const clampedY = constrain(mouseY, minY, maxY);

    Body.setPosition(cueBalll, { x: clampedX, y: clampedY });

  } else if (!iscueBalllInPlay && dragStart) {
    const dragVector = p5.Vector.sub(dragStart, createVector(mouseX, mouseY));
    currentPower = constrain(dragVector.mag() * 0.01, 0, maxPower);
  }
}


function drawwVerticess(vertices) {
  beginShape();
  for (var i = 0; i < vertices.length; i++) {
    vertex(vertices[i].x, vertices[i].y);
  }
  endShape(CLOSE);
}

function keyPressed() {
  if (!gameStarted) return; 

  if (key === "1") {
    mode = 'starting';
    updatesMessagess("Triangle Mode Selected");
    resetBalls();
  } else if (key === "2") {
    mode = 'randomAll';
    updatesMessagess("Random All Mode Selected");
    resetBalls();
  } else if (key === "3") {
    mode = 'randomReds';
    updatesMessagess("Random Reds Mode Selected");
    resetBalls();
  } else if (key === "4") {
    mode = 'straightLine';
    updatesMessagess("Straight Line Mode Selected");
    resetBalls();
  }
}

function resetGame() {
  console.log("Resetting the game...");
  
  level = 1; 
  resetBalls(); 
  iscueBalllInPlay = true; 
  lastColoredBallPottedd = null; 
  var message = "Game Reset! Challenge Mode selected.";
  updatesMessagess(message);
}

function resetBalls() {
  balls.forEach(ball => World.remove(engine.world, ball));
  balls = [];

  if (mode !== 'straightLine') {
    colouredballs.forEach(ball => World.remove(engine.world, ball));
    colouredballs = [];
    generatecolouredballs();
  }

  generateeBalls();
}

function checkpocketttCollisionn() {
  for (var i = 0; i < balls.length; i++) {
    checkAndPotBalls(balls[i]);
  }

  for (var i = 0; i < colouredballs.length; i++) {
    checkAndPotBalls(colouredballs[i]);
  }

  checkAndPotBalls(cueBalll);
}

function pockettAnimation(ball, pockett) {
  var animationDuration = 1000; 
  var animationstarttTime = Date.now();
  var originalPositionn = { x: ball.position.x, y: ball.position.y };

  function updatePositionn() {
    var currentTimee = Date.now();
    var elapsedd = currentTimee - animationstarttTime;

    if (!ball || !ball.position) {
      console.error("Invalid ball object or missing position property.");
      return;
    }

    var progress = Math.min(1, elapsedd / animationDuration);

    var newPositionn = {
      x: originalPositionn.x + (pockett.position.x - originalPositionn.x) * progress,
      y: originalPositionn.y + (pockett.position.y - originalPositionn.y) * progress
    };

    Body.setPosition(ball, newPositionn);

    if (elapsedd < animationDuration) {
      requestAnimationFrame(updatePositionn);
    } else {
      removeBallFromWorld(ball);
    }
  }

  updatePositionn();
}

var pottedballss = [];

function checkAndPotBalls(ball, iscueBalll) {
  for (var j = 0; j < pocketts.length; j++) {
    var pockett = pocketts[j];
    var ballPosition = ball.position;
    var pockettPosition = pockett.position;
    var distance = dist(ballPosition.x, ballPosition.y, pockettPosition.x, pockettPosition.y);

    var pockettRadius = pockett.circleRadius || pockett.radius;
    if (distance < pockettRadius && !ball.ispocketted) {
      ball.ispocketted = true;
        
      if (iscueBalll) {
        iscueBalllInPlay = false;
        resetcueBalllPosition();
      } else {
        checkAndUpdateConsecutivee(ball);
        pockettAnimation(ball, pockett);

        if (ball.isRedBall && areAllRedBallsPotted()) {
          console.log("All red balls potted!");
         generateeBalls();
        }
      }
      break;
    }
  }
}

var cueBalll;  
function resetcueBalllPosition() {
  if (cueBalll) {
    Body.setPosition(cueBalll, { x: baulkLineeX - 70, y: canvasCenterrY });
    cueBalll.ispocketted = false;
    Body.setVelocity(cueBalll, { x: 0, y: 0 });
    Body.setAngularVelocity(cueBalll, 0);
  } else {
    cueBalll = generateCueeBall(baulkLineeX - 100, canvasCenterrY);
  }

  var message = "Cue Ball is in Play";
  updatesMessagess(message);
}

function removeBallFromWorld(ball) {
  if (ball.isRedBall) {
    balls.splice(balls.indexOf(ball), 1);
    World.remove(engine.world, ball); 
  } else if (ball.iscueBalll) {
    resetcueBalllPosition();
  } else {
    resetColouredBalls(ball);
    Body.setVelocity(ball, { x: 0, y: 0 });
    Body.setAngularVelocity(ball, 0);
  }
}

function areAllRedBallsPotted() {
  console.log("Checking if all red balls are pocketted");
  console.log("Number of red balls:", balls.filter(ball => ball.isRedBall).length);
  console.log("Red balls pocketted:", balls.filter(ball => ball.isRedBall && ball.ispocketted).length);
  return balls.filter(ball => ball.isRedBall).every(ball => ball.ispocketted);
}

var lastColoredBallPottedd = null;

function checkAndUpdateConsecutivee(ball) {
  if (lastColoredBallPottedd !== null && !ball.iscueBalll && !ball.isRedBall) {
    if (lastColoredBallPottedd.render.fillStyle === ball.render.fillStyle) {
      console.error("Error: Consecutive colored balls of the same type potted.");
        var message = "Error: Consecutive colored balls of the same type potted.";
    updatesMessagess(message);
    }
  }
  lastColoredBallPottedd = ball;
}

function generateRandommLocations(numLocations) {
  var locations = [];
  for (var i = 0; i < numLocations; i++) {
    locations.push({
      x: random(canvasCenterrX - (tableLengthh / 2),canvasCenterrX + (tableLengthh / 2)),
      y: random(canvasCenterrY - (tableWidthh / 2), canvasCenterrY + (tableWidthh / 2)),
    });
  }
  return locations;
}

document.addEventListener('DOMContentLoaded', function () {

  const instructionToggleButton = document.getElementById("menuButton");
  instructionToggleButton.style.position = "absolute";
  instructionToggleButton.style.bottom = "10px";  
  instructionToggleButton.style.left = "50%";  
  instructionToggleButton.style.transform = "translateX(-50%)";  

  instructionToggleButton.addEventListener("click", function () {
    toggleInstructionPopup();
  });

  let isInstructionPopupVisible = false;

  function toggleInstructionPopup() {
    isInstructionPopupVisible = !isInstructionPopupVisible;
    const instructionPopup = document.getElementById("popup");
    instructionPopup.style.display = isInstructionPopupVisible ? "block" : "none";
  }

  const instructionCloseButton = document.getElementById("closeButton");
  instructionCloseButton.addEventListener("click", function () {
    const instructionPopup = document.getElementById("popup");
    instructionPopup.style.display = "none";
    isInstructionPopupVisible = false;
  });

});
