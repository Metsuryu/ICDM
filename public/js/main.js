let contactsMinimized = false;
let usersOnlineNumber = "";
//Is adjusted depending on window width.
let openChatWindowsLimit = 1;
//Sets the limit of how many chatWindows can be open at any time. (openChatWindowsLimit)
function setOpenWindwosLimit (){
	const screenWidth = $(window).width();
	const chatWidth = 260;
    const contactBoxWidth = 200;
    const gap = 5;
    const resultLimit = Math.floor( (screenWidth-contactBoxWidth)/(chatWidth+gap) );
    /*If less than two chatWindows can fit, set the limit to one, 
    regardless of the actual number since the page will have a different interface anyway.*/
    if (resultLimit < 2) {
    	openChatWindowsLimit = 1;
    //Otherwise use the limit based on screen width
    }else{
    	openChatWindowsLimit = resultLimit;
    };
}
setOpenWindwosLimit ();
//Number of open chatWindows open at any time
let openChatWindows = 0;
//Users that sent messages not yet read
let hasUnreadMessages = [];
/*
  Origin and destination coordinates to calculate the distance, and
  callback and callerWindowID to update the distance on the target window.
*/
function getDistanceGoogleAPI(oriLatLng, destLatLng, callback, callerWindowID){
	let distanceService = new google.maps.DistanceMatrixService();
	distanceService.getDistanceMatrix({
		origins: [oriLatLng],
		destinations: [destLatLng],
		travelMode: "DRIVING" //Supposed to be optional, but apparently is required
	}, function (response, status){
		/*If status is not "OK", it could mean the usage rate was exceeded, 
		so the local distance algorithm is used instead*/
		if (status === "OK") {
			/*There should only be 1 element, so there
			is no need for a loop to iterate the results.*/
			let results = response.rows[0].elements[0];
			if (results.status === "OK") {
				let distance = results.distance.text;
    			callback(distance, callerWindowID);
			};
    	};
    });	
}

/*This function calculates great-circle distances between the two points 
– that is, the shortest distance over the earth’s surface – using the ‘Haversine’ formula.*/
function deg2rad(deg) {
  return deg * (Math.PI/180)
}
/*Use when the Google Distance API fails 
since Google's API is limited to 2500 requests per day*/
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  let R = 6371; // Radius of the earth in km
  let dLat = deg2rad(lat2-lat1);  // deg2rad above
  let dLon = deg2rad(lon2-lon1); 
  let a = 
  Math.sin(dLat/2) * Math.sin(dLat/2) +
  Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
  Math.sin(dLon/2) * Math.sin(dLon/2)
  ; 
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  let d = R * c; // Distance in km (In linea d'aria)
  //Round to 2 decimals
  return d;
}

function minimizeChatWindow (parentChatWindow) {
	parentChatWindow.animate({
		height: "2em",
	}, 100, function() {
		// Animation complete.
		parentChatWindow.attr("data-min","true");
	});
	parentChatWindow.find(".chatSettings").toggle();
}

function maximizeChatWindow (parentChatWindow) {
	parentChatWindow.animate({
		height: "340px",
	}, 100, function() {
		// Animation complete.
		parentChatWindow.attr("data-min","false");
	});
	parentChatWindow.find(".chatSettings").toggle();
}

//Places the newly open chatWindow in the correct position
function positionChatWindow (sourceChatWindow, openChatWindowsContextual) {
	const chatWidth = 260;
    let contactBoxWidth = 200;
    if (isMobile) {
    	contactBoxWidth = 0;
    };
    const gap = 5;
    const rightPos = ((chatWidth + gap) *openChatWindowsContextual) + (contactBoxWidth + gap);
    sourceChatWindow.css("right", rightPos + "px"); 
}

//Slides chatWindows in position when one is closed
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
function isChatAlreadyOpen (targetUniqueID) {
	if ($("#"+targetUniqueID).length) {
		return true;
	}else{
		return false;
	};
}

function openNewChatWindow (targetName, targetPic, targetID, targetUniqueID, targetLat, targetLng, isHistory, focusInput) {
	if (!targetPic) {
		targetPic="/img/noPic.jpg";
	};
	let thisChatWindow = openChatWindows + 1;
	let jqTargetID = "#" + targetUniqueID;
	let distUnknownLabel = "";
	let distLabel = "";
	let sourceChatWindow = $(`
<div id="" class="chatWindow" data-min="false">
    <div id="" class="chatWindowHeader">
        <span class="chatUserName">User</span>
        <span class="chatCloseButton">x</span>
        <span class="fa fa-cog chatSettings"></span>
    </div>
    <ul class="messages"></ul>
    <form class="chatForm" action="">
        <input class="m" autocomplete="off" placeholder="Type something and press enter." />
    </form>
</div>	
	 `);
	sourceChatWindow.find(".chatUserName").html(targetName);
	sourceChatWindow.find(".chatForm").attr("data-pmid", targetID);
	sourceChatWindow.find(".chatForm").attr("data-pmuid", targetUniqueID);
	sourceChatWindow.find(".chatWindowHeader").attr("id", targetUniqueID);
	sourceChatWindow.find(".messages").attr("id",targetID);
	sourceChatWindow.attr("id",thisChatWindow);

	if (isHistory) {
		sourceChatWindow.find(".m").attr("disabled", "disabled");
	}

	//Add send button on mobile
	if (isMobile) {
		let sendButton = '<span id="sendButton" class="fa fa-paper-plane"></span>';
		sourceChatWindow.find("input").after(sendButton);
		sourceChatWindow.find(".chatForm").addClass("formMobile");
		sourceChatWindow.find("input").addClass("inputMobile");
	}

	//Translate chatWindow and components
	if (localLanguage === "Ita") {
		distLabel = "Distanza"
		distUnknownLabel = "Sconosciuta <a target='_blank' href='/faqita#distance'>(?)</a>";
		sourceChatWindow.find("input").attr("placeholder","Digita qualcosa e premi invio.");
    }else{
    	distLabel = "Distance";
    	distUnknownLabel = "Unknown <a target='_blank' href='/faq#distance'>(?)</a>";
    }

    //Open new window here
    positionChatWindow(sourceChatWindow, openChatWindows);
    $("body").append(sourceChatWindow);
    if (focusInput) {
    	sourceChatWindow.find("input").focus();
    };
    openChatWindows += 1;


    //Remove notification icon if present
    for (let i = hasUnreadMessages.length - 1; i >= 0; i--) {
    	if (hasUnreadMessages[i].uniqueID === targetUniqueID ) {
    		hasUnreadMessages.splice(i, 1);
		};
	}
    $("[data-contactUID="+ targetUniqueID +"]").find($("span")).remove();
    //Remove unread icon from contactsBox if hasUnreadMessages is empty
    if (hasUnreadMessages.length === 0) {
    	$("#contactsSpan").find($("span")).remove();
    }    

    //If one of the users has no coordinates, show "unknown" as distance.
    let profilePic = '<img class="profilePic" src="' + targetPic + '">';
    let distanceInKm = "";
    //Chat history
    //Uses targetUniqueID instead of targetID, so it's permanent across sessions
    let chatHistoryLabel = "ChatHistoryCookie " + targetUniqueID;
    let chatHistory = Cookies.getJSON(chatHistoryLabel) || "";
    chatHistory = chatHistory.history || "";
    $(sourceChatWindow).find(".messages").html(chatHistory + "<br>");

    if ( (!targetLat && !targetLng) || (!user.lat && !user.lng) ) {

    	distanceInKm = distUnknownLabel;

    	//Profile picture without distance
    	if (!isHistory) {
    		$(sourceChatWindow).find(".messages").append($('<div class="infoMsg">').html(
    			profilePic + "<p>"+distLabel+": <span id='distanceSpan'>" + distanceInKm + "</span> </p>"
    		));
    	};
    }else{
    	/*Wait for async getDistanceGoogleAPI to run the callback, and in the meantime use 
    	  the less precise getDistanceFromLatLonInKm that will be replaced 
    	  by the callback value if successful.
    	*/
    	distanceInKm = getDistanceFromLatLonInKm(user.lat, user.lng, targetLat, targetLng).toFixed(2) + " Km";
    	//Profile picture and distance
    	if (!isHistory) {
    		$(sourceChatWindow).find(".messages").append($('<div class="infoMsg">').html(
    			profilePic + "<p>"+distLabel+": <span id='distanceSpan'>" + distanceInKm + "</span> </p>"
    		));
    	};
    	//Called if getDistanceGoogleAPI is successful, updates the distance to be more accurate.
    	function updateDistanceCB(distance, callerWindowID){
    		let spanToModify = $(callerWindowID).find("#distanceSpan");
    		spanToModify.text(distance);
    	};
    	let origin = new google.maps.LatLng(user.lat, user.lng);
    	let destination = new google.maps.LatLng(targetLat, targetLng);
    	getDistanceGoogleAPI(origin, destination, updateDistanceCB, jqTargetID );
    };    
    //Scroll to bottom of chat here.
    let targetChatWindow = $(jqTargetID).parent().find(".messages");
    $(targetChatWindow).scrollTop(targetChatWindow.prop("scrollHeight"));
}

//Allow only one chatWindow per contact
//Checks if chatWindow is already open and if not call openNewChatWindow, 
//if focusInput is true, puts the cursor on the chat input.
function openChatWindow(targetName, targetPic, targetID, targetUniqueID, targetLat, targetLng, isHistory, focusInput) {
    if ( isChatAlreadyOpen(targetUniqueID) ) {
    	if (focusInput) {
    		let chatWinPar = $("#"+targetUniqueID).parent();
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
    	//Open new chatWindow
    	if (openChatWindows >= openChatWindowsLimit) {
    		//Too many chat windows. 
    		/*If there are too many chats open, a message notification gets added next to the
    		  contact name on the contactsBox, and received messages are added to chat history.
    		  When a chat with notification is opened, the notification is removed.*/

    		/*When the openChatWindowsLimit is met, and the user tries to open a new chat, 
    		  all currently open chatWindows are closed, and the new one is opened.
    		  If focusInput is true, it means the user is trying to open a new window, 
    		  otherwise it means that the window is being opened by a received 
    		  message, so existing chats shouldn't be closed, and a notification is added instead.*/
    		if (focusInput) {
    			closeAllOpenChatWindows();
    		}else{
    			return;
    		};
    	};
    	openNewChatWindow(targetName, targetPic, targetID, targetUniqueID, targetLat, targetLng, isHistory, focusInput);
    };
}

//Closes all open chat windows
function closeAllOpenChatWindows() {
	$(".chatWindow").remove();
	openChatWindows = 0;
}

//Remove #_=_ in url after facebook login
function removeFBUrlHash() {
	if (window.location.hash == "#_=_"){
		history.replaceState
		? history.replaceState(null, null, window.location.href.split('#')[0])
        : window.location.hash = "";
    }
}

let app = angular.module("ICDM", []);

app.controller("ctrl", ["$scope", "$http", "$interval", function($scope, $http, $interval) {
	//Set session and unique ID as soon as they are available
	function setSessionID () {
		if (sessionID) {
			$scope.ssID = sessionID;
		}else{
			$interval(setSessionID, 1000);
		}
	}
	setSessionID();

	function setUniqueID () {
		if (user._id) {
			$scope.uID = user._id;
		}else{
			$interval(setUniqueID, 1000);
		}
	}
	setUniqueID();

	function updateChatHistoryList(){
		//Read all chat histories, and put them in contacts box
		let chatHistoryList = [];
		let allCookies = Cookies.get();
		let startString = "ChatHistoryCookie ";
		for (var key in allCookies) {
			if ( key.startsWith(startString) ) {
				let keyUID = key.substring(startString.length);
				let keyJson = Cookies.getJSON(key);
				keyJson.UID = keyUID;
				chatHistoryList.push(keyJson);
			};
		};
		$scope.historyList = chatHistoryList;
	}


	//Gets the online contacts form the server
	function updateContactsList () {
		$http({
			url: "/contacts",
			method: "GET"
		}).then(function (response) {
			let tempContactList = response.data;
			/*Adds "unreadMessages" property if the contact
			  is in hasUnreadMessages array*/
			for (let i = tempContactList.length - 1; i >= 0; i--) {
				for (let j = hasUnreadMessages.length - 1; j >= 0; j--) {
					if (tempContactList[i].uniqueID === hasUnreadMessages[j].uniqueID ) {
						tempContactList[i].unreadMessages = true;
					};
				}
			}
			$scope.contactsListGET = tempContactList;
			usersOnline = $scope.contactsListGET;
			$scope.usersOnlineNumber = (usersOnline.length).toString();
		});
	}
	updateContactsList();
	updateChatHistoryList();
	//Update the lists periodically.
	$interval(updateContactsList, 10000);//10 Seconds
	$interval(updateChatHistoryList, 60000);//60 Seconds

}]);

$(document).ready(function(){
	if (isMobile && !contactsMinimized) {
		toggleContactsBox();
	};
	removeFBUrlHash();

	$("body").on("click", "#sendButton", function(event){
		let thisInput = $(event.target).parent().find("input");
		thisInput.focus();
		thisInput.submit();
	})
	
	//Open chat window when clicking on contact
	$("#contactsBox").on("click", ".contactClass", function(event){
		let targetAttrs = event.target;
		let targetName = targetAttrs.innerText;
		let targetID = targetAttrs.getAttribute("data-contactid");
		let targetUniqueID = targetAttrs.getAttribute("data-contactUID");
		let targetPic = targetAttrs.getAttribute("data-contactPicture");
		let targetLat = Number( targetAttrs.getAttribute("data-contactLat") );
		let targetLng = Number( targetAttrs.getAttribute("data-contactLng") );

		let isHistory = targetAttrs.getAttribute("data-history");

    	openChatWindow(targetName, targetPic, targetID, targetUniqueID, targetLat, targetLng, isHistory, true);
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
    	if ( (openChatWindows + 1)  > thisWindowID) {
    		slideChatWindows(thisWindowID);
    	}
	});

	//Open settings menu
	$("body").on("click", ".chatSettings", function(event){
		let target = $(event.target);

		let deleteLabel = "Delete chat history";
		if (localLanguage === "Ita") {
			deleteLabel = "Elimina cronologia";
		};
		let settingsMenu = $('\
			<div class="settings">\
			<p> <span class="fa fa-trash-o"></span> '+deleteLabel+'</p> </div>');
		if (target.find(".settings").length ) {
			target.find(".settings").remove();
		}else{
			target.append(settingsMenu);
		};
	});
	//Confirm to delete chat history
	$("body").on("click", ".settings", function(event){
		/*parent's parent is needed to ensure the next 
		click on the cog icon opens the settings properly*/
		let cog = $(event.target).parent().parent();
		cog.find(".settings").remove();
		let confirmMessage = "Delete chat history?\n\
By doing so, you will only delete the chat history saved on this device.";
		if (localLanguage === "Ita") {
			confirmMessage = "Eliminare la cronologia?\n\
La cronologia verrà eliminata solo sul tuo dispositivo.";
		}
		//Confirm
		let conf = confirm(confirmMessage);
		if (conf) {
			let thisWindow = cog.parent().parent();
			let thisWindowUID = thisWindow.find(".chatForm").attr("data-pmuid");
			let cookieToRemove = "ChatHistoryCookie " + thisWindowUID;
			//Delete chat history
			Cookies.remove(cookieToRemove);
			//Empty messages.
			thisWindow.find(".messages").empty();
		};
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
	function toggleContactsBox() {
		if (!contactsMinimized) {
			$( "#searchField").addClass("searchFieldMinimized");
			//Addclass doesn't work on contactsBox
			$( "#contactsBox" ).css("padding-bottom","0");
			$( "#contactsBox" ).css("overflow","hidden");
			if (isMobile) {
				$( "#contactsBox" ).animate({
					height: "2em",
				}, 100, function() {
					// Animation complete.
					contactsMinimized = true;
				});
			}else{
				$( "#contactsBox" ).animate({
					height: "1.5em",
				}, 100, function() {
					// Animation complete.
					contactsMinimized = true;
				});
			};
		}else{
			$( "#searchField").removeClass("searchFieldMinimized");
			$( "#contactsBox" ).css("padding-bottom","4em");
			$( "#contactsBox" ).css("overflow","initial");
			$( "#contactsBox" ).animate({
				height: "50%",
			}, 100, function() {
				// Animation complete.
				contactsMinimized = false;
			});
		}
	}
	
	$( "#contactsHandle" ).click(function() {
		toggleContactsBox();
	});

	$("#onlineTab").click(function() {
		$("#contactsList").toggle();
	});

	$("#offlineTab").click(function() {
		$("#offlineList").toggle();
	});

});