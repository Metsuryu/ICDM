//TODO: Make separate translation file for home page.
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

		//Show menu only on mobile
		let menuDiv = '<div id="menu" class="fa fa-bars" aria-hidden="true"></div>'
		$("#headerButtons").hide();
		$("#header").append(menuDiv);
		$("#menu").append( $("#headerButtons") );
		$("#header").css("height","3em");
		$("#menu").css("position","absolute");
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