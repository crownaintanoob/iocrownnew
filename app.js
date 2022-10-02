function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function containsNumbers(str) {
  return Boolean(str.match(/\d/));
}


var ioGot = io("localhost:4000", { transports: ["websocket"] });

var playerObjectsList = {};

document.addEventListener("playclicked", function (data) {
  if (containsNumbers(data.detail.RoomName) == true) {
    ioGot.emit("addplayer", {
      Username: data.detail.Username,
      RoomName: data.detail.RoomName,
      PlrColor: /*Random Color*/new Phaser.Display.Color().random(50).color,
    });
  }
});

var thisGame;

var config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: "100%",
    height: "100%",
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
    },
  },
  scene: {
    preload: preload,
    create: create,
  },
};

var game = new Phaser.Game(config);

ioGot.on("NewPlayer", async function (socketsList) {
  if (thisGame != null) {
    for (var index = 0; index < socketsList.length; index++) {
      var idSocket = socketsList[index].socketId;
      var PlrColor = socketsList[index].PlrColor;
      if (playerObjectsList[idSocket] == null) {
        playerObjectsList[idSocket] = {
          playerObject: thisGame.add.circle(200, 200, 80, PlrColor),
        };
      }
    }
  } else {
    while (true) {
      // Similar to repeat until
      if (thisGame != null) {
        for (var index = 0; index < socketsList.length; index++) {
          var idSocket = socketsList[index].socketId;
          var PlrColor = socketsList[index].PlrColor;
          if (playerObjectsList[idSocket] == null) {
            playerObjectsList[idSocket] = {
              playerObject: thisGame.add.circle(200, 200, 80, PlrColor),
            };
          }
        }
        break;
      }
      await sleep(500);
    }
  }
});

ioGot.on("MoveGet", function (dataGot) {
  if (dataGot.senderId != ioGot.id) {
    if (playerObjectsList[dataGot.senderId] != null) {
      playerObjectsList[dataGot.senderId]["playerObject"].x = dataGot.x;
      playerObjectsList[dataGot.senderId]["playerObject"].y = dataGot.y;
    }
  }
});

var pressedKeys = {};
window.onkeyup = function (e) {
  pressedKeys[e.keyCode] = false;
};
window.onkeydown = function (e) {
  pressedKeys[e.keyCode] = true;
};

var Speed = 3;

function loopGot() {
  if (playerObjectsList[ioGot.id] != null) {
    var hasMoved = false;
    if (/*D*/ pressedKeys[68]) {
      playerObjectsList[ioGot.id]["playerObject"].x += Speed;
      hasMoved = true;
    }

    if (/*A*/ pressedKeys[65]) {
      playerObjectsList[ioGot.id]["playerObject"].x -= Speed;
      hasMoved = true;
    }

    if (/*W*/ pressedKeys[87]) {
      playerObjectsList[ioGot.id]["playerObject"].y -= Speed;
      hasMoved = true;
    }
    if (/*S*/ pressedKeys[83]) {
      playerObjectsList[ioGot.id]["playerObject"].y += Speed;
      hasMoved = true;
    }
    if (hasMoved == true) {
      ioGot.emit("PlayerMove", {
        x: playerObjectsList[ioGot.id]["playerObject"].x,
        y: playerObjectsList[ioGot.id]["playerObject"].y,
      });
    }
  }
  requestAnimationFrame(loopGot);
}

function preload() {
  thisGame = this;
  this.load.image("grid", "Textures/grid.png");
  this.physics.world.setBounds(0, 0, 4000, 3000);
}

async function create() {
  for (var x = 0; x < 10; x++) {
    for (var y = 0; y < 10; y++) {
      this.add.image(x * 449, y * 321, "grid");
    }
  }
  if (
    playerObjectsList[ioGot.id] != null &&
    playerObjectsList[ioGot.id]["playerObject"] != null
  ) {
    this.cameras.main.startFollow(playerObjectsList[ioGot.id].playerObject);
  } else {
    while (true) {
      if (
        playerObjectsList[ioGot.id] != null &&
        playerObjectsList[ioGot.id]["playerObject"] != null
      ) {
        this.cameras.main.startFollow(playerObjectsList[ioGot.id].playerObject);
        break;
      }
      await sleep(500);
    }
  }
}

loopGot();
