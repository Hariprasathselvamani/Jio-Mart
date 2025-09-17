// middleware/authSeller.js
import jwt from "jsonwebtoken";

/**
 * Middleware to authorize a seller.
 * Expects JWT token in cookie 'sellerToken'.
 */
const authSeller = (req, res, next) => {
  try {
    const { sellerToken } = req.cookies; // ✅ must match cookie name in your login

    // 1️⃣ Check if token exists
    if (!sellerToken) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized: No Token Provided",
      });
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET);
    console.log("Decoded Seller JWT:", decoded);

    // 3️⃣ Attach seller info to request
    req.sellerEmail = decoded.email; // email from JWT
    req.seller = decoded; // full decoded token

    // ✅ Allow access
    next();
  } catch (error) {
    console.error("authSeller middleware error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authSeller;
