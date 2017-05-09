//TODO: Make "object" messages that contain username, picture, message, and maybe timestamp
//TODO: And have a way to decode and display that object message
let sessionID = null;
let messageSentOK = false;
let receivedCheckLoop = null;
let timeoutEndLoop = null;

function checkIfReceived(chatID) {
  if (messageSentOK) {
    //console.log("received");
    let checkIcon = '<i class="fa fa-check" aria-hidden="true"></i>';
    let targetChat = $(chatID);
    //Message sent check,
    $(chatID+" p:last").last().append($('<span class="sentCheck">').html(checkIcon));
    //Scroll to bottom
    targetChat.scrollTop(targetChat.prop("scrollHeight")); 
    if (receivedCheckLoop) {
      clearInterval(receivedCheckLoop);
      receivedCheckLoop = null;
    };
    if (timeoutEndLoop) {
      clearTimeout(timeoutEndLoop);
    }
    return true;
  }else{
    return false;
  };
}

function loopCheckIfReceived(chatID) {
  if (!messageSentOK && !receivedCheckLoop ) {
    //Try again every 500ms for 5 seconds, then return false.
    receivedCheckLoop = setInterval( function(){ checkIfReceived(chatID); }  , 500);
    timeoutEndLoop = setTimeout(function() {
      if (receivedCheckLoop) {
        clearInterval(receivedCheckLoop);
        receivedCheckLoop = null;
      };
      if ( !checkIfReceived() ) {
        //TODO sentCheck: On timeout, check if the chat is sending the msg to the right sessionID
        //Make array with all users with same UID and differend SID, check each one with something like 
        //socket.emit("received", sender.id, user._id); (Use different one)
/*
    socket.on("receivedOK", function(sender) {
      //TODO: Differentiate messages sent to different users
      // If "sender" responds, use that SID on non-responding chat with same UID. 
      messageSentOK = true;
    });
*/
        //If it doesn't respond, try next, if it responds, set the current chatwindow SID to that one.
        //If there is no match, throw error.
        console.log("Timeout: Message not received.");
      };
    }, 5000);
  }
}

function getUserName() {
  if (user.google) {
    return user.google.name;
   } else if (user.facebook) {
    return user.facebook.name;
    }else{
      return "User";
    };
}

function getUserPictre() {
  if (user.google) {
    return user.google.picture;
  } 
  else if (user.facebook) {
    return user.facebook.picture;
  }else{
    return "";
  };
}

//TODO: Add timestamp and sender name that can be seen on mouse hover.
function appendMessageToChat(chatID, className, message) {
  let chatWindow = $("#"+chatID);
  chatWindow.append($('<p class="'+className+'">').text(message));
  //Scroll to bottom
  chatWindow.scrollTop(chatWindow.prop("scrollHeight"));
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
      
      messageSentOK = false;

      socket.emit("PM", contactID, messageToSend, {
        name: userName, 
        picture: userPicture, 
        id: sessionID, 
        uniqueID: user._id,
        lat: user.lat,
        lng: user.lng
      });

      loopCheckIfReceived(thisChat);


      //Append sent message to chatWindow
      //TODO: Add timestamp and sender name that can be seen on mouse hover.
      $(thisChat).find(".sentCheck").remove();
      appendMessageToChat(contactID, "sentMessage", messageToSend);
      //Conversation history
      let chatHistory = Cookies.get(contactUID) || "";
      chatHistory += '<p class="sentMessage">' + messageToSend;
      Cookies.set(contactUID, chatHistory);
      //Clear input bar
      messageToSend = "";
      $(".m",this).val(messageToSend);
    });

    //Receive PM
    socket.on("PMsg", function(msg, sender ){
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
        appendMessageToChat(sender.id, "receivedMessage", msg);
        //$(targetChatWindow).append($('<p class="receivedMessage">').text(msg));
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

      //TODO: Maybe add message unique id.
      socket.emit("received", sender.id, user._id);

    });


    socket.on("receivedOK", function(sender) {
      //TODO: Differentiate messages sent to different users
      messageSentOK = true;
    });


});