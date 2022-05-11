const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { SECRET } = require("./config");

const authChecker = (req, res, next) => {
  const token = req.headers.authorization;
  try {
    if (!token) {
      throw new Error("No auth token found. Authorization denied.");
    }

    const decodedUser = jwt.verify(token, SECRET);
    req.user = decodedUser;
    next();
  } catch (err) {
    res.status(401).json(err.message);
  }
};

const adminChecker = async (req, res, next) => {
  const { id } = req.user;
  const user = await User.findById(id);
  if (user.role === "admin") {
    return next();
  }
  console.log(user.role);
  return res.status(401).json({ message: "Unauthorized! Need admin access" });
};

module.exports = { authChecker, adminChecker };
