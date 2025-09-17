import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("✅ Database Connected");
    });

    await mongoose.connect(`${process.env.MONGO_URI}/Jio-Mart`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
