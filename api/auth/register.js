import { connectDB } from "../../lib/db.js";
import { registerAdmin } from "../../controllers/authController.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connectDB();
  return registerAdmin(req, res);
}
