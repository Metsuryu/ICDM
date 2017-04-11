function toEn () {
	//TODO:
	Cookies.set("Lang", "Eng");
	//Cookies.get("Lang");
}



function toIt () {
	//TODO:
	Cookies.set("Lang", "Ita");
	//Cookies.get("Lang");
}

$(document).ready(function(){
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
});