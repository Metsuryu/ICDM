const mongoose = require("mongoose");

//TODO: Maybe add public profile link
const contactSchema = mongoose.Schema({
	uniqueID: String, //Same for all sessions
	userID: String,   //Changes each session
	userName: String,
	userPicture: String,
	userEmail: String,
	lat: Number,
	lng: Number
});

module.exports = mongoose.model("Contact", contactSchema);