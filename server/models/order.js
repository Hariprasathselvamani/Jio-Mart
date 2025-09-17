import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],
    amount: { type: Number, required: true },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    paymentType: { type: String, enum: ["COD", "Online"], default: "COD" },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
