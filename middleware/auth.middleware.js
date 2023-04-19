const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  if (
    req.headers.cookie &&
    req.headers.cookie.startsWith("access_token")
  ) {
    try {
      // Get JWT token from HTTP header
      const token = req.headers.cookie.split("=")[1];
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
      
      // Get username from the token payload
      req.username = decoded.username;

      next();
    } catch (error) {
      next({ status: 403, msg: `${error.name}: ${error.message}` });
    }
  } else {
    // No token
    next({ status: 401, msg: "Error: Not authorized." });
  }
};

module.exports = { protect };
