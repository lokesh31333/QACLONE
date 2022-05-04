const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { loginValidator } = require("../utils/validators");
const { SECRET } = require("../utils/config");

const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;
    const { errors, valid } = loginValidator(username, password);

    if (!valid) {
      throw new Error(Object.values(errors)[0], { errors });
    }

    const user = await User.findOne({
      username: { $regex: new RegExp("^" + username + "$", "i") },
    });

    if (!user) {
      throw new Error(`User: '${username}' not found.`);
    }

    const credentialsValid = await bcrypt.compare(password, user.passwordHash);

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
