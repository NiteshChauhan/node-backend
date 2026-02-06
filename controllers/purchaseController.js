const PurchaseInvoice = require("../models/PurchaseInvoice");
const StockLedger = require("../models/StockLedger");
const Supplier = require("../models/Supplier");
const Payment = require("../models/Payment");

/* ================= CREATE PURCHASE INVOICE ================= */
exports.createPurchaseInvoice = async (req, res) => {
  try {
    const {
      supplierId,
      items,
      tax = 0,
      paidAmount = 0,
      invoiceDate
    } = req.body;

    if (!supplierId || !items || items.length === 0) {
      return res.status(400).json({
        message: "Supplier and items are required"
      });
    }

    let subtotal = 0;
    items.forEach(i => {
      if (!i.productId || !i.quantity || !i.rate) {
        throw new Error("Invalid item data");
      }
      i.amount = i.quantity * i.rate;
      subtotal += i.amount;
    });

    const totalAmount = subtotal + tax;

    if (paidAmount > totalAmount) {
      return res.status(400).json({
        message: "Paid amount cannot exceed invoice total"
      });
    }

    /* 🔢 AUTO INVOICE NUMBER */
    const count = await PurchaseInvoice.countDocuments({
      companyId: req.user.companyId
    });

    const invoiceNo = `PUR-${count + 1}`;

    /* ✅ CREATE INVOICE (paidAmount ALWAYS starts from 0) */
    const invoice = await PurchaseInvoice.create({
      companyId: req.user.companyId,
      supplierId,
      invoiceNo,
      invoiceDate,
      items,
      subtotal,
      tax,
      totalAmount,
      paidAmount: 0,
      status: "DUE"
    });

    /* 📦 STOCK LEDGER ENTRY */
    for (const item of items) {
      await StockLedger.create({
        companyId: req.user.companyId,
        productId: item.productId,
        type: "PURCHASE",
        quantity: item.quantity,
        rate: item.rate,
        referenceType: "PURCHASE_INVOICE",
        referenceId: invoice._id
      });
    }

    /* ================= HANDLE INITIAL PAYMENT ================= */
    let finalPaidAmount = 0;

    if (paidAmount > 0) {
      /* 🔹 Create payment entry */
      await Payment.create({
        companyId: req.user.companyId,
        partyType: "SUPPLIER",
        partyId: supplierId,
        invoiceType: "PURCHASE",
        invoiceId: invoice._id,
        amount: paidAmount,
        paymentMode: "CASH",
        remarks: "Payment at invoice creation"
      });

      finalPaidAmount = paidAmount;
    }

    /* 🔄 UPDATE INVOICE PAID + STATUS */
    invoice.paidAmount = finalPaidAmount;
    invoice.status =
      finalPaidAmount === totalAmount
        ? "PAID"
        : finalPaidAmount > 0
        ? "PARTIAL"
        : "DUE";

    await invoice.save();

    /* 💰 UPDATE SUPPLIER BALANCE */
    const supplier = await Supplier.findById(supplierId);
    supplier.balance = supplier.balance || 0;
    supplier.balance += totalAmount - finalPaidAmount;
    await supplier.save();

    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to create purchase invoice",
      error: err.message
    });
  }
};

/* ================= GET ALL PURCHASES ================= */
exports.getPurchases = async (req, res) => {
  const data = await PurchaseInvoice
    .find({ companyId: req.user.companyId })
    .populate("supplierId", "name")
    .sort({ createdAt: -1 });

  res.json(data);
};

/* ================= GET PURCHASE BY ID ================= */
exports.getPurchaseById = async (req, res) => {
  const invoice = await PurchaseInvoice
    .findById(req.params.id)
    .populate("supplierId", "name")
    .populate("items.productId", "name");

  res.json(invoice);
};
