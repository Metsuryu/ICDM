//TODO: Make "object" messages that contain username, picture, message, and maybe timestamp
//TODO: And have a way to decode and display that object message
let sessionID = null;

function getUserName () {
  if (user.google) {
    return user.google.name;
   } else if (user.facebook) {
    return user.facebook.name;
    }else{
      return "User";
    };
}

function getUserPictre (){
  if (user.google) {
    return user.google.picture;
  } 
  else if (user.facebook) {
    return user.facebook.picture;
  }else{
    return "";
  };
}

let userName = getUserName();
let userPicture = getUserPictre();

  $(function () {
    let socket = io();
    
    socket.on("sessionID", function (session) {
      if (session.id) {
        sessionID = session.id;
        socket.emit("updateOnline", {
          uniqueID: user._id,
          name: userName, 
          picture: userPicture, 
          socketID: sessionID, 
          lat: user.lat,
          lng: user.lng
        });
      }else{
        //TODO: Handle error better
        console.log("Error: Could not retrive ID");
      }
    });


    $("body").on("submit", "form", function(event){
      //Can use either "event.target" or "this"
      let messageToSend = $(".m",this).val();
      //Don't allow empty messages.
      if (!messageToSend) {return};

      let contactID = this.getAttribute("data-pmid");
      let contactUID = this.getAttribute("data-pmuid");
      let thisChat = "#" + contactID;
      
      socket.emit("PM", contactID, messageToSend, {
        name: userName, 
        picture: userPicture, 
        id: sessionID, 
        uniqueID: user._id,
        lat: user.lat,
        lng: user.lng
      });
      //Append sent message to chatWindow
      //TODO: Add timestamp and sender name that can be seen on mouse hover.
      $(thisChat).append($('<p class="sentMessage">').text(messageToSend));
      //Conversation history
      let chatHistory = Cookies.get(contactUID) || "";
      chatHistory += '<p class="sentMessage">' + messageToSend;
      Cookies.set(contactUID, chatHistory);
      //Scroll to bottom
      let chatWindow = $(thisChat);
      chatWindow.scrollTop(chatWindow.prop("scrollHeight"));
      //Clear input bar
      messageToSend = "";
      $(".m",this).val(messageToSend);
      return false;
    });

    //TODO: Add notification of unread messages
    //Receive PM
    socket.on("PMsg", function(msg, sender){
      //main.js
      openChatWindow(
        sender.name, 
        sender.picture, 
        sender.id, 
        sender.uniqueID, 
        sender.lat, 
        sender.lng,
        false);
      let targetChatWindow = $("#" + sender.id);
      //TODO: Add timestamp and sender name that can be seen on mouse hover.
      $(targetChatWindow).append($('<p class="receivedMessage">').text(msg));
      //Conversation history
      let chatHistory = Cookies.get(sender.uniqueID) || "";
      chatHistory += '<p class="receivedMessage">' + msg;
      Cookies.set(sender.uniqueID, chatHistory);
      //Notification sound only if the window is not visible.
      if (document.visibilityState === "hidden") {
        let notification = new Audio("audio/notification.mp3");
        notification.play();
      };
      //Scroll to bottom
      targetChatWindow.scrollTop(targetChatWindow.prop("scrollHeight"));    
    });
  });