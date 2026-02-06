const SalesInvoice = require("../models/SalesInvoice");
const Payment = require("../models/Payment");
const Vendor = require("../models/Vendor");

exports.getVendorLedger = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findOne({
      _id: id,
      companyId: req.user.companyId,
    });

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    /* ================= SALES INVOICES ================= */
    const invoices = await SalesInvoice.find({
      vendorId: id,
      companyId: req.user.companyId,
    });

    /* ================= RECEIPTS ================= */
    const receipts = await Payment.find({
      partyId: id,
      partyType: "VENDOR",
      invoiceType: "SALE", // ✅ FIXED
      companyId: req.user.companyId,
    });

    let ledger = [];

    invoices.forEach((i) => {
      ledger.push({
        date: i.invoiceDate,
        particulars: `Sales Invoice ${i.invoiceNo || ""}`,
        debit: i.totalAmount,
        credit: 0,
      });
    });

    receipts.forEach((r) => {
      ledger.push({
        date: r.createdAt,
        particulars: `Receipt (${r.paymentMode})`,
        debit: 0,
        credit: r.amount,
      });
    });

    ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

    let running = vendor.openingBalance || 0;

    ledger = ledger.map((l) => {
      running += l.debit - l.credit;
      return {
        ...l,
        balance: running,
      };
    });

    res.json({
      vendor,
      openingBalance: vendor.openingBalance || 0,
      closingBalance: running,
      ledger,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
