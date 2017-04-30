//TODO

let localLanguage = "Eng";
let isMobile = false;

function toEn () {
	console.log("To ENG");
	//TODO:
	Cookies.set("Lang", "Eng");
	//Header bar
	$("#langFlag").attr("src","img/flags/us.gif");
	$("#aboutusLabel").text("About us");
	$("#fbGroupLabel").text("Facebook group");
	$("#langLabel").text("Language");
	$("#contLabel").text("Contact us");
	$("#donateLabel").text("Donate");
	$("#logoutLabel").text("Logout");
	//Body
	if (isMobile) {
		//Labels are too long for mobile
		$("#eraseLabel").text("Erase Loc.");
		$("#broadcastLabel").text("Broadcast Loc.");
	}else{
		$("#eraseLabel").text("Erase Location");
		$("#broadcastLabel").text("Broadcast Location");
	}
	$("#contactsSpan").text("Spearfishers Online");
	$("#searchField").attr("placeholder","🔍 Search a Spearfisher");
}

function toIt () {
	console.log("To ITA");
	//TODO:
	Cookies.set("Lang", "Ita");
	//Header bar
	$("#langFlag").attr("src","img/flags/it.gif");
	$("#aboutusLabel").text("Chi siamo");
	$("#fbGroupLabel").text("Gruppo Facebook");
	$("#langLabel").text("Lingua");
	$("#contLabel").text("Contattaci");
	$("#donateLabel").text("Donazione");
	$("#logoutLabel").text("Esci");
	//Body
	if (isMobile) {
		//Labels are too long for mobile
		$("#eraseLabel").text("Nascondi Pos.");
		$("#broadcastLabel").text("Trasmetti Pos.");
	}else{
		$("#eraseLabel").text("Nascondi Posizione");
		$("#broadcastLabel").text("Trasmetti Posizione");
	}
	$("#contactsSpan").text("Cecchini Online");
	$("#searchField").attr("placeholder","🔍 Cerca Cecchini");
}

$(document).ready(function(){
	//TODO: Better Mobile detection if there are problems. Should be good according to Mozilla.
	if (/Mobi/.test(navigator.userAgent)) {
		isMobile = true;
		console.log("Is Mobile");
		//Show menu only on mobile. menuButtons is necessary so that when selecting a language, the menu doesn't close.
		let menuDiv = '<div id="menu" class="fa fa-bars" aria-hidden="true"> </div> <div id="menuButtons"></div>'
		//NOTE: Order of the following is important
		$("#headerButtons").hide();
		$("#headerButtons").addClass("headerButtonsMobile");
		$("#logout").css("float","none");
		$("#header").append(menuDiv);
		$("#menuButtons").append( $("#headerButtons") );
		$("#header").css("height","3em");
		$("#menuButtons").css("position","absolute");
		$("#header a").addClass("headerMobileA");

		$("#contactsBox").addClass("contactsBoxMobile");
		$("#contactsHandle").addClass("contactsHandleMobile");
  	  }else{
    	console.log("Not Mobile");
    }

	//Detect cookie language, and translate if italian
	localLanguage = Cookies.get("Lang");
	/*If the cookie is set to "Ita", translate the page to Italian, 
	in any other case, keep it in english.*/
	//TODO: Also call toIt if navigator's lang is ita and there are no cookies
	if (localLanguage === "Ita") {
		toIt();
	}else if (localLanguage === "Eng") {
		toEn();
	}else{
		//Detect browser language by navigator if Cookie isn't available, and translate if italian
  		let userLang = navigator.language || navigator.userLanguage; 
  		if(userLang == "it-IT" || userLang == "it"){
  			toIt();
  		};
  	};


	$("#langSelector").click(function(){
		if ( $( "#langSelect" ).length ) {
			$( "#langSelect" ).remove();
		}else{
			let menu = `
			<div id="langSelect">
				<a onclick="toEn()" class="btn btn-primary btn-sm">
      			English <img src="img/flags/us.gif"> </a>
      		<br>
      			<a onclick="toIt()" class="btn btn-primary btn-sm">
      			Italiano <img src="img/flags/it.gif"> </a>
    		</div>`;
    		//Must add the class like this, since the element doesn't exist before it's added programmatically.
    		if (isMobile) {
    			menu = `
			<div id="langSelect" class="langSelectMobile">
				<a onclick="toEn()" class="btn btn-primary btn-sm">
      			English <img src="img/flags/us.gif"> </a>
      		<br>
      			<a onclick="toIt()" class="btn btn-primary btn-sm">
      			Italiano <img src="img/flags/it.gif"> </a>
    		</div>`;
    		};
    		$("#langSelector").append(menu);
		};
	});

	$("body").on("click", "#menu", function(event){
		$("#headerButtons").toggle();
	});

});