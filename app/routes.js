const User = require("./models/user");
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = function(app, passport, Contact){

	app.get("/login", function(req, res){
		res.render("index.ejs");
	});

	app.get("/", isLoggedIn, function(req, res){
		res.render("home.ejs", { user: req.user });
	});

	app.get("/auth/facebook", passport.authenticate("facebook"));

	app.get("/auth/facebook/callback", 
	  passport.authenticate("facebook", { successRedirect: "/",
	                                      failureRedirect: "/login" }));

	app.get("/auth/google", passport.authenticate("google", {scope: ["profile"]}));

	app.get("/auth/google/callback", 
	  passport.authenticate("google", { successRedirect: "/",
	                                      failureRedirect: "/login" }));


	app.put("/updateUserCoordinates", urlencodedParser, function(req,res){
		const userID = req.body.userID;
		const newLat = req.body.lat;
		const newLng = req.body.lng;

		User.update(
			{ "_id" : userID },
			{
			$set: {	lat: newLat, lng: newLng },
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
    				uniqueID: contact.uniqueID,
    				id: contact.userID,
    				name: contact.userName,
    				picture: contact.userPicture,
    				lat: contact.lat,
    				lng: contact.lng
    				});
    			});
    		res.json( contactsArray );
    		});
    	});

	app.get("/aboutus", function(req, res){
		res.render("aboutus.ejs");
	});

	app.get("/chisiamo", function(req, res){
		res.render("chisiamo.ejs");
	});

	app.get("/faq", function(req, res){
		res.render("faq.ejs");
	});
	
	app.get("/faqita", function(req, res){
		res.render("faqita.ejs");
	});

	app.get("/contactus", function(req, res){
		res.render("contactus.ejs");
	});

	app.get("/contattaci", function(req, res){
		res.render("contattaci.ejs");
	});

	app.get("/donate", function(req, res){
		res.render("donate.ejs");
	});

	app.get("/donazione", function(req, res){
		res.render("donazione.ejs");
	});

	app.get("/informativaprivacy", function(req, res){
		res.render("informativaprivacy.ejs");
	});

	app.get("/privacypolicy", function(req, res){
		res.render("privacypolicy.ejs");
	});

	app.get("/ToS", function(req, res){
		res.render("ToS.ejs");
	});

	app.get("/termini", function(req, res){
		res.render("termini.ejs");
	});

	app.get("/logout", function(req, res){
		req.logout();
		res.redirect("/");
	})

	app.get("*", function(req, res){
		//res.send(404);
		res.sendStatus(404);
	})

};

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	}

	res.redirect("/login");
}