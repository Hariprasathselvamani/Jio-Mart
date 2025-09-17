import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import connectDB from "./configs/db.js";
import "dotenv/config";
import userRouter from "./routes/userRoutes.js";
import sellerRouter from "./routes/sellerRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import productRouter from "./routes/productRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import addressRouter from "./routes/addressRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import { stripwebhooks } from "./controllers/orderController.js";

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173",
   // only for CORS, not as route path
].filter(Boolean);

// Stripe webhook route (needs raw body)

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // allow cookies
  })
);
app.options(/.*/, cors({ origin: allowedOrigins, credentials: true })); // handle preflight
app.use(cookieParser());

// ✅ Test route
app.get("/", (req, res) => res.send("API Working"));

app.post("/stripe", express.raw({ type: "application/json" }), stripwebhooks);
app.use(express.json());

// ✅ All routes with relative paths ONLY
app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);

// Start server
const startServer = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected ✅");

    console.log("Connecting to Cloudinary...");
    await connectCloudinary();
    console.log("Cloudinary connected ✅");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();