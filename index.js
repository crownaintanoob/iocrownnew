/*Packages to install for it to work:
socket.io
socket.io-client
live-server
pixi.js
*/
var http = require('http');

var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');

var serve = serveStatic("./");

var server = http.createServer(function(req, res) {
  var done = finalhandler(req, res);
  serve(req, res, done);
});

server.listen(4000);

const { Server } = require("socket.io");

const io = new Server(server, {});

var dataPlayers = {};

io.on('connection', function (socket) {
  console.log('A user connected.');

  socket.on("addplayer", async function (msg) {
    socket.join(msg["RoomName"]);
    dataPlayers[socket.id] = {"Username": msg["Username"], "PlrColor": msg["PlrColor"]};
    var SocketsListIDs = [];
    var socketsList = await io.in(msg["RoomName"]).fetchSockets();
    for (const socketGot of socketsList) {
      SocketsListIDs.push({"PlrColor": dataPlayers[socketGot.id]["PlrColor"], "socketId": socketGot.id, "PlrName": dataPlayers[socketGot.id]["Username"]});
    }
    io.to(msg["RoomName"]).emit("NewPlayer", SocketsListIDs);
  });
  // Receive messages.
  socket.on('PlayerMove', function (msg) {
    const rooms = socket.adapter.rooms;
    var roomSocketIsIn = ""; // Room Name
    for (const key of rooms.keys()) {
      if (key != socket.id) {
        roomSocketIsIn = key;
        break;
      }
    }
    io.to(roomSocketIsIn).emit('MoveGet', {"x": msg.x, "y": msg.y, "senderId": socket.id});
  });

  socket.on('disconnect', function () {
    console.log('A user disconnected');
  });
});

//io.listen(4000);