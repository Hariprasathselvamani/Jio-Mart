import Address from "../models/address.js";

// Add Address: "/api/address/add"
export const addAddress = async (req, res) => {
  console.log("📩 Received Body:", req.body);
  try {
    const {
      firstName,
      lastName,
      email,
      street,
      city,
      state,
      country,
      zipCode,
      phone,
    } = req.body;
    const userId = req.userId;

    const newAddress = await Address.create({
      firstName,
      lastName,
      email,
      street,
      city,
      state,
      country,
      zipCode,
      phone,
      userId,
    });

    res.json({
      success: true,
      message: "Address added successfully!",
      address: newAddress,
    });
  } catch (error) {
    console.log("❌ Add Address Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get Address: "/api/address/get"
// POST /api/address/get
export const getAddress = async (req, res) => {
  try {
    const userId = req.userId; // userId from JWT
    const addresses = await Address.find({ userId });
    res.json({ success: true, addresses });
  } catch (error) {
    console.log("❌ Get Address Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};
