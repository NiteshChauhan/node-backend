const SalesInvoice = require("../models/SalesInvoice");
const PurchaseInvoice = require("../models/PurchaseInvoice");
const Company = require("../models/Company");
const Vendor = require("../models/Vendor");
const Supplier = require("../models/Supplier");
const generatePDF = require("../services/pdfInvoiceService");

exports.salesInvoicePDF = async (req, res) => {
  const invoice = await SalesInvoice.findById(req.params.id);
  if (!invoice) {
    return res.status(404).send("Invoice not found");
  }

  const company = await Company.findById(invoice.companyId);
  const vendor = await Vendor.findById(invoice.vendorId);

  generatePDF(res, invoice, company, vendor, "SALE");
};

exports.purchaseInvoicePDF = async (req, res) => {
  const invoice = await PurchaseInvoice.findById(req.params.id);
  if (!invoice) {
    return res.status(404).send("Invoice not found");
  }

  const company = await Company.findById(invoice.companyId);
  const supplier = await Supplier.findById(invoice.supplierId);

  generatePDF(res, invoice, company, supplier, "PURCHASE");
};
