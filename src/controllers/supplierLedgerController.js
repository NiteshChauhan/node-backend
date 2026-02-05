const PurchaseInvoice = require("../models/PurchaseInvoice");
const Payment = require("../models/Payment");
const Supplier = require("../models/Supplier");

exports.getSupplierLedger = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const companyId = req.user.companyId;

    const supplier = await Supplier.findOne({
      _id: supplierId,
      companyId
    });

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    /* ---------------- Purchases ---------------- */
    const purchases = await PurchaseInvoice.find({
      companyId,
      supplierId
    }).select("invoiceDate totalAmount invoiceNo");

    /* ---------------- Payments ---------------- */
    const payments = await Payment.find({
      companyId,
      partyType: "SUPPLIER",
      partyId: supplierId
    }).select("paymentDate amount paymentMode referenceNo");

    /* ---------------- Merge Ledger ---------------- */
    let ledger = [];

    purchases.forEach(p => {
      ledger.push({
        date: p.invoiceDate,
        type: "PURCHASE",
        particulars: `Purchase Invoice`,
        debit: p.totalAmount,
        credit: 0
      });
    });

    payments.forEach(p => {
      ledger.push({
        date: p.paymentDate,
        type: "PAYMENT",
        particulars: `Payment (${p.paymentMode})`,
        debit: 0,
        credit: p.amount
      });
    });

    /* ---------------- Sort by Date ---------------- */
    ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

    /* ---------------- Running Balance ---------------- */
    let balance = supplier.openingBalance || 0;

    ledger = ledger.map(l => {
      balance = balance + l.debit - l.credit;
      return { ...l, balance };
    });

    res.json({
      supplier,
      ledger
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
