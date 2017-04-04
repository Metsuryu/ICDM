//TODO: Make "object" messages that contain username, picture, message, and maybe timestamp
//TODO: And have a way to decode and display that object message
let sessionID = null;

//Have option to use custom nickname, if it's available use that first
function getUserName () {
  //if (nickname) {return nickname;} else
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

function getUserEmail (){
  if (user.google) {
    return user.google.email;
  } 
  else if (user.facebook) {
    return user.facebook.email;
  }else{
    return "";
  };
}

//TODO: Send userName and Picture only on connect, and then use them locally from the client-side
let userName = getUserName();
let userPicture = getUserPictre();
let userEmail = getUserEmail();

  $(function () {
    let socket = io();

    socket.on("sessionID", function (session) {
      if (session.id) {
        sessionID = session.id;
        socket.emit("updateOnline", {
          name: userName, 
          picture: userPicture, 
          email: userEmail, 
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
      let contactID = this.getAttribute("data-pmid");
      let thisChat = "#" + contactID;
      //TODO: let contactPicture = 
      //TODO: let contactEmail =

      socket.emit("PM", contactID, messageToSend, {name: userName, picture: userPicture, id: sessionID});
      //Append sent message to chatWindow
      //TODO: Why can't I use (".messages",this) for this?
      //TODO: close <p> tag
      $(thisChat).append($('<p class="sentMessage">').text(userName + ": " + messageToSend));
      //Scroll to bottom
      let chatWindow = $(thisChat);
      chatWindow.scrollTop(chatWindow.prop("scrollHeight"));
      //Clear input bar
      messageToSend = "";
      $(".m",this).val(messageToSend);
      return false;
    });


    //TODO: Play sound(optional) on message, add notification of unread messages
    //Receive PM
    socket.on("PMsg", function(msg, sender){
      //TODO: Use "<img src=" + sender.picture + ">" for sender icon

      //TODO3: see map.js
      //If chatWindow is not already open, openNewChatWindow
      if (!isChatAlreadyOpen(sender.id) ) {
        //Open new window, don't focus on input
        //TODO: Open additional chat windows in a list contained on a small element, like in facebook.
        if (openChatWindows >= openChatWindowsLimit) {console.log("Too many chats."); return;};
        openNewChatWindow(sender.name, sender.id, false);
      };
      //TODO: Notification sound

      let targetChatWindow = $("#" + sender.id);
      let senderName = $.parseHTML('<p class="receivedMessage">' + "<b>"+ sender.name +"</b>: ");
      $( senderName ).appendTo( targetChatWindow );
      $(targetChatWindow).append($('<p class="receivedMessage">').text(msg));
      //TODO: Adjust way messages are displayed
      //Scroll to bottom
      targetChatWindow.scrollTop(targetChatWindow.prop("scrollHeight"));    
    });
  });

  $(document).ready(function(){
    function toggleShowContacts(btn, contacts){
      $(btn).click(function(){
        $(contacts).toggle("fast");
        //TODO: Do something with the style later
        //$(span).toggleClass("glyphicon glyphicon-collapse-down, glyphicon glyphicon-collapse-up"); 
        });
    };
    toggleShowContacts("#onlineTab", "#showOnlineContacts");
    toggleShowContacts("#offlineTab", "#showOfflineContacts");
    toggleShowContacts("#nearbyTab", "#showNearby");
  });