let localLanguage = "Eng";

function toEn () {
	//console.log("To ENG");
	Cookies.set("Lang", "Eng", { expires: 7 } );
	//Header bar
	$("#langFlag").attr("src","img/flags/us.gif");
	$("#langFlag").attr("alt","English/US");
	$("#aboutusLabel").text("About us");
	$("#fbGroupLabel").text("Facebook group");
	$("#langLabel").text("Language");
	$("#contLabel").text("Contact us");
	$("#donateLabel").text("Donate");
	$("#logoutLabel").text("Logout");
	//Links
	$("#aboutusLink").attr("href","/aboutus");
	$("#faqLink").attr("href","/faq");
	$("#contactusLink").attr("href","/contactus");
	$("#donateLink").attr("href","/donate");
	//Body
	if (isMobile) {
		//Labels are too long for mobile
		$("#topMap").css("height","4.5em");
		$("#eraseLabel").html("Erase<br>Location");
		$("#broadcastLabel").html("Broadcast<br>Location");
	}else{
		$("#eraseLabel").text("Erase Location");
		$("#broadcastLabel").text("Broadcast Location");
	}
	$("#contactsSpan").text("Spearfishers Online");
	$("#chatHistorySpan").text("Chat History");
	$("#searchField").attr("placeholder","🔍 Search a Spearfisher");
}

function toIt () {
	//console.log("To ITA");
	Cookies.set("Lang", "Ita", { expires: 7 } );
	//Header bar
	$("#langFlag").attr("src","img/flags/it.gif");
	$("#langFlag").attr("alt","Italiano/IT");
	$("#aboutusLabel").text("Chi siamo");
	$("#fbGroupLabel").text("Gruppo Facebook");
	$("#langLabel").text("Lingua");
	$("#contLabel").text("Contattaci");
	$("#donateLabel").text("Donazione");
	$("#logoutLabel").text("Esci");
	//Links
	$("#aboutusLink").attr("href","/chisiamo");
	$("#faqLink").attr("href","/faqita");
	$("#contactusLink").attr("href","/contattaci");
	$("#donateLink").attr("href","/donazione");
	//Body
	if (isMobile) {
		//Labels are too long for mobile
		$("#topMap").css("height","4.5em");
		$("#eraseLabel").html("Nascondi<br>Posizione");
		$("#broadcastLabel").html("Trasmetti<br>Posizione");
	}else{
		$("#eraseLabel").text("Nascondi Posizione");
		$("#broadcastLabel").text("Trasmetti Posizione");
	}
	$("#contactsSpan").text("Cecchini Online");
	$("#chatHistorySpan").text("Cronologia chat");
	$("#searchField").attr("placeholder","🔍 Cerca Cecchini");
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