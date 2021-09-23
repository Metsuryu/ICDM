const compression = require("compression");
const express = require("express");
const port = process.env.PORT || 3000;
const app     = express();
const server  = require("http").createServer(app);
const io      = require("socket.io").listen(server);
const cookieParser = require("cookie-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
//Random secret generated at server startup
const randSecret = require("crypto").randomBytes(8).toString("hex");
const path = require("path");
const configDB = require("./config/database.js");

// mongoose.set('useUnifiedTopology', true);

//To fix the deprecated promise issue use native promises here, like so:
//global.Promise is only supported in ES6
mongoose.Promise = global.Promise;


mongoose.connect(configDB.url, {useNewUrlParser: true});
require("./config/passport")(passport);
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
	secret: randSecret,
	cookie: { maxAge: 604800000 },// 1 week in ms
	saveUninitialized: true,
	resave: false})); //For persistent login when closing browser
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(express.static(path.join(__dirname, "/public")));
app.set("views", __dirname + "/public/views");
app.set("view engine", "ejs");

const Contact = require("./app/models/contact");
require("./app/routes.js")(app, passport, Contact);

function addOnlineContact (userData) {
	if (!userData) {
		console.log("Error: Can't get userData");
		return;
	};
	Contact.findOne({"userID": userData.socketID}, function(err, contact){
		if(err){
			return err;
		};
		if(contact){
			return;
		} else {
			let newContact = new Contact();
			newContact.uniqueID = userData.uniqueID;
			newContact.userID = userData.socketID;
			newContact.userName = userData.name;
			newContact.userPicture = userData.picture;
			newContact.lat = userData.lat;
			newContact.lng = userData.lng;

			newContact.save(function(err){
				if(err) { console.log(err); };
				return;
			});
		};
		//console.log("\x1b[33m%s\x1b[0m:","Contact added.");
	});
}

//Find the first valid SID matching the UID, and send the msg there.
function findContactSID(contactUID, msg, sender, emitPMsg){
	Contact.findOne({"uniqueID": contactUID}, function(err, contact){
		if(err){return err;};
		if(contact){
			let foundSID = contact.userID;
			emitPMsg(foundSID, msg, sender);
			return;
		}
	});
}

function updateOnlineContactCoords (userData) {
	if (!userData) {
		console.log("Error: Can't get userData");
		return;
	};
	Contact.findOne({"uniqueID": userData.uniqueID}, function(err, contact){
		if(err)
			return err;
		if(contact){
			const userID = userData.uniqueID;
			const newLat = userData.lat;
			const newLng = userData.lng;
			Contact.update(
				{ "uniqueID" : userID },
				{
					$set: {	lat: newLat, lng: newLng },
				}, function(err, results) {
					if (err) {console.log(err);};
					//console.log(results);
				});
		} else {
			return;
		}
		//console.log("\x1b[33m%s\x1b[0m:","Contact updated.");
	});
}

function removeOnlineContact (socket) {
	const idToRemove = socket.id;
	//Add users to online by userID, and remove them by uniqueID, to avoid duplicates
	Contact.findOne({"userID": idToRemove}, function(err, contact){
		if(err)
			return err;
		if(contact){
			/*Remove contact from online by uniqueID, to remove all
			potential duplicates with same uniqueID but different sessionID
			that can remain when the server is restarted*/
			Contact.remove({"uniqueID": contact.uniqueID}, function(err, results){
				if (err) {
					console.log(err);
					return;
				};
				//console.log("\x1b[33m%s\x1b[0m","Contact removed.");
				return;
			});
		} else {
			return;
		}
	});
}

//Send logoutEveryClient to every client's SID with matching UID.
function disconnectAllClientsWithSameUID (socket) {
	const SIDToFind = socket.id;
	Contact.findOne({"userID": SIDToFind}, function(err, contact){
		if(err)
			return err;
		if(contact){
			let contactUID = contact.uniqueID;
			Contact.find({"uniqueID": contactUID}, function(err, users) {

				users.forEach(function(user) {
					socket.to(user.userID).emit("logoutEveryClient");
				});
			});
		} else {
			return;
		}
	});
	//Then remove them from online list
	removeOnlineContact(socket);
}

//Whenever someone connects this gets executed
io.on("connection", function(socket){
	//Gives the connected user their sessionID
	socket.emit("sessionID", { id: socket.id });

  	socket.on("updateOnline", function (userData) {
  		//Adds user to "online" users
  		addOnlineContact (userData);
  	});

  	socket.on("updateOnlineContactCoords", function (userData) {
  		//Updates user's coordinates
  		updateOnlineContactCoords (userData);
  	});

  	socket.on("disconnect", function () {
  		/*Removes user from "online" users
  		Also emits logoutEveryClient to all SIDs with matching UID that were online
  		*/
  		disconnectAllClientsWithSameUID (socket);
  	});

  	socket.on("PM", function(uid, msg, sender ) {
  		//Send a private message to the socket with the given uid
  		findContactSID(uid, msg, sender, emitPMsg); //Is Async so needs callback emitPMsg
    });
    //Invoked when findContactSID executes callback
    function emitPMsg(sID, msg, sender){
    	socket.to(sID).emit("PMsg", msg, sender );
    }

  	socket.on("received", function(toID, fromUID) {
  		// Acknowledge received message
    	socket.to(toID).emit("receivedOK", fromUID);
    });
});

//Do not use app.listen(port);
server.listen(port);

console.log("Server running on port: " + port);

