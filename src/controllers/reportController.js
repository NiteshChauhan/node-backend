const StockLedger = require("../models/StockLedger");
const Product = require("../models/Product");
const Supplier = require("../models/Supplier");
const Vendor = require("../models/Vendor");
const PurchaseInvoice = require("../models/PurchaseInvoice");
const SalesInvoice = require("../models/SalesInvoice");
const Payment = require("../models/Payment");


exports.stockReport = async (req, res) => {
  const companyId = req.user.companyId;

  const report = await StockLedger.aggregate([
    { $match: { companyId } },

    {
      $group: {
        _id: "$productId",
        inQty: {
          $sum: {
            $cond: [{ $eq: ["$type", "IN"] }, "$quantity", 0]
          }
        },
        outQty: {
          $sum: {
            $cond: [{ $eq: ["$type", "OUT"] }, "$quantity", 0]
          }
        }
      }
    },

    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },

    {
      $project: {
        productName: "$product.name",
        purchasedQty: "$inQty",
        soldQty: "$outQty",
        currentStock: { $subtract: ["$inQty", "$outQty"] }
      }
    }
  ]);

  res.json(report);
};


exports.supplierDueReport = async (req, res) => {
  const suppliers = await Supplier.find({
    companyId: req.user.companyId
  }).select("name balance");

  res.json(suppliers);
};


exports.vendorDueReport = async (req, res) => {
  const vendors = await Vendor.find({
    companyId: req.user.companyId
  }).select("name balance");

  res.json(vendors);
};



exports.purchaseReport = async (req, res) => {
  const { from, to } = req.query;

  const data = await PurchaseInvoice.find({
    companyId: req.user.companyId,
    invoiceDate: {
      $gte: new Date(from),
      $lte: new Date(to)
    }
  })
    .populate("supplierId", "name")
    .sort({ invoiceDate: -1 });

  res.json(data);
};


exports.salesReport = async (req, res) => {
  const { from, to } = req.query;

  const data = await SalesInvoice.find({
    companyId: req.user.companyId,
    invoiceDate: {
      $gte: new Date(from),
      $lte: new Date(to)
    }
  })
    .populate("vendorId", "name")
    .sort({ invoiceDate: -1 });

  res.json(data);
};


exports.profitLossReport = async (req, res) => {
  const companyId = req.user.companyId;

  const sales = await SalesInvoice.aggregate([
    { $match: { companyId } },
    { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
  ]);

  const purchases = await PurchaseInvoice.aggregate([
    { $match: { companyId } },
    { $group: { _id: null, totalPurchase: { $sum: "$totalAmount" } } }
  ]);

  const totalSales = sales[0]?.totalSales || 0;
  const totalPurchase = purchases[0]?.totalPurchase || 0;

  res.json({
    totalSales,
    totalPurchase,
    profit: totalSales - totalPurchase
  });
};


exports.partyLedger = async (req, res) => {
  const { partyType, partyId } = req.params;

  const invoices =
    partyType === "SUPPLIER"
      ? await PurchaseInvoice.find({ supplierId: partyId })
      : await SalesInvoice.find({ vendorId: partyId });

  const payments = await Payment.find({ partyType, partyId });

  res.json({ invoices, payments });
};
