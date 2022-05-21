var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const formidable = require("formidable");
const cloudinary = require("cloudinary");

const User = require("../models/userModel");

const { isLoggedIn } = require("../middleware");
const { hashPassword, comparePassword } = require("../utils");

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
    try {
        const form = formidable();
        form.parse(req, async (err, fields, files) => {
            if (err) throw err;

            const { username, email, password } = fields;

            if (!username || !username || !password) {
                return res.send("No fields must be empty");
            }

            const existing = await User.findOne({ username }).exec();

            if (existing) return res.send("user exists already");

            const newUser = new User({
                username,
                email,
                password: hashPassword(password),
            });

            if (files) {
                const { public_id, secure_url } =
                    await cloudinary.v2.uploader.upload(files.avatar.filepath, {
                        folder: "avatars",
                        width: 1920,
                        crop: "scale",
                    });
                newUser.image = {
                    public_id,
                    url: secure_url,
                };
            }
            const user = await newUser.save();
            res.redirect("/login");
        });
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

/** GET /login page */
router.get("/login", function (req, res, next) {
    // console.log(req.auth);
    res.render("login");
});

/** POST login page */
router.post("/login", async function (req, res, next) {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).exec();
    if (!user) return res.send("User not found! 404");
    const checkPassword = comparePassword(password, user.password);
    if (!checkPassword) return res.send("username or password incorrect");

    const token = jwt.sign({ _id: user._id }, "jwttokenexpress", {
        expiresIn: "7d",
    });

    res.cookie("token", token, {
        httpOnly: true,
        // secure: true //for https only
    });

    res.redirect("/profile");
});

/** GET /logout page */
router.get("/logout", function (req, res, next) {
    try {
        res.clearCookie("token");
        res.redirect("/login");
    } catch (error) {
        console.log(err);
        res.send(err);
    }
});

/** GET profile/ page */
router.get("/profile", isLoggedIn, function (req, res, next) {
    // console.log(req.auth);
    try {
        User.find()
            .then((data) => {
                res.render("profile", { data });
            })
            .catch((err) => res.send(err));
    } catch (error) {
        res.send(err);
    }
});

/** GET profile/:id page */
router.get("/profile/:id", function (req, res, next) {
    User.findById(req.params.id)
        .then((user) => res.render("singleuser", { user }))
        .catch((err) => res.send(err));
});

/** GET delete/:id page */
router.get("/delete/:id", function (req, res, next) {
    User.findByIdAndDelete(req.params.id)
        .then(async (deletedUser) => {
            const imageId = deletedUser.image.public_id;
            await cloudinary.v2.uploader.destroy(imageId);
            res.redirect("/logout");
        })
        .catch((err) => res.send(err));
});

/** GET update/:id page */
router.get("/update/:id", function (req, res, next) {
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
