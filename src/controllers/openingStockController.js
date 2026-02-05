const StockLedger = require("../models/StockLedger");

/* ---------------- ADD OPENING STOCK ---------------- */
exports.addOpeningStock = async (req, res) => {
  try {
    const { productId, quantity, rate } = req.body;

    // 🔒 Check if opening stock already exists
    const exists = await StockLedger.findOne({
      companyId: req.user.companyId,
      productId,
      type: "OPENING"
    });

    if (exists) {
      return res.status(400).json({
        message: "Opening stock already added for this product"
      });
    }

    await StockLedger.create({
      companyId: req.user.companyId,
      productId,
      type: "OPENING",
      quantity,
      rate,
      referenceType: "OPENING_STOCK"
    });

    res.json({ message: "Opening stock added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------- GET OPENING STOCK ---------------- */
exports.getOpeningStockByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const stock = await StockLedger.findOne({
      companyId: req.user.companyId,
      productId,
      type: "OPENING"
    });

    if (!stock) {
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      quantity: stock.quantity,
      rate: stock.rate,
      amount: stock.quantity * stock.rate
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
