const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const vendorController = require("../controllers/vendorController");
const getVendorLedger = require("../controllers/vendorLedgerController");
const vendorOutstandingController = require("../controllers/vendorOutstandingController");
const vendorAgeingController = require("../controllers/vendorAgeingController");
router.use(auth);

router.post("/", vendorController.createVendor);
router.get("/", vendorController.getVendors);
router.put("/:id", vendorController.updateVendor);
router.delete("/:id", vendorController.deleteVendor);
router.get("/:id/ledger", getVendorLedger.getVendorLedger);
router.get("/outstanding", vendorOutstandingController.getVendorOutstanding);
router.get("/ageing", vendorAgeingController.getVendorAgeing);

module.exports = router;
