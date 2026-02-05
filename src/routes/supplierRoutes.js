const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const supplierController = require("../controllers/supplierController");
const supplierOutstandingController = require("../controllers/supplierOutstandingController");
const supplierAgeingController = require("../controllers/supplierAgeingController");
router.use(auth);

router.post("/", supplierController.createSupplier);
router.get("/", supplierController.getSuppliers);
router.get(
  "/outstanding",
  supplierOutstandingController.getSupplierOutstanding,
);
router.put("/:id", supplierController.updateSupplier);
router.delete("/:id", supplierController.deleteSupplier);
router.get("/ageing", supplierAgeingController.getSupplierAgeing);

module.exports = router;
