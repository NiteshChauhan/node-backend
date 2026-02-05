import { connectDB } from "./db.js";
import User from "./models/User.js";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const users = await User.find();
    return res.status(200).json(users);
  }

  res.status(405).json({ message: "Method not allowed" });
}
