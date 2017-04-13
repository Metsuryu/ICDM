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
    //TODO: Use class="fa fa-user"
    return "";
  };
}

//TODO: Send userName and Picture only on connect, and then use them locally from the client-side
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
      let thisChat = "#" + contactID;
      //TODO: let contactPicture = 

      socket.emit("PM", contactID, messageToSend, {name: userName, picture: userPicture, id: sessionID});
      //Append sent message to chatWindow
      //TODO: Why can't I use (".messages",this) for this?
      //?TODO: close <p> tag
      //TODO: Add timestamp and sender name that can be seen on mouse hover.
      $(thisChat).append($('<p class="sentMessage">').text(messageToSend));
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
      //TODO: Use "<img src=" + sender.picture + ">" for sender icon
      openChatWindow(sender.name, sender.id, false);
      //Notification sound only if the window is not visible.
      if (document.visibilityState === "hidden") {
        let notification = new Audio("audio/notification.mp3");
        notification.play();
      };

      let targetChatWindow = $("#" + sender.id);
      //let senderName = $.parseHTML('<p class="receivedMessage">' + "<b>"+ sender.name +"</b>: ");
      //$( senderName ).appendTo( targetChatWindow );
      //TODO: Add timestamp and sender name that can be seen on mouse hover.
      $(targetChatWindow).append($('<p class="receivedMessage">').text(msg));
      //TODO: Adjust way messages are displayed
      //Scroll to bottom
      targetChatWindow.scrollTop(targetChatWindow.prop("scrollHeight"));    
    });
  });