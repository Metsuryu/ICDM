const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
	lat: Number,
	lng: Number,

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