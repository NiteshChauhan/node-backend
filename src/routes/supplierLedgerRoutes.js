const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const controller = require("../controllers/supplierLedgerController");

router.use(auth);

router.get("/:supplierId", controller.getSupplierLedger);

module.exports = router;
