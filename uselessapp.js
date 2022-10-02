function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  function containsNumbers(str) {
    return Boolean(str.match(/\d/));
  }
  
  var ioGot = io("localhost:4000", { transports: ['websocket'] });
  
  var playerObjectsList = {}
  
  document.addEventListener("playclicked", function (data) {
    if (containsNumbers(data.detail.RoomName) == true) {
      ioGot.emit("addplayer", { "Username": data.detail.Username, "RoomName": data.detail.RoomName });
    }
  });
  
  var app = new PIXI.Application({
    autoResize: true,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x2c3e50
  });
  
  document.body.appendChild(app.view);
  
  ioGot.on("NewPlayer", function (socketsList) {
    for (var index = 0; index < socketsList.length; index++) {
      var idSocket = socketsList[index].socketId;
      if (playerObjectsList[idSocket] == null) {
        playerObjectsList[idSocket] = true; // Temporary value
        console.log(socketsList[index].PlrName);
        playerObjectsList[idSocket] = {"playerObject": PIXI.Sprite.from('/Textures/Player.png'), "title": new Text(socketsList[index].PlrName, {fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'})};
        app.stage.addChild(playerObjectsList[idSocket].playerObject)
      }
    }
  })
  
  ioGot.on("MoveGet", function (dataGot) {
    if (dataGot.senderId != ioGot.id) {
      if (playerObjectsList[dataGot.senderId] != null) {
        playerObjectsList[dataGot.senderId]["playerObject"].x = dataGot.x;
        playerObjectsList[dataGot.senderId]["playerObject"].y = dataGot.y;
        // Title Below
        playerObjectsList[dataGot.senderId]["title"].x = playerObjectsList[dataGot.senderId]["playerObject"].x;
        playerObjectsList[dataGot.senderId]["title"].y = playerObjectsList[dataGot.senderId]["playerObject"].y;
      }
    }
  })
  
  // Resize function window
  function resize() {
    const parent = app.view.parentNode;
  
    // Resize the renderer
    app.renderer.resize(window.innerWidth, window.innerHeight);
  }
  
  resize();
  // Listen for window resize events
  window.addEventListener('resize', resize);
  
  var pressedKeys = {};
  window.onkeyup = function (e) { pressedKeys[e.keyCode] = false; }
  window.onkeydown = function (e) { pressedKeys[e.keyCode] = true; }
  
  var Speed = 3;
  
  function loopGot() {
    if (playerObjectsList[ioGot.id] != null) {
      var hasMoved = false;
      if (/*D*/pressedKeys[68]) {
        playerObjectsList[ioGot.id]["playerObject"].x += Speed;
        playerObjectsList[ioGot.id]["title"].x = playerObjectsList[ioGot.id]["playerObject"].x;
        hasMoved = true;
      }
  
      if (/*A*/pressedKeys[65]) {
        playerObjectsList[ioGot.id]["playerObject"].x -= Speed;
        playerObjectsList[ioGot.id]["title"].x = playerObjectsList[ioGot.id]["playerObject"].x;
        hasMoved = true;
      }
  
      if (/*W*/pressedKeys[87]) {
        playerObjectsList[ioGot.id]["playerObject"].y -= Speed;
        playerObjectsList[ioGot.id]["title"].y = playerObjectsList[ioGot.id]["playerObject"].y;
        hasMoved = true;
      }
      if (/*S*/pressedKeys[83]) {
        playerObjectsList[ioGot.id]["playerObject"].y += Speed;
        playerObjectsList[ioGot.id]["title"].y = playerObjectsList[ioGot.id]["playerObject"].y;
        hasMoved = true;
      }
      if (hasMoved == true) {
        ioGot.emit("PlayerMove", { "x": playerObjectsList[ioGot.id]["playerObject"].x, "y": playerObjectsList[ioGot.id]["playerObject"].y });
      }
    }
    app.render(app.stage);
    requestAnimationFrame(loopGot);
  }
  
  app.stage.position.x = app.screen.width / 2;
  app.stage.position.y = app.screen.height / 2;
  
  async function MoveCam() {
    if (playerObjectsList[ioGot.id] != null) {
      app.stage.pivot.x = playerObjectsList[ioGot.id]["playerObject"].x;
      app.stage.pivot.y = playerObjectsList[ioGot.id]["playerObject"].y;
    }
    requestAnimationFrame(MoveCam);
  }
  
  MoveCam();
  loopGot();