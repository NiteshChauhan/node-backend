const PDFDocument = require("pdfkit");

module.exports = function generateInvoicePDF(res, invoice, company, party, type) {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=${invoice.invoiceNo}.pdf`
  );

  doc.pipe(res);

  /* ---------- HEADER ---------- */
  doc
    .fontSize(18)
    .text(company.name, { align: "center" })
    .fontSize(10)
    .text(company.address, { align: "center" })
    .text(`GSTIN: ${company.gstin}`, { align: "center" });

  doc.moveDown();

  doc
    .fontSize(14)
    .text(type === "SALE" ? "TAX INVOICE" : "PURCHASE INVOICE", {
      align: "center"
    });

  doc.moveDown();

  /* ---------- PARTY ---------- */
  doc.fontSize(10);
  doc.text(`${type === "SALE" ? "Bill To" : "Supplier"}: ${party.name}`);
  doc.text(`Address: ${party.address || "-"}`);
  doc.text(`GSTIN: ${party.gstin || "-"}`);

  doc.moveDown();

  doc.text(`Invoice No: ${invoice.invoiceNo}`);
  doc.text(`Invoice Date: ${invoice.invoiceDate.toDateString()}`);

  doc.moveDown();

  /* ---------- TABLE HEADER ---------- */
  doc.fontSize(10).text("Items", { underline: true });
  doc.moveDown(0.5);

  invoice.items.forEach((item, i) => {
    doc.text(
      `${i + 1}. ${item.productName} | Qty: ${item.quantity} | Rate: ₹${
        item.rate
      } | GST: ${item.gstPercent}% | Amt: ₹${item.amount}`
    );
  });

  doc.moveDown();

  /* ---------- TOTAL ---------- */
  doc.text(`Subtotal: ₹${invoice.subTotal}`);
  doc.text(`GST: ₹${invoice.gstAmount}`);
  doc.fontSize(12).text(`Total: ₹${invoice.totalAmount}`, {
    underline: true
  });

  doc.moveDown(2);

  doc.text("Authorised Signatory", { align: "right" });

  doc.end();
};
