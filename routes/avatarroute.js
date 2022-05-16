var express = require("express");
var router = express.Router();
const formidable = require("formidable");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: "dhanesh-cloudinary",
  api_key: "176257529696164",
  api_secret: "FsvsmtHChA4V5HJXdYSuMzzRwSg",
  secure: true,
});

/* GET /avatar/ */
router.get("/", function (req, res, next) {
  res.render("avatar", { image: "" });
});

/* Post /avatar/create */
router.post("/create", function (req, res, next) {
  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) throw err;

    const { public_id, secure_url } = await cloudinary.v2.uploader.upload(
      files.avatar.filepath,
      {
        folder: "avatars",
        width: 200,
        crop: "scale",
      }
    );

    const image = {
      public_id,
      secure_url,
    };

    res.render("avatar", { image });
  });
});

module.exports = router;
