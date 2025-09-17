// middleware/authUser.js
import jwt from "jsonwebtoken";

/**
 * Middleware to authorize a logged-in user.
 * Expects JWT token in cookie 'token'.
 */
const authUser = (req, res, next) => {
  try {
    const { token } = req.cookies; // ✅ must match cookie name in your controller

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized: No Token Provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // attach userId to request
    req.user = decoded; // full decoded token

    next(); // proceed to route
  } catch (error) {
    console.error("authUser middleware error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authUser;
