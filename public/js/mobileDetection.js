let isMobile = false;

function enableMobileMode(){
	isMobile = true;
	//Show menu only on mobile. menuButtons is necessary so that when selecting a language, the menu doesn't close.
	let menuDiv = '<div id="menu" class="fa fa-bars"> </div> <div id="menuButtons"></div>'
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
  	}else{
  		const screenWidth = $(window).width();
		const chatWidth = 260;
    	const contactBoxWidth = 200;
    	const gap = 5;
    	const resultLimit = Math.floor( (screenWidth-contactBoxWidth)/(chatWidth+gap) );
    	/*If less than one chatWindows can fit, enable mobile mode.*/
    	if (resultLimit < 1) {
    		enableMobileMode();
    	};
  	}

  	$("body").on("click", "#menu", function(event){
		$("#headerButtons").toggle();
	});
});