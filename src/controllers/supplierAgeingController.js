const Supplier = require("../models/Supplier");
const PurchaseInvoice = require("../models/PurchaseInvoice");

exports.getSupplierAgeing = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const today = new Date();

    const suppliers = await Supplier.find({
      companyId,
      isActive: true,
    });

    const report = [];

    for (const supplier of suppliers) {
      const invoices = await PurchaseInvoice.find({
        companyId,
        supplierId: supplier._id,
        status: { $ne: "PAID" },
      });

      let bucket30 = 0;
      let bucket60 = 0;
      let bucket90 = 0;

      invoices.forEach((inv) => {
        const days = Math.floor(
          (today - new Date(inv.invoiceDate)) / (1000 * 60 * 60 * 24),
        );

        const outstanding = (inv.totalAmount || 0) - (inv.paidAmount || 0);

        if (outstanding <= 0) return;

        if (days <= 30) bucket30 += outstanding;
        else if (days <= 60) bucket60 += outstanding;
        else bucket90 += outstanding;
      });

      const total = bucket30 + bucket60 + bucket90;

      if (total > 0) {
        report.push({
          supplierId: supplier._id,
          name: supplier.name,
          "0_30": bucket30,
          "31_60": bucket60,
          "61_plus": bucket90,
          total,
        });
      }
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
