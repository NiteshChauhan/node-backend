const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Billing SaaS API Running");
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

const supplierRoutes = require("./routes/supplierRoutes");
app.use("/api/suppliers", supplierRoutes);

const vendorRoutes = require("./routes/vendorRoutes");
app.use("/api/vendors", vendorRoutes);

const stockRoutes = require("./routes/stockRoutes");
app.use("/api/stock", stockRoutes);

const openingStockRoutes = require("./routes/openingStockRoutes");
app.use("/api/opening-stock", openingStockRoutes);

const purchaseRoutes = require("./routes/purchaseRoutes");
app.use("/api/purchase", purchaseRoutes);

const salesRoutes = require("./routes/salesRoutes");
app.use("/api/sales", salesRoutes);

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payments", paymentRoutes);

const reportRoutes = require("./routes/reportRoutes");
app.use("/api/reports", reportRoutes);

const invoicePdfRoutes = require("./routes/invoicePdfRoutes");
app.use("/api/invoice-pdf", invoicePdfRoutes);

const stockLedgerRoutes = require("./routes/stockLedgerRoutes");
app.use("/api/stock-ledger", stockLedgerRoutes);

const supplierLedgerRoutes = require("./routes/supplierLedgerRoutes");
app.use("/api/supplier-ledger", supplierLedgerRoutes);

const profitRoutes = require("./routes/profitRoutes");
app.use("/api/profit", profitRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

module.exports = app;
