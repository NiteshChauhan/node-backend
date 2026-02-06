const Vendor = require("../models/Vendor");

exports.createVendor = async (req, res) => {
  try {
    const vendor = await Vendor.create({
      companyId: req.user.companyId,
      ...req.body,
      balance: req.body.openingBalance || 0
    });
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVendors = async (req, res) => {
  const vendors = await Vendor.find({
    companyId: req.user.companyId,
    isActive: true
  });
  res.json(vendors);
};

exports.updateVendor = async (req, res) => {
  const vendor = await Vendor.findOneAndUpdate(
    { _id: req.params.id, companyId: req.user.companyId },
    req.body,
    { new: true }
  );
  res.json(vendor);
};

exports.deleteVendor = async (req, res) => {
  await Vendor.findOneAndUpdate(
    { _id: req.params.id, companyId: req.user.companyId },
    { isActive: false }
  );
  res.json({ message: "Vendor deactivated" });
};
