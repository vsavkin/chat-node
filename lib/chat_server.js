var socketio = require("socket.io");

var io;
var guestNumber = 1;
var users = {};

exports.listen = function(server){
  io = socketio.listen(server);
  io.set("log level", 1);

  io.sockets.on('connection', function(socket){
    var name = registerGuest(socket);
    joinRoom(socket);
    handleMessageBroadcasting(socket);
    handleClientDisconnection(socket);
    broadcastHello(name, socket);
  });

};

function registerGuest(socket){
  var name = "Guest " + guestNumber;
  users[socket.id] = {name: name};
  socket.emit("newUser", {name: name});
  guestNumber += 1;
  return name;
}

function joinRoom(socket){
  socket.join("room");
}

function handleMessageBroadcasting(socket){
  socket.on("message", function(message){
    socket.broadcast.to("room").emit("message", {
      text: users[socket.id].name + ": " + message.text
    });
  });
}

function handleClientDisconnection(socket){
  socket.on("disconnect", function(){
    delete users[socket.id];
  });
}

function broadcastHello(name, socket){
  socket.broadcast.to("room").emit("message", {
    text: "User " + name + " has joined the chat."
  });
}