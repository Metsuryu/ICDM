const mongoose = require("mongoose");

//TODO: Maybe add public profile link
const contactSchema = mongoose.Schema({
	userID: String,
	userName: String,
	userPicture: String,
	userEmail: String,
	lat: Number,
	lng: Number
});

module.exports = mongoose.model("Contact", contactSchema);