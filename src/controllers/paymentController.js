const Payment = require("../models/Payment");
const Supplier = require("../models/Supplier");
const Vendor = require("../models/Vendor");
const PurchaseInvoice = require("../models/PurchaseInvoice");
const SalesInvoice = require("../models/SalesInvoice");

/* ================= CREATE PAYMENT ================= */
exports.createPayment = async (req, res) => {
  try {
    const {
      partyType,
      partyId,
      invoiceType,
      invoiceId,
      amount,
      paymentMode,
      referenceNo,
      remarks,
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid payment amount" });
    }

    /* =====================================================
       🟢 PURCHASE PAYMENT (Supplier)
    ===================================================== */
    if (invoiceType === "PURCHASE") {
      const invoice = await PurchaseInvoice.findOne({
        _id: invoiceId,
        companyId: req.user.companyId,
      });

      if (!invoice) {
        return res.status(404).json({ error: "Purchase invoice not found" });
      }

      const payments = await Payment.find({
        companyId: req.user.companyId,
        invoiceId,
        invoiceType: "PURCHASE",
      });

      const alreadyPaid = payments.reduce((t, p) => t + p.amount, 0);
      const balance = invoice.totalAmount - alreadyPaid;

      if (amount > balance) {
        return res.status(400).json({
          error: `Payment exceeds outstanding amount (₹${balance})`,
        });
      }

      const payment = await Payment.create({
        companyId: req.user.companyId,
        partyType,
        partyId,
        invoiceType,
        invoiceId,
        amount,
        paymentMode,
        referenceNo,
        remarks,
      });

      const supplier = await Supplier.findById(partyId);
      supplier.balance -= amount;
      await supplier.save();

      invoice.paidAmount = alreadyPaid + amount;
      invoice.status =
        invoice.paidAmount >= invoice.totalAmount ? "PAID" : "PARTIAL";

      await invoice.save();

      return res.json({ payment, invoice });
    }

    /* =====================================================
       🔵 SALES PAYMENT (Customer / Vendor)
    ===================================================== */
    if (invoiceType === "SALE") {
      const invoice = await SalesInvoice.findOne({
        _id: invoiceId,
        companyId: req.user.companyId,
      });

      if (!invoice) {
        return res.status(404).json({ error: "Sales invoice not found" });
      }

      const payments = await Payment.find({
        companyId: req.user.companyId,
        invoiceId,
        invoiceType: "SALE",
      });

      const alreadyPaid = payments.reduce((t, p) => t + p.amount, 0);
      const balance = invoice.totalAmount - alreadyPaid;

      if (amount > balance) {
        return res.status(400).json({
          error: `Payment exceeds outstanding amount (₹${balance})`,
        });
      }

      const payment = await Payment.create({
        companyId: req.user.companyId,
        partyType,
        partyId,
        invoiceType,
        invoiceId,
        amount,
        paymentMode,
        referenceNo,
        remarks,
      });

      const vendor = await Vendor.findById(partyId);
      vendor.balance -= amount; // customer paid → receivable reduced
      await vendor.save();

      invoice.paidAmount = alreadyPaid + amount;
      invoice.status =
        invoice.paidAmount >= invoice.totalAmount ? "PAID" : "PARTIAL";

      await invoice.save();

      return res.json({ payment, invoice });
    }

    return res.status(400).json({
      error: "Invalid invoice type",
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/* ================= GET PAYMENTS BY INVOICE ================= */
exports.getPaymentsByInvoice = async (req, res) => {
  const payments = await Payment.find({
    companyId: req.user.companyId,
    invoiceId: req.params.invoiceId,
  }).sort({ createdAt: 1 });

  res.json(payments);
};
