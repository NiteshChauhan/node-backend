const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const report = require("../controllers/reportController");
const supplierOutstanding = require("../controllers/supplierOutstandingController");

router.use(auth);

router.get("/stock", report.stockReport);
router.get("/supplier-due", report.supplierDueReport);
router.get("/vendor-due", report.vendorDueReport);
router.get("/purchase", report.purchaseReport);
router.get("/sales", report.salesReport);
router.get("/profit-loss", report.profitLossReport);
router.get("/ledger/:partyType/:partyId", report.partyLedger);
router.get("/supplier-outstanding", supplierOutstanding.getSupplierOutstanding);

module.exports = router;
