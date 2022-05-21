const mongoose = require("mongoose");

const userModel = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Full Name is required!"],
    minlength: [4, "Atleast 4 characters are required!"],
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required!"],
  },
  image: {
    type: Object,
    default: {
      public_id: "",
      url: "",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const user = mongoose.model("user", userModel);
module.exports = user;
