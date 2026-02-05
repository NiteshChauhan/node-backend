const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },

  partyType: {
    type: String,
    enum: ["VENDOR", "SUPPLIER"],
    required: true
  },

  partyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "partyType"
  },

  amount: {
    type: Number,
    required: true
  },

  paymentMode: {
    type: String,
    enum: ["CASH", "UPI", "BANK", "CHEQUE"],
    default: "CASH"
  },

  invoiceType: {
    type: String,
    enum: ["PURCHASE", "SALE"],
    required: true
  },

  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },


  referenceNo: String,
  remarks: String,

  paymentDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
