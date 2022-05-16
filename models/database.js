const mongoose = require("mongoose");

exports.dbconnect = () => {
  mongoose
    .connect("mongodb://localhost/mern2db")
    .then(() => console.log("mongodb connected!"))
    .catch((err) => console.log(err.message));
};
