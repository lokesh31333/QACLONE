const jwt = require("jsonwebtoken");
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

module.exports = authChecker;
