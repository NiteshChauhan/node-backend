import { connectDB } from "../../lib/db.js";
import { login } from "../../controllers/authController.js";
import { applyCors } from "../../lib/cors.js";

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connectDB();
  return login(req, res);
}
