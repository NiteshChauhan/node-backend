const Supplier = require("../models/Supplier");

exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create({
      companyId: req.user.companyId,
      ...req.body,
      balance: req.body.openingBalance || 0
    });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSuppliers = async (req, res) => {
  const suppliers = await Supplier.find({
    companyId: req.user.companyId,
    isActive: true
  });
  res.json(suppliers);
};

exports.updateSupplier = async (req, res) => {
  const supplier = await Supplier.findOneAndUpdate(
    { _id: req.params.id, companyId: req.user.companyId },
    req.body,
    { new: true }
  );
  res.json(supplier);
};

exports.deleteSupplier = async (req, res) => {
  await Supplier.findOneAndUpdate(
    { _id: req.params.id, companyId: req.user.companyId },
    { isActive: false }
  );
  res.json({ message: "Supplier deactivated" });
};
