const mongoose = require("mongoose");

const purchaseInvoiceSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true
  },

  invoiceNo: String,
  invoiceDate: { type: Date, default: Date.now },

  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: Number,
      rate: Number,
      amount: Number
    }
  ],

  subtotal: Number,
  tax: Number,
  totalAmount: Number,

  paidAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["PAID", "PARTIAL", "DUE"],
    default: "DUE"
  }
}, { timestamps: true });

module.exports = mongoose.model("PurchaseInvoice", purchaseInvoiceSchema);
