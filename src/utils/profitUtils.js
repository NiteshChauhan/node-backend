const StockLedger = require("../models/StockLedger");

exports.getProfitSummary = async (companyId, fromDate, toDate) => {
  // 1️⃣ Fetch all SALES in range
  const sales = await StockLedger.find({
    companyId,
    type: "SALE",
    createdAt: { $gte: fromDate, $lte: toDate },
  });

  let totalSales = 0;
  let totalCost = 0;

  for (const sale of sales) {
    // 2️⃣ Purchases till sale date (FIFO-ish avg cost)
    const purchases = await StockLedger.find({
      companyId,
      productId: sale.productId,
      type: "PURCHASE",
      createdAt: { $lte: sale.createdAt },
    });

    const totalQty = purchases.reduce(
      (sum, p) => sum + Number(p.quantity || 0),
      0,
    );

    const totalValue = purchases.reduce(
      (sum, p) => sum + Number(p.quantity || 0) * Number(p.rate || 0),
      0,
    );

    const avgCost = totalQty > 0 ? totalValue / totalQty : 0;

    totalSales += Number(sale.quantity) * Number(sale.rate);
    totalCost += Number(sale.quantity) * avgCost;
  }

  return {
    sales: Number(totalSales.toFixed(2)),
    cost: Number(totalCost.toFixed(2)),
    profit: Number((totalSales - totalCost).toFixed(2)),
  };
};
