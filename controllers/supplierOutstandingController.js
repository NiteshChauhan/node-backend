const Supplier = require("../models/Supplier");
const PurchaseInvoice = require("../models/PurchaseInvoice");

exports.getSupplierOutstanding = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const suppliers = await Supplier.find({
      companyId,
      isActive: true,
    });

    const supplierIds = suppliers.map((s) => s._id);

    const invoices = await PurchaseInvoice.find({
      companyId,
      supplierId: { $in: supplierIds },
    });

    const invoiceMap = {};

    invoices.forEach((inv) => {
      const sid = inv.supplierId.toString();

      if (!invoiceMap[sid]) {
        invoiceMap[sid] = {
          totalPurchase: 0,
          totalPaid: 0,
        };
      }

      invoiceMap[sid].totalPurchase += inv.totalAmount || 0;
      invoiceMap[sid].totalPaid += inv.paidAmount || 0;
    });

    const report = suppliers.map((supplier) => {
      const data = invoiceMap[supplier._id.toString()] || {
        totalPurchase: 0,
        totalPaid: 0,
      };

      const outstanding =
        (supplier.openingBalance || 0) + data.totalPurchase - data.totalPaid;

      return {
        supplierId: supplier._id,
        supplierName: supplier.name,
        totalPurchase: data.totalPurchase,
        totalPaid: data.totalPaid,
        outstanding,
      };
    });

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
