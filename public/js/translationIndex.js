let localLanguage = "Eng";

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
	//Body
	$( "html" ).attr( "lang", "en" );
	$("#bgLogo").attr("src","/img/underwaterLogoENG.png");
	$("#loginLabel").text("Login or Register with:");
	$("#ppolLabel").text("Privacy policy");
	$("#tosLabel").text("Terms of service");
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
	//Body
	$( "html" ).attr( "lang", "it" );
	$("#bgLogo").attr("src","/img/underwaterLogoITA.png");
	$("#loginLabel").text("Entra o Registrati con:");
	$("#ppolLabel").text("Informativa sulla privacy");
	$("#tosLabel").text("Termini e condizioni");
}

$(document).ready(function(){
	//TODO: Better Mobile detection
	if (/Mobi/.test(navigator.userAgent)) {
		console.log("Is Mobile");

		//Show menu only on mobile. menuButtons is necessary so that when selecting a language, the menu doesn't close.
		let menuDiv = '<div id="menu" class="fa fa-bars" aria-hidden="true"> </div> <div id="menuButtons"></div>'
		$("#headerButtons").hide();
		$("#header").append(menuDiv);
		$("#menuButtons").append( $("#headerButtons") );
		$("#header").css("height","3em");
		$("#menuButtons").css("position","absolute");
		$("#header a").css("display","block");
		$("#header a").css("border","1px solid black");
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
    		$("#langSelector").append(menu);
		};
	});

	$("body").on("click", "#menu", function(event){
		$("#headerButtons").toggle();
	});

});