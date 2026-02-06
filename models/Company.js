const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: String,
  gstNumber: String,
  address: String,
  subscriptionExpiry: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);
