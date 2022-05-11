const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { loginValidator } = require("../utils/validators");
const { SECRET } = require("../utils/config");
const { db } = require("../models/index");

const loginController = async (req, res) => {
  try {
    const UserSql = db.users;
    const { email, password } = req.body;
    const { errors, valid } = loginValidator(email, password);

    if (!valid) {
      throw new Error(Object.values(errors)[0], { errors });
    }

    const user = await User.findOne({
      email,
    });
    console.log(user);
    if (!user) {
      throw new Error(`User: '${email}' not found.`);
    }

    const userRequestingLogin = await UserSql.findOne({
      where: { email },
    });
    const credentialsValid = await bcrypt.compare(
      password,
      userRequestingLogin.user_password
    );

    if (!credentialsValid) {
      throw new Error("Invalid credentials.");
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      SECRET
    );

    return res.status(200).json({
      id: user._id,
      username: user.username,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  loginController,
};
