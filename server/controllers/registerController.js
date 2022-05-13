const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerValidator } = require("../utils/validators");
const { SECRET } = require("../utils/config");
const { db } = require("../models/index");

const registerController = async (req, res) => {
  try {
    const UserSql = db.users;
    console.log(req.body);
    const { username, email, password } = req.body;
    const { errors, valid } = registerValidator(username, password);

    if (!valid) {
      throw new Error(errors);
    }

    const existingUser = await User.findOne({
      username: { $regex: new RegExp("^" + username + "$", "i") },
    });

    if (existingUser) {
      throw new Error(`Username '${username}' is already taken.`);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const createdUser = await UserSql.create({
      username: username,
      email,
      user_password: passwordHash,
    });
    console.log(createdUser);
    const user = new User({
      username,
      email,
      passwordHash,
    });

    const savedUser = await user.save();
    const token = jwt.sign(
      {
        id: savedUser._id,
      },
      SECRET
    );

    return res.status(200).json({
      id: savedUser._id,
      username: savedUser.username,
      role: savedUser.role,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerController,
};
