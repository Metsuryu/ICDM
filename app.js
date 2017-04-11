const express = require("express");
const port = process.env.PORT || 3000;
const app     = express();
const server  = require("http").createServer(app);
const io      = require("socket.io").listen(server);
const cookieParser = require("cookie-parser");
const session = require("express-session");
//TODO: Remove morgan
const morgan = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
//TODO: Maybe remove flash
const flash = require("connect-flash");
const randSecret = require("crypto").randomBytes(8).toString("hex");
const path = require("path");
const configDB = require("./config/database.js");

//To fix the deprecated promise issue use native promises here, like so:
// Can't use it on Cloudnode, global.Promise only supported in ES6
mongoose.Promise = global.Promise; 


mongoose.connect(configDB.url);
require("./config/passport")(passport);
//TODO: Remove morgan on release
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: randSecret,
				 saveUninitialized: true,
				 resave: true}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
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
		if(err)
			return err;
		if(contact)
			return;
		else {
			let newContact = new Contact();
			newContact.uniqueID = userData.uniqueID;
			newContact.userID = userData.socketID;
			newContact.userName = userData.name;
			newContact.userPicture = userData.picture;
			newContact.userEmail = userData.email;
			newContact.lat = userData.lat;
			newContact.lng = userData.lng;

			newContact.save(function(err){
				if(err) { console.log(err); }
				return;
			})
		}
		//console.log("\x1b[33m%s\x1b[0m:","Contact added.");
	});
}

function removeOnlineContact (socket) {
	const idToRemove = socket.id;
	//Add users to online by using userID, and remove them by uniqueID, to avoid duplicates
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
		}
		else {
			return;
		}
	});
}

//Whenever someone connects this gets executed
io.on("connection", function(socket){
	//console.log("A user connected");
	//TODO: This is emitted to every user. Use it for chatBox updates
	socket.emit("sessionID", { id: socket.id });

  	socket.on("updateOnline", function (userData) {
  		//Adds user to "online" users
  		addOnlineContact (userData);
  		});

  	socket.on("disconnect", function () {
  		//Removes user from "online" users
  		//console.log("A user disconnected");
  		removeOnlineContact(socket);
  		});

  	socket.on("PM", function(id, msg, sender){
  		// Sends a private message to the socket with the given id
    	socket.broadcast.to(id).emit("PMsg", msg, sender);
    	});

  	});

//Do not use app.listen(port);
server.listen(port);

console.log("Server running on port: " + port);