const bcrypt = require("bcryptjs");
exports.hashPassword = (password) => {
    return bcrypt.hashSync(password, 8);
};

exports.comparePassword = (userpassword, dbpassword) => {
    return bcrypt.compareSync(userpassword, dbpassword);
};
