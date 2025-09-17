import { v2 as cloudinary } from "cloudinary";
import Product from "../models/product.js";

//Add Product : /api/product/add
export const addProduct = async (req, res) => {
  try {
    const productData = JSON.parse(req.body.productData);
    const images = req.files;

    if (!images || images.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

    const imagesUrl = await Promise.all(
      images.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    await Product.create({ ...productData, images: imagesUrl });
    res.status(201).json({ success: true, message: "product Added" });
  } catch (error) {
    console.error("Error adding product:", error);
    if (error instanceof SyntaxError) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product data format" });
    }
    res.status(500).json({ success: false, message: "Failed to add product" });
  }
};

//Get Product : "api/product/list"
export const productList = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching product list:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" });
  }
};

//Get single Product : "api/product/id"
export const productById = async (req, res) => {
  try {
    // FIX: Correctly get the ID from req.params
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required." });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    // Use 500 for server-side errors
    res
      .status(500)
      .json({ success: false, message: "An unexpected error occurred." });
  }
};

//Change Product inStock : "/api/product/stock"
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;

    // Validate if required fields are present and inStock is a boolean
    if (!id || typeof inStock !== "boolean") {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid request. 'id' and 'inStock' (boolean) are required.",
        });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { inStock },
      { new: true }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    res.status(200).json({
      success: true,
      message: "Stock Updated",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error changing stock:", error);
    res.status(500).json({ success: false, message: "Failed to update stock" });
  }
};
