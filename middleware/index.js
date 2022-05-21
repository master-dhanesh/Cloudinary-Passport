const { expressjwt } = require("express-jwt");

exports.isLoggedIn = expressjwt({
    getToken: (req, res) => req.cookies.token,
    secret: "jwttokenexpress",
    algorithms: ["HS256"],
}); //req.auth
