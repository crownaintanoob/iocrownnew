function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function containsNumbers(str) {
  return Boolean(str.match(/\d/));
}

var ioGot = io("localhost:4000", { transports: ['websocket'] });

ioGot.on("NewPlayer", function (data) {
  console.log(data.username);
})

document.addEventListener("playclicked", function (data) {
  if (containsNumbers(data.detail.RoomName) == true) {
    ioGot.emit("addplayer", data.detail.Username, data.detail.RoomName);
  }
});

var app = new PIXI.Application({
	autoResize: true,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x2c3e50
});


// Initialize the pixi Graphics class
var graphics = new PIXI.Graphics();

document.body.appendChild(app.view);


// Resize function window
function resize() {
	const parent = app.view.parentNode;
   
	// Resize the renderer
	app.renderer.resize(window.innerWidth, window.innerHeight);
}

resize();
// Listen for window resize events
window.addEventListener('resize', resize);

// Set the fill color
graphics.beginFill(0xe74c3c); // Red

var pressedKeys = {};
window.onkeyup = function (e) { pressedKeys[e.keyCode] = false; }
window.onkeydown = function (e) { pressedKeys[e.keyCode] = true; }

// Draw a circle
var playerObject = graphics.drawCircle(app.screen.width / 2, app.screen.height / 2, 40); // drawCircle(x, y, radius)

// Applies fill to lines and shapes since the last call to beginFill.
graphics.endFill();

app.stage.addChild(graphics);

var Speed = 3;

function loopGot() {
  if (/*D*/pressedKeys[68]) {
    playerObject.x += Speed;
  }

  if (/*A*/pressedKeys[65]) {
    playerObject.x -= Speed;
  }

  if (/*W*/pressedKeys[87]) {
    playerObject.y -= Speed;
  }
  if (/*S*/pressedKeys[83]) {
    playerObject.y += Speed;
  }
  app.render(app.stage);
  requestAnimationFrame(loopGot);
}

async function MoveCam() {
  app.stage.pivot.x = playerObject.position.x;
  app.stage.pivot.y = playerObject.position.y;
  requestAnimationFrame(MoveCam);
}

MoveCam();
loopGot();