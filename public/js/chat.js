//TODO: Make "object" messages that contain username, picture, message, and maybe timestamp
//TODO: And have a way to decode and display that object message
let sessionID = null;
let receivedCheckTimer = null;
let timeoutEndTimer = null;
let awaitingClientResponse = [];
let messageTimeout = 5000;

function isUIDInArray(inputArray, targetString) {
  for (var i = inputArray.length - 1; i >= 0; i--) {
    if (inputArray[i].UID === targetString) {
      return true;
    }
  }
  return false;
}

function removeUIDFromArray(inputArray, targetString) {
  for (var i = inputArray.length - 1; i >= 0; i--) {
    if (inputArray[i].UID === targetString) {
      inputArray.splice(i, 1); //Remove element
    }
  }
}

function clearReceivedCheckTimer() {
  if (receivedCheckTimer) {
    clearInterval(receivedCheckTimer);
    receivedCheckTimer = null;
  };
}

function clearTimeoutEndTimer() {
  if (timeoutEndTimer) {
    clearTimeout(timeoutEndTimer);
  };
}

function clientResponded(clientUID) {
  removeUIDFromArray(awaitingClientResponse, clientUID);
}

function awaitClientResponse( UIDToVerify, thisUserID, chatID ) {
  //If already awaiting response from client, return.
  if ( isUIDInArray(awaitingClientResponse, UIDToVerify) ) {return};

  awaitingClientResponse.push({ "UID": UIDToVerify });
  loopCheckIfReceived(chatID, UIDToVerify );
}

//If the UIDToVerify is not in awaitingClientResponse[], the message was not received by the client.
function checkIfReceived(chatID, UIDToVerify) {
  if ( !isUIDInArray(awaitingClientResponse, UIDToVerify) ) {
    //Received
    //Clear timers, since there is nothing left to do.
    clearReceivedCheckTimer();
    clearTimeoutEndTimer();
    //Add checkmark to chat, since message was sent.
    let checkIcon = '<i class="fa fa-check"></i>';
    $(chatID+" p:last").last().append($('<span class="sentCheck">').html(checkIcon));
    //Scroll to bottom
    let targetChat = $(chatID);
    targetChat.scrollTop(targetChat.prop("scrollHeight"));
    return true;
  }else{
    return false;
  };
}

//At the end of the check, must remove ID from awaitingClientResponse[]
function loopCheckIfReceived(chatID, UIDToVerify) {
  if (!receivedCheckTimer ) {
    //Try again every 500ms for 5 seconds, then return false.
    receivedCheckTimer = setInterval( function(){ checkIfReceived(chatID, UIDToVerify); }  , 500);
    timeoutEndTimer = setTimeout(function() {
      clearReceivedCheckTimer();
      if ( !checkIfReceived(chatID, UIDToVerify) ) {
        
        removeUIDFromArray(awaitingClientResponse, UIDToVerify);
        let errorMessage = "Error: Your message couldn't be delivered.";
        if (localLanguage === "Ita"){
          errorMessage = "Errore: Impossibile inviare messaggio."
        };

        let chatWindow = $(chatID);
        chatWindow.append($('<p class="infoMsg">').text(errorMessage));
        //Scroll to bottom
        chatWindow.scrollTop(chatWindow.prop("scrollHeight"));
      };
    }, messageTimeout);
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
function appendMessageToChat(chatUID, className, message) {
  let chatWindow = $("#"+chatUID).parent().find(".messages");
  chatWindow.append( $('<p class="'+className+'">').text(message) );
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

      //Append sent message to chatWindow
      //TODO: Add timestamp and sender name that can be seen on mouse hover.
      $(thisChat).find(".sentCheck").remove();
      appendMessageToChat(contactUID, "sentMessage", messageToSend);

      /* To verify if they received the message:
        -Push client UID in awaitingClientResponse
        -The UID gets removed when clientResponded(clientUID) is invoked
        -Check periodically for "messageTimeout" ms if the message was received by checking if 
          client UID is still in awaitingClientResponse. 
        If it's not there anymore, the message was sent successfully. 
        If it's still there after the messageTimeout, an error is shown.
      */
      awaitClientResponse( contactUID, user._id, thisChat );

      socket.emit("PM", contactUID, messageToSend, {
        name: userName, 
        picture: userPicture, 
        id: sessionID, 
        uniqueID: user._id,
        lat: user.lat,
        lng: user.lng
      });

      //Conversation history
      let chatHistory = Cookies.get(contactUID) || "";
      chatHistory += '<p class="sentMessage">' + messageToSend;
      Cookies.set(contactUID, chatHistory, { expires: 7 } );

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
        //let targetChatWindow = $("#" + sender.id);
        //TODO: Add timestamp and sender name that can be seen on mouse hover.
        appendMessageToChat(sender.uniqueID, "receivedMessage", msg);
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
      Cookies.set(sender.uniqueID, chatHistory, { expires: 7 } );
      //Notification sound only if the window is not visible.
      /*document.visibilityState === "hidden" works only if the document is actually hidden
        document.hasFocus() is better in this case*/
      if ( !document.hasFocus() ) {
        let notification = new Audio("audio/notification.mp3");
        notification.play();
      };

      //Send message acknowledgement to sender.
      socket.emit("received", sender.id, user._id);
    });

    socket.on("receivedOK", function(senderUID) {
      clientResponded(senderUID);
    });

    socket.on("logoutEveryClient", function() {
      //console.log("logging out");
      window.location.href = "/logout";
    });

    /*If you disconnect from another page (By refreshing, or doing logout, 
    or closing another page) you can get removed from usersOnline instead of being 
    disconnected with logoutEveryClient (for some reason), but if 
    you're still in on another page, you are no longer seen by other users, 
    but are still online. To fix that, emit updateOnline again.
    */
    setInterval(
      function(){
        if ( !isUniqueIDInArray(usersOnline, user._id) ){
          //update online users list
          socket.emit("updateOnline", {
            uniqueID: user._id,
            name: userName, 
            picture: userPicture, 
            socketID: sessionID, 
            lat: user.lat,
            lng: user.lng
          });
        }
      }, 12000); 
      /*Check every 12 seconds, since usersOnline updates 
      every 10ish seconds, so give it time to update 
      before trying to reconnect.*/

});