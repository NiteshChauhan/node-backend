const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },
  name: { type: String, required: true },
  phone: String,
  email: String,
  address: String,
  gstNumber: String,

  openingBalance: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },

  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Supplier", supplierSchema);
