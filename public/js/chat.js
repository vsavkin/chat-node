function Chat(){
  var messages = this.messages = [];

  this.newUser = function(message){
    addMessage(message.name + " just joined the chat!");
  };

  this.newMessage = function(message){
    addMessage(message.name + ": " + message.text);
  };

  function addMessage(message){
    messages.push({timestamp: new Date(), text: message});
  }
}

angular.module("chat", [])
  .controller("ChatCtrl", function(socket, $scope){
    var chat = this.chat = new Chat();
    this.message = "";

    socket.on("newMessage", newMessage);
    socket.on("newUser", newUser);

    this.sendMessage = function(){
      chat.newMessage({name: "You", text: this.message});
      socket.emit("message", {type: "message", text: this.message});
      this.message = "";
    };

    function newUser(m){
      $scope.$apply(function(){
        chat.newUser(m);
      });
    }

    function newMessage(m){
      $scope.$apply(function(){
        chat.newMessage(m);
      });
    }
  })
  .value("socket", io.connect());

