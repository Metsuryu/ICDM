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
        //TODO: Handle error better (Retry until ID is available)
        console.log("Error: Could not retrive ID");
      }
    });

    $("body").on("submit", "form", function(event){
      event.preventDefault();
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
    });

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
      //If the chat is open, get the message normally, otherwise, add a notification next to sender's name
      if (isChatAlreadyOpen (sender.uniqueID)) {
        let targetChatWindow = $("#" + sender.id);
        //TODO: Add timestamp and sender name that can be seen on mouse hover.
        $(targetChatWindow).append($('<p class="receivedMessage">').text(msg));
        //Scroll to bottom
        targetChatWindow.scrollTop(targetChatWindow.prop("scrollHeight")); 
      }else{
        //Notification
        if ( !isUniqueIDInArray (hasUnreadMessages, sender.uniqueID) ) {
          let unreadSpan = '<span ng-if="contact.unreadMessages" class="glyphicon glyphicon-envelope unread"></span>'
          $("[data-contactUID="+ sender.uniqueID +"]").append(unreadSpan);
          $("#contactsSpan").append(unreadSpan);
          /*Uses the object with uniqueID because the function isUniqueIDInArray
            needs an array of objects with uniqueID*/
          hasUnreadMessages.push( {"uniqueID" : sender.uniqueID} );
        };        
      }

      //Conversation history
      let chatHistory = Cookies.get(sender.uniqueID) || "";
      chatHistory += '<p class="receivedMessage">' + msg;
      Cookies.set(sender.uniqueID, chatHistory);
      //Notification sound only if the window is not visible.
      /*document.visibilityState === "hidden" works only if the document is actually hidden
        document.hasFocus() is better in this case*/
      if ( !document.hasFocus() ) {
        let notification = new Audio("audio/notification.mp3");
        notification.play();
      };   
    });

  });