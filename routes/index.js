var express = require("express");
var router = express.Router();
const formidable = require("formidable");
const cloudinary = require("cloudinary");

const { isLoggedIn } = require("../middleware/isAuth");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../models/userModel");

passport.use(new LocalStrategy(User.authenticate()));

cloudinary.config({
    cloud_name: "dhanesh-cloudinary",
    api_key: "176257529696164",
    api_secret: "FsvsmtHChA4V5HJXdYSuMzzRwSg",
    secure: true,
});

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", { title: "Express" });
});

/** GET register page */
router.get("/register", function (req, res, next) {
    res.render("register");
});

/** POST register page */
router.post("/register", function (req, res, next) {
    const form = formidable();

    form.parse(req, async (err, fields, files) => {
        if (err) throw err;

        const { username, email, password } = fields;

        const { public_id, secure_url } = await cloudinary.v2.uploader.upload(
            files.avatar.filepath,
            {
                folder: "avatars",
                width: 1920,
                crop: "scale",
            }
        );

        const newUser = new User({
            username,
            email,
            image: {
                public_id,
                url: secure_url,
            },
        });

        User.register(newUser, password)
            .then(() => {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/profile");
                });
            })
            .catch((err) => res.send(err));
    });
});

/** GET /login page */
router.get("/login", function (req, res, next) {
    console.log(req.user);
    res.render("login");
});

/** POST login page */
router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/profile",
        failureRedirect: "/login",
    }),
    function (req, res, next) {}
);

/** GET /logout page */
router.get("/logout", isLoggedIn, function (req, res, next) {
    req.logout();
    res.redirect("/login");
});

/** GET profile/ page */
router.get("/profile", isLoggedIn, function (req, res, next) {
    User.find()
        .then((data) => {
            res.render("profile", { data });
        })
        .catch((err) => res.send(err));
});

/** GET profile/:id page */
router.get("/profile/:id", isLoggedIn, function (req, res, next) {
    User.findById(req.params.id)
        .then((user) => res.render("singleuser", { user }))
        .catch((err) => res.send(err));
});

/** GET delete/:id page */
router.get("/delete/:id", isLoggedIn, function (req, res, next) {
    User.findByIdAndDelete(req.params.id)
        .then(async (deletedUser) => {
            const imageId = deletedUser.image.public_id;
            await cloudinary.v2.uploader.destroy(imageId);
            res.redirect("/logout");
        })
        .catch((err) => res.send(err));
});

/** GET update/:id page */
router.get("/update/:id", isLoggedIn, function (req, res, next) {
    User.findById(req.params.id)
        .then((user) => res.render("update", { user }))
        .catch((err) => res.send(err));
});

/** POST update/:id page */
router.post("/update/:id", function (req, res, next) {
    const form = formidable();

    form.parse(req, async (err, fields, files) => {
        if (err) throw err;

        const updateUser = {
            ...fields,
        };

        if (files.avatar.size > 0 && files.avatar.mimetype.includes("image")) {
            const user = await User.findById(req.params.id).exec();
            const imageId = user.image.public_id;
            await cloudinary.v2.uploader.destroy(imageId);
            const { public_id, secure_url } =
                await cloudinary.v2.uploader.upload(files.avatar.filepath, {
                    folder: "avatars",
                    width: 1920,
                    crop: "scale",
                });

            updateUser.image = {
                public_id,
                url: secure_url,
            };
        }

        User.findByIdAndUpdate(
            req.params.id,
            { $set: updateUser },
            { new: true }
        )
            .then(() => res.redirect("/profile"))
            .catch((err) => res.send(err));
    });
});

module.exports = router;
