/*Packages to install for it to work:
socket.io
socket.io-client
live-server
pixi.js
*/

var liveServer = require("live-server");

var params = {
  port: 3000, // Set the server port. Defaults to 8080.
  host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
  root: __dirname, // Set root directory that's being served. Defaults to cwd.
  open: false, // When false, it won't load your browser by default.
  file: "index.html", // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
  mount: [['/components', './node_modules']], // Mount a directory to a route.
  logLevel: 0, // 0 = errors only, 1 = some, 2 = lots
  middleware: [function(req, res, next) { next(); }] // Takes an array of Connect-compatible middleware that are injected into the server middleware stack
};
var server = liveServer.start(params);

const { Server } = require("socket.io");

const io = new Server(server, {});

let users = [];

io.on('connection', function(socket) {
  console.log('A user connected.');

  socket.on("addplayer", function(roomName, username) {
    const user = {
      username: username,
    };
    users.push(user);
    io.emit("NewPlayer", user)
    socket.join(roomName);
  });
  // Receive messages.
  socket.on('PlayerMove', function(msg) {
    // Send message to all users.
    io.emit('MoveGet', msg);
  });

  socket.on('disconnect', function() {
    console.log('A user disconnected');
  });
});

io.listen(4000);