let localLanguage = "Eng";

function toEn () {
	//console.log("To ENG");
	Cookies.set("Lang", "Eng", { expires: 7 } );
	localLanguage = "Eng";
	//Header bar
	$("#langFlag").attr("src","img/flags/us.gif");
	$("#aboutusLabel").text("About us");
	$("#fbGroupLabel").text("Facebook group");
	$("#langLabel").text("Language");
	$("#contLabel").text("Contact us");
	$("#donateLabel").text("Donate");
	//Links
	$("#aboutusLink").attr("href","/aboutus");
	$("#faqLink").attr("href","/faq");
	$("#contactusLink").attr("href","/contactus");
	$("#donateLink").attr("href","/donate");
	$("#ppolLabel").attr("href","/privacypolicy");
	$("#tosLabel").attr("href","/ToS");
	//Body
	$( "html" ).attr( "lang", "en" );
	$("#loginLabel").text("Login or Register with:");
	$("#ppolLabel").text("Privacy policy");
	$("#tosLabel").text("Terms of service");
	$(".alert-danger").text("Login with Facebook is temporarily disabled while we investigate an issue.");
}

function toIt () {
	//console.log("To ITA");
	Cookies.set("Lang", "Ita", { expires: 7 } );
	localLanguage = "Ita";
	//Header bar
	$("#langFlag").attr("src","img/flags/it.gif");
	$("#aboutusLabel").text("Chi siamo");
	$("#fbGroupLabel").text("Gruppo Facebook");
	$("#langLabel").text("Lingua");
	$("#contLabel").text("Contattaci");
	$("#donateLabel").text("Donazione");
	//Links
	$("#aboutusLink").attr("href","/chisiamo");
	$("#faqLink").attr("href","/faqita");
	$("#contactusLink").attr("href","/contattaci");
	$("#donateLink").attr("href","/donazione");
	$("#ppolLabel").attr("href","/informativaprivacy");
	$("#tosLabel").attr("href","/termini");
	//Body
	$( "html" ).attr( "lang", "it" );
	$("#loginLabel").text("Entra o Registrati con:");
	$("#ppolLabel").text("Informativa sulla privacy");
	$("#tosLabel").text("Termini e condizioni");
	$(".alert-danger").text("Il login con Facebook è temporaneamente disattivato a causa di problemi.");
}

$(document).ready(function(){
	//Detect cookie language, and translate if italian
	localLanguage = Cookies.get("Lang");
	/*If the cookie is set to "Ita", translate the page to Italian, 
	in any other case, keep it in english.*/

	if (localLanguage === "Ita") {
		toIt();
	}else if (localLanguage === "Eng") {
		toEn();
	}else{
		//Calls toIt if navigator's lang is ita and there are no cookies
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
});