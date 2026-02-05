const Product = require("../models/Product");

/* ================= CREATE PRODUCT ================= */
exports.createProduct = async (req, res) => {
  try {
    const { name, sku } = req.body;

    if (!name || !sku) {
      return res.status(400).json({
        message: "Product name and SKU are required"
      });
    }

    /* ✅ SAVE FULL BODY (attributes, unit, gst, etc.) */
    const product = await Product.create({
      companyId: req.user.companyId,
      ...req.body
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({
      message: "Failed to create product",
      error: err.message
    });
  }
};

/* ================= GET ALL PRODUCTS ================= */
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      companyId: req.user.companyId
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({
      message: "Failed to load products"
    });
  }
};

/* ================= GET SINGLE PRODUCT ================= */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({
      message: "Failed to load product"
    });
  }
};

/* ================= UPDATE PRODUCT ================= */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { ...req.body },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({
      message: "Failed to update product",
      error: err.message
    });
  }
};

/* ================= DELETE PRODUCT ================= */
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    res.json({
      message: "Product deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete product"
    });
  }
};
