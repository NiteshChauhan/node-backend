const { getAvailableStock } = require("./stockUtils");

exports.validateStockForSale = async (companyId, items) => {
  for (const item of items) {
    const available = await getAvailableStock(companyId, item.productId);
    if (available < item.quantity) {
      throw new Error(
        `Insufficient stock for product ${item.productId}. Available: ${available}`
      );
    }
  }
};
