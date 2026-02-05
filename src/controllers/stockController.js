const StockLedger = require("../models/StockLedger");
const Product = require("../models/Product");
const { getAvailableStock } = require("../utils/stockUtils");

exports.getProductStock = async (req, res) => {
  const { productId } = req.params;

  const stock = await getAvailableStock(req.user.companyId, productId);

  res.json({ productId, stock });
};

exports.adjustStock = async (req, res) => {
  const { productId, quantity, rate } = req.body;

  await StockLedger.create({
    companyId: req.user.companyId,
    productId,
    type: "ADJUSTMENT",
    quantity,
    rate,
    referenceType: "MANUAL_ADJUSTMENT"
  });

  res.json({ message: "Stock adjusted" });
};
