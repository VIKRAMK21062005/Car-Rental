const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = async (bookingData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const filename = `invoice_${bookingData._id}.pdf`;
      const filepath = path.join(__dirname, '../uploads', filename);

      // Ensure uploads directory exists
      const uploadsDir = path.dirname(filepath);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      doc.pipe(fs.createWriteStream(filepath));

      // Header
      doc.fontSize(20).text('CAR RENTAL INVOICE', 50, 50);
      doc.fontSize(10).text(`Invoice ID: ${bookingData._id}`, 50, 80);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 95);

      // Customer Information
      doc.fontSize(14).text('Bill To:', 50, 130);
      doc.fontSize(10)
         .text(`Name: ${bookingData.user.name}`, 50, 150)
         .text(`Email: ${bookingData.user.email}`, 50, 165)
         .text(`Phone: ${bookingData.user.phone}`, 50, 180);

      // Car Information
      doc.fontSize(14).text('Car Details:', 50, 210);
      doc.fontSize(10)
         .text(`Car: ${bookingData.car.name}`, 50, 230)
         .text(`Model: ${bookingData.car.brand} ${bookingData.car.model}`, 50, 245)
         .text(`Registration: ${bookingData.car.registrationNumber}`, 50, 260);

      // Booking Details
      doc.fontSize(14).text('Booking Details:', 50, 290);
      doc.fontSize(10)
         .text(`Start Date: ${new Date(bookingData.startDate).toLocaleDateString()}`, 50, 310)
         .text(`End Date: ${new Date(bookingData.endDate).toLocaleDateString()}`, 50, 325)
         .text(`Total Hours: ${bookingData.totalHours}`, 50, 340)
         .text(`Rate per Hour: ₹${bookingData.car.rentPerHour}`, 50, 355);

      // Payment Details
      doc.fontSize(14).text('Payment Summary:', 50, 385);
      const subtotal = bookingData.totalHours * bookingData.car.rentPerHour;
      let y = 405;
      
      doc.fontSize(10).text(`Subtotal: ₹${subtotal}`, 50, y);
      y += 15;

      if (bookingData.couponApplied) {
        doc.text(`Discount (${bookingData.couponApplied.code}): -₹${bookingData.couponApplied.discountAmount}`, 50, y);
        y += 15;
      }

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(`Total Amount: ₹${bookingData.totalAmount}`, 50, y);

      // Footer
      doc.fontSize(8)
         .font('Helvetica')
         .text('Thank you for choosing our car rental service!', 50, y + 40);

      doc.end();

      doc.on('end', () => {
        resolve(filepath);
      });

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoice };