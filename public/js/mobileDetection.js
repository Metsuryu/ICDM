let isMobile = false;

function enableMobileMode(){
	isMobile = true;
	//Show menu only on mobile. menuButtons is necessary so that when selecting a language, the menu doesn't close.
	let menuDiv = '<div id="menu" class="fa fa-bars" aria-hidden="true"> </div> <div id="menuButtons"></div>'
	//NOTE: Order of the following is important
	$("#headerButtons").hide();
	$("#headerButtons").addClass("headerButtonsMobile");
	$("#logout").css("float","none");
	$("#header").append(menuDiv);
	$("#menuButtons").append( $("#headerButtons") );
	$("#header").css("height", "3em");
	$("#menuButtons").css("position","absolute");
	$("#header a").addClass("headerMobileA");
	$("#contactsBox").addClass("contactsBoxMobile");
	$("#contactsHandle").addClass("contactsHandleMobile");
}

$(document).ready(function(){
	//?TODO: Better Mobile detection if there are problems. Should be good according to Mozilla.
	if (/Mobi/.test(navigator.userAgent)) {
		enableMobileMode();
  	}

  	$("body").on("click", "#menu", function(event){
		$("#headerButtons").toggle();
	});
});