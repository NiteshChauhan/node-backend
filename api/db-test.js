import { connectDB } from "../lib/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();
    return res.status(200).json({
      success: true,
      message: "MongoDB connected successfully ✅",
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return res.status(500).json({
      success: false,
      message: "MongoDB connection failed ❌",
      error: error.message,
    });
  }
}
