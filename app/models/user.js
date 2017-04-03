const mongoose = require("mongoose");

//TODO: Add array of blocked users(IDs), and Contacts/Friends(IDs)
const userSchema = mongoose.Schema({
	lat: Number,
	lng: Number,
	contacts: [mongoose.Schema.Types.Mixed], //Array of Objects

	facebook: {
		id: String,
		token: String,
		email: String,
		name: String,
		picture: String
	},
	google: {
		id: String,
		token: String,
		email: String,
		name: String,
		picture: String
	}
});

module.exports = mongoose.model("User", userSchema);