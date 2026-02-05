const SalesInvoice = require("../models/SalesInvoice");
const StockLedger = require("../models/StockLedger");
const Vendor = require("../models/Vendor");
const { validateStockForSale } = require("../utils/stockValidation");

/* ================= CREATE SALES INVOICE ================= */
exports.createSalesInvoice = async (req, res) => {
  try {
    const { vendorId, items, tax = 0, paidAmount = 0, invoiceDate } = req.body;

    if (!vendorId || !items || items.length === 0) {
      return res.status(400).json({ message: "Vendor & items required" });
    }

    // 1️⃣ Validate stock
    await validateStockForSale(req.user.companyId, items);

    // 2️⃣ Calculate totals
    let subtotal = 0;
    items.forEach((i) => {
      if (!i.productId || !i.quantity || !i.rate) {
        throw new Error("Invalid item");
      }
      i.amount = i.quantity * i.rate;
      subtotal += i.amount;
    });

    const totalAmount = subtotal + tax;

    // 3️⃣ Auto Invoice No
    const count = await SalesInvoice.countDocuments({
      companyId: req.user.companyId,
    });
    const invoiceNo = `SAL-${count + 1}`;

    // 4️⃣ Create invoice
    const invoice = await SalesInvoice.create({
      companyId: req.user.companyId,
      vendorId,
      invoiceNo,
      invoiceDate,
      items,
      subtotal,
      tax,
      totalAmount,
      paidAmount,
      status:
        paidAmount >= totalAmount ? "PAID" : paidAmount > 0 ? "PARTIAL" : "DUE",
    });

    // 5️⃣ Stock Ledger (SALE)
    for (const item of items) {
      await StockLedger.create({
        companyId: req.user.companyId,
        productId: item.productId,
        type: "SALE",
        quantity: item.quantity,
        rate: item.rate,
        referenceType: "SALES_INVOICE",
        referenceId: invoice._id,
      });
    }

    // 6️⃣ Update vendor balance
    const vendor = await Vendor.findById(vendorId);
    vendor.balance += totalAmount - paidAmount;
    await vendor.save();

    res.json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ================= GET SALES LIST ================= */
exports.getSales = async (req, res) => {
  const data = await SalesInvoice.find({ companyId: req.user.companyId })
    .populate("vendorId", "name")
    .sort({ createdAt: -1 });

  res.json(data);
};

/* ================= GET SALES BY ID ================= */
exports.getSalesById = async (req, res) => {
  const invoice = await SalesInvoice.findById(req.params.id)
    .populate("vendorId", "name")
    .populate("items.productId", "name");

  res.json(invoice);
};
