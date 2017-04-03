const User = require("./models/user");
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });


/*
function sanitizeString(str){
  str = str.replace(/([/\\<>"'&])+/g,"");
  return str.trim();
};
*/

module.exports = function(app, passport, Contact){

	app.get("/login", function(req, res){
		res.render("index.ejs");
	});

	app.get("/", isLoggedIn, function(req, res){
		res.render("home.ejs", { user: req.user });
	});

	app.get("/auth/facebook", passport.authenticate("facebook", {scope: ["email"]}));

	app.get("/auth/facebook/callback", 
	  passport.authenticate("facebook", { successRedirect: "/",
	                                      failureRedirect: "/login" }));

	app.get("/auth/google", passport.authenticate("google", {scope: ["profile", "email"]}));

	app.get("/auth/google/callback", 
	  passport.authenticate("google", { successRedirect: "/",
	                                      failureRedirect: "/login" }));


	app.put("/updateUserCoordinates", urlencodedParser, function(req,res){
		const userID = req.body.userID;
		const newLat = req.body.lat;
		const newLng = req.body.lng;
		//TODO: contacts test, remove
		const contactsTest = [
		{"id":"2jhtRobmdDUFZhCtAAAF","name":"Mario Cannistrà","picture":"https://lh5.googleusercontent.com/","email":"bagea@gmail.com"},
		{"id":"2jhtRobmdAAAZhCtAAAF","name":"Orlumbus Rorar","picture":"https://something.com","email":"fuusx@gmail.com"}
		]

		User.update(
			{ "_id" : userID },
			{
			$set: {	lat: newLat, lng: newLng, contacts:contactsTest }, //TODO: contacts test, remove
			}, function(err, results) {
				if (err) {console.log(err);};
				});
		res.send("");
		res.end();
		});

	//Returns the list of online contacts
	app.get("/contacts",function(req, res){
		let contactsArray = [];

    	Contact.find(function(err, contacts) {
    		if(err) return console.error(err);
    		//JSON
    		contacts.forEach(function (contact, i) {
    			contactsArray.push({
    				id: contact.userID,
    				name: contact.userName,
    				picture: contact.userPicture,
    				email: contact.userEmail
    				});
    			});
    		res.json( contactsArray );
    		});
    	});

	app.get("/logout", function(req, res){
		req.logout();
		res.redirect("/");
	})

	app.get("*", function(req, res){
		res.send(404);
	})

};

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	}

	res.redirect("/login");
}