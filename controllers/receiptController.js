const Payment = require("../models/Payment");
const Vendor = require("../models/Vendor");
const SalesInvoice = require("../models/SalesInvoice");

exports.createReceipt = async (req, res) => {
  try {
    const { partyId, invoiceId, amount, paymentMode, referenceNo, remarks } =
      req.body;

    const invoice = await SalesInvoice.findById(invoiceId);
    if (!invoice) throw new Error("Invoice not found");

    const payments = await Payment.find({
      invoiceType: "SALE",
      invoiceId,
    });

    const alreadyPaid = payments.reduce((t, p) => t + p.amount, 0);

    if (alreadyPaid + amount > invoice.totalAmount) {
      return res.status(400).json({
        error: `Receipt exceeds balance. Remaining ₹${
          invoice.totalAmount - alreadyPaid
        }`,
      });
    }

    const receipt = await Payment.create({
      companyId: req.user.companyId,
      partyType: "VENDOR",
      partyId,
      invoiceType: "SALE",
      invoiceId,
      amount,
      paymentMode,
      referenceNo,
      remarks,
    });

    /* 🔄 UPDATE INVOICE */
    const newPaid = alreadyPaid + amount;
    invoice.paidAmount = newPaid;
    invoice.status =
      newPaid === invoice.totalAmount
        ? "PAID"
        : newPaid > 0
          ? "PARTIAL"
          : "DUE";

    await invoice.save();

    /* 🔄 UPDATE VENDOR BALANCE */
    const vendor = await Vendor.findById(partyId);
    vendor.balance -= amount;
    await vendor.save();

    res.json(receipt);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
