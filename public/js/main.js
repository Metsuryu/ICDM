//TODO: Limit number of chat windows to how many fit in browser window (3 on fb 4 here on my pc)
const openChatWindowsLimit = 4; //TODO: Adjust depending on screen size.
let openChatWindows = 0;

function minimizeChatWindow (parentChatWindow) {
	parentChatWindow.animate({
		height: "2em",
	}, 100, function() {
		// Animation complete.
		parentChatWindow.attr("data-min","true");
	});
}

function maximizeChatWindow (parentChatWindow) {
	parentChatWindow.animate({
		height: "340px",
	}, 100, function() {
		// Animation complete.
		parentChatWindow.attr("data-min","false");
	});
}

function positionChatWindow (sourceChatWindow, openChatWindowsContextual) {
	const chatWidth = 260;
    const contactBoxWidth = 200;
    const gap = 5;
    const rightPos = ((chatWidth + gap) *openChatWindowsContextual) + (contactBoxWidth + gap);
    sourceChatWindow.css("right", rightPos + "px"); 
}

function slideChatWindows (windowClosed) {
	let windowToSlide = ( parseInt(windowClosed) + 1);
	let emptyPlace = ( parseInt(windowClosed) - 1 );
	
	for (let i = windowToSlide; i <= (openChatWindows + 1); i++) {
		let chatToSlide = $("#"+i);
		/*openChatWindowsContextual is the empty space (emptyPlace) 
		of the windows that was just closed in this case, 
		not the actual number of open chat windows because otherwise 
		they would all slide to the last open spot (openChatWindowsLimit)*/
		positionChatWindow (chatToSlide, emptyPlace);
		//Move up the queue to slide other windows
		emptyPlace += 1;
		chatToSlide.attr("id", emptyPlace);
	};
}

//Check if chat with targetID is already on DOM
function isChatAlreadyOpen (targetID) {
	if ($("#"+targetID).length) {
		return true;
	}else{
		return false;
	};
}

//TODO: Add other parameters as I add other functionality
function openNewChatWindow (targetName, targetID, focusInput) {
	let thisChatWindow = openChatWindows + 1;
	//TODO: Adjust attributes
	//TODO: Add "options" gear on header, to add/remove/block contact, etc... 
	//TODO: Transpile with babel to allow backtick (`)
	let sourceChatWindow = $(`
<div id="" class="chatWindow" data-min="">
    <div class="chatWindowHeader">
        <span id="chatUserName">User</span>
        <span class="chatCloseButton">x</span>
    </div>
    <ul class="messages" id="selectedMessagesWindow"></ul>
    <form id="chatForm" action="">
        <input class="m" autocomplete="off" placeholder="Type something and press enter." />
    </form>
</div>	
	 `);
	sourceChatWindow.find("#chatUserName").html(targetName + thisChatWindow); //TODO: Test, remove thisChatWindow
	sourceChatWindow.find("#chatForm").attr("data-pmid", targetID);
	sourceChatWindow.find(".messages").attr("id",targetID);
	sourceChatWindow.attr("id",thisChatWindow);
	sourceChatWindow.attr("data-min","false");

    //Open new window here
    positionChatWindow(sourceChatWindow, openChatWindows);
    $("body").append(sourceChatWindow);
    if (focusInput) {
    	sourceChatWindow.find("input").focus();
    };
    openChatWindows += 1;
}

//Allow only one chatWindow per contact
//Checks if chatWindow is already open and if not call openNewChatWindow, 
//if focusInput is true, puts the cursor on the chat input.
function openChatWindow(targetName, targetID, focusInput) {
    if ( isChatAlreadyOpen(targetID) ) {
    	if (focusInput) {
    		let chatWinPar = $("#"+targetID).parent();
    		//If maximized, just focus
    		let isMin = chatWinPar.attr("data-min");
    		if (isMin === "false" ) {
    			chatWinPar.find("input").focus();
    		} 
    		else if (isMin === "true") {
    		//Maximize and focus
    		maximizeChatWindow(chatWinPar);
    		chatWinPar.find("input").focus();
    		};
    	};
	}else{
    	//Open new window
    	//TODO: Open additional chat windows in a list contained on a small element, like in facebook.
    	//For now, just return
    	if (openChatWindows >= openChatWindowsLimit) {console.log("Too many chats."); return;};
    	openNewChatWindow(targetName, targetID, focusInput);
    };
}

function isEmailInArray (inputArray, email) {

	for (let i = inputArray.length - 1; i >= 0; i--) {
		if (inputArray[i].email === email) {
			return true;
		}
	}
	return false;
}

//TODO: Put these on a separate .js file later ## Contacts managment ##
//TODO: addContact
function addContact(){
	//TODO: Get contact data of the contact that was clicked on

	//TODO: Do ajax to add this contact to the user's contacts	
    $.ajax({
    	type: "PUT",
        url: "/addContact",
        data: {
        	userID: user._id,
          	contact: contactData //TODO: this
        },
        success: function() {
          console.log("Contact added.");
        },
        error: function(err){
          console.log("Error: " , err);
        },
        complete: function(){
        }
    });
}
//TODO: removeContact
function removeContact(){
	//TODO: Get contact data of the contact that was clicked on
	//TODO: Do ajax 
}
//TODO: blockUser
function blockUser(){
	//TODO: Get contact data of the contact that was clicked on
	//TODO: Do ajax 
}
//TODO: unblockUser
function unblockUser(){
	//TODO: Get contact data of the contact that was clicked on
	//TODO: Do ajax 
}



let app = angular.module("ICDM", [])
.filter("isContact", function() {
	return function(input,contactsArray,polarity) {
		input = input || "";
		contactsArray = contactsArray || [];
		var out = [];
		angular.forEach(input, function (value, key) {
			//Returns -1 if the item is not in the array
			//If the polarity is true, it returns all the items that are in both arrays
			//console.log(isEmailInArray( contactsArray, value.email ));
			if (polarity === true) {
				if ( isEmailInArray( contactsArray, value.email ) ) {
					out.push(value);
				}
			/*
				if ( contactsArray.indexOf( input[key].email ) != -1) {
					console.log(value);
					out.push(value);
					}
			*/		
			//If the polarity is false, it returns all the items that are only in one array
			}else if (polarity === false) {
				if ( ! isEmailInArray( contactsArray, value.email ) ) {
					out.push(value);
				}
				/*
				if ( contactsArray.indexOf( input[key].email ) === -1) {
					console.log(value);
					out.push(value);
					}
				*/
				};
		});
		//Array of items in input that are also in contactsArray
		return out;
  };
});


app.controller("ctrl", function($scope, $http, $interval) {
	function setLocalContacts () {
		$scope.localContacts = user.contacts;
	}
	if (user.contacts) {
		setLocalContacts();
	}else{
		$interval(setLocalContacts, 1000);
	}

	function setSessionID () {
		$scope.ssID = sessionID;
	}
	if (sessionID) {
		setSessionID();
	}else{
		$interval(setSessionID, 1000);
	}
	
	//Gets the online contacts form the server
	function updateContactsList () {
		$http({
			url: "/contacts",
			method: "GET"
		}).then(function (response) {
			$scope.contactsListGET = response.data;
			usersOnline = $scope.contactsListGET;
		});
	}
	updateContactsList();
	//Update the list periodically.
	$interval(updateContactsList, 5000);//TODO: Adjust time
});

$(document).ready(function(){
	//Open chat window when clicking on contact
	$("#contactsBox").on("click", ".contactClass", function(event){		
		let targetAttrs = event.target;
		let targetName = targetAttrs.innerText;
		//Private chat to this ID
		let targetID = targetAttrs.getAttribute("data-contactid");
		//Use this picture in chat
		//console.log(targetAttrs.getAttribute("data-contactPicture"));
		//Display this email if public && !empty
		//console.log(targetAttrs.getAttribute("data-contactEmail"));

    	openChatWindow(targetName, targetID, true);
	});

	//Closes chat window, and slide remaining windows in proper position.
	$("body").on("click", ".chatCloseButton", function(event){
		//Parent of chatCloseButton is chatWindowHeader, and its parent is chatWindow
		let parentChatWindow = $(event.target).parent().parent();
		let thisWindowID = parentChatWindow.attr("id");
		parentChatWindow.remove();
    	openChatWindows -= 1;
    	/*
    	If the closed window wasn't the last one open and there are still open windows
    	and slide remaining windows if any.
    	*/
    	/*TODO: Also check if there are other "minimized" windows that 
    	need to be added to the chatBar when implemented*/
    	if ( (openChatWindows + 1)  > thisWindowID) {
    		slideChatWindows(thisWindowID);
    	}
	});

	//Min/max chat window
	$("body").on("click", ".chatWindowHeader", function(event){
		//Parent of chatWindowHeader is chatWindow
		let parentChatWindow = $(event.target).parent();
		let thisWindowID = parentChatWindow.attr("id");
		let isMin = parentChatWindow.attr("data-min");

		//Note: isMin is a string
		if (isMin === "false") {
			minimizeChatWindow (parentChatWindow);
		}else if (isMin === "true") {
			maximizeChatWindow (parentChatWindow);
		};
		
	});

	//Minimize and maximize contactsBox
	let contactsMinimized = false;
	$( "#contactsHandle" ).click(function() {
		if (!contactsMinimized) {
			$( "#contactsBox" ).animate({
				height: "1.5em",
			}, 100, function() {
				// Animation complete.
				contactsMinimized = true;
			});
		}else{
			$( "#contactsBox" ).animate({
				height: "50%",
			}, 100, function() {
				// Animation complete.
				contactsMinimized = false;
			});
		}
	});




});