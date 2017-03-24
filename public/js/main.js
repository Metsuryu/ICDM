//TODO: Limit number of chat windows to how many fit in browser window (3 on fb on my pc)
const openChatWindowsLimit = 4; //TODO: Adjust depending on screen size.
let openChatWindows = 0;

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

//TODO: Optimize, check if chat is already open before calling openNewChatWindow
//And don't use isChatAlreadyOpen in openNewChatWindow
//Check if chat with targetID is already open
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
	//TODO: Transpile with babel to allow backtick (`)
	let sourceChatWindow = $(`
<div id="" class="chatWindow">
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

    //Allow only one chatWindow per contact
    //Check if chat with targetID is already open
    if ( isChatAlreadyOpen(targetID) ) {
    	if (focusInput) {
    		$("#"+targetID).parent().find("input").focus();
    	};
    }else{
    	//Open new window here
    	positionChatWindow(sourceChatWindow, openChatWindows);
    	$("body").append(sourceChatWindow);
    	if (focusInput) {
    		sourceChatWindow.find("input").focus();
    	};
    	openChatWindows += 1;
    };
}

let app = angular.module("ICDM", []);

app.controller("ctrl", function($scope, $http, $interval) {
	function setSessionID () {
		$scope.ssID = sessionID;
	}
	if (sessionID) {
		$scope.ssID = sessionID;
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
		});
	}
	updateContactsList();
	//Update the list periodically.
	$interval(updateContactsList, 5000);//TODO: Adjust time
});

$(document).ready(function(){
	//Open chat window when clicking on contact
	$("#showOnlineContacts").on("click", ".contactClass", function(event){
		//TODO: Open additional chat windows in a list contained on a small element, like in facebook.
		if (openChatWindows >= openChatWindowsLimit) {console.log("Too many chats."); return;};
		let targetAttrs = event.target;
		let targetName = targetAttrs.innerText;
		//Private chat to this ID
		let targetID = targetAttrs.getAttribute("data-contactid");
		//console.log(targetAttrs.getAttribute("data-contactid"));
		//Use this picture in chat
		//console.log(targetAttrs.getAttribute("data-contactPicture"));
		//Display this email if public && !empty
		//console.log(targetAttrs.getAttribute("data-contactEmail"));

		//TODO: Optimize: Check if chatWindow is already open and if not call openNewChatWindow
		openNewChatWindow(targetName, targetID, true);
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
    	//TODO: Also check if there are other "minimized" windows that need to be added to the chatBar when implemented
    	if ( (openChatWindows + 1)  > thisWindowID) {
    		slideChatWindows(thisWindowID);
    	}
	});

});