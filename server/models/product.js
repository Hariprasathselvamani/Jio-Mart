import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    offerPrice: { type: Number },
    images: [{ type: String }],
    category: { type: String, required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
