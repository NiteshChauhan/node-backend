const StockLedger = require("../models/StockLedger");

/* ================= STOCK LEDGER (TALLY STYLE) ================= */
exports.getStockLedgerByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const ledger = await StockLedger.find({
      companyId: req.user.companyId,
      productId
    })
      .sort({ createdAt: 1 }) // ⬅️ VERY IMPORTANT (Chronological)
      .lean();

    res.json(ledger);
  } catch (err) {
    res.status(500).json({
      message: "Failed to load stock ledger",
      error: err.message
    });
  }
};
