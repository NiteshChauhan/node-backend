const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Company = require("../models/Company");

exports.registerAdmin = async (req, res) => {
  try {
    const { companyName, name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const company = await Company.create({
      name: companyName,
      subscriptionExpiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days trial
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      companyId: company._id,
      name,
      email,
      password: hashedPassword,
      role: "admin"
    });

    res.json({ message: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("companyId");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, companyId: user.companyId._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
