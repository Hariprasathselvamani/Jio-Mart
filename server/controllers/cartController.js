import User from "../models/User.js";

//update User CartData = "/api/cart/update"
export const updateCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { cartItems } = req.body;

    // Add validation for required data
    if (!userId || !cartItems) {
      return res.status(400).json({
        success: false,
        message: "User ID and cart data are required.",
      });
    }

    // Find and update the user's cart
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { cartItems },
      { new: true }
    );

    // Handle case where user is not found
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Use 200 OK for a successful update
    res.status(200).json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.error("Error updating cart:", error);
    // A 500 status code is more appropriate for a server-side error
    res.status(500).json({
      success: false,
      message: "Failed to update cart due to a server error.",
    });
  }
};
