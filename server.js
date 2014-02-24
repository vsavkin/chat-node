var http = require("http");
var fs = require("fs");
var path = require("path");
var mime = require("mime");
var socketio = require("socket.io");


var server = http.createServer(serveStatic);
server.listen(3000);
chatBackend(server);


function serveStatic(request, response){
  var absPath = request.url == "/" ? "public/index.html" : "public" + request.url;

  fs.exists(absPath, function(exists){
    if(exists){
      sendFile(response, absPath);
    } else {
      send404(response);
    }
  });

  function sendFile(response, filePath){
    fs.readFile(absPath, function(err, data){
      if(err){
        send404(response);
      } else {
        response.writeHead(200, {"Content-Type" : mime.lookup(path.basename(filePath))});
        response.end(data);
      }
    });
  }

  function send404(response){
    response.writeHead(404, {"Content-Type" : "text/plain"});
    response.write("Error 404: resource not found.");
    response.end();
  }
}


function chatBackend(server){
  var io = socketio.listen(server);
  var users = {};

  io.sockets.on('connection', function(socket){
    registerUser(socket);
    setUpListener(socket);
  });

  function registerUser(socket){
    var name = "Guest " + (Object.keys(users).length + 1);
    users[socket.id] = {name: name};
    socket.join("chat");
    socket.broadcast.to("chat").emit("newUser", {name: name});
  }

  function setUpListener(socket){
    socket.on("message", function(message){
      socket.broadcast.to("chat").emit("newMessage", {
        name: users[socket.id].name,
        text: message.text
      });
    });
  }
}