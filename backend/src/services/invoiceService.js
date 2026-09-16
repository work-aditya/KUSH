const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Invoice = require('../models/Invoice');
const logger = require('../config/logger');

class InvoiceService {
  constructor() {
    this.invoicesDir = path.resolve(__dirname, '../../invoices');
    if (!fs.existsSync(this.invoicesDir)) {
      fs.mkdirSync(this.invoicesDir, { recursive: true });
    }
  }

  /**
   * Generates a unique invoice number
   */
  generateInvoiceNumber() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `CK-${dateStr}-${randomSuffix}`;
  }

  /**
   * Generates and saves a PDF invoice for a verified order
   * @param {object} params
   * @param {object} params.order - Order document
   * @param {object} params.user - User document
   * @param {object} params.pricing - Pricing document
   * @param {object} params.payment - Payment document
   * @returns {Promise<Invoice>}
   */
  async generateInvoice({ order, user, pricing, payment }) {
    // Check if invoice already exists for this order
    let existingInvoice = await Invoice.findOne({ orderId: order._id });
    if (existingInvoice && fs.existsSync(existingInvoice.pdfPath)) {
      return existingInvoice;
    }

    const invoiceNumber = this.generateInvoiceNumber();
    const fileName = `${invoiceNumber}.pdf`;
    const filePath = path.join(this.invoicesDir, fileName);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `CoachKush Invoice ${invoiceNumber}`,
            Author: 'CoachKush Online Coaching',
          },
        });

        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Header - CoachKush Branding
        doc
          .fillColor('#0F172A')
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('COACHKUSH', 50, 50);

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#64748B')
          .text('Elite Online Fitness & Coaching Platform', 50, 78)
          .text('Sessions via Google Meet & Zoom', 50, 92)
          .text('Website: coachkush.com', 50, 106);

        // INVOICE title & meta on the right
        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .fillColor('#0F172A')
          .text('TAX INVOICE', 350, 50, { align: 'right' });

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#475569')
          .text(`Invoice Number: ${invoiceNumber}`, 350, 78, { align: 'right' })
          .text(`Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}`, 350, 92, { align: 'right' })
          .text(`Status: PAID`, 350, 106, { align: 'right' });

        // Divider
        doc
          .strokeColor('#E2E8F0')
          .lineWidth(1)
          .moveTo(50, 130)
          .lineTo(545, 130)
          .stroke();

        // Customer Details & Order Details Columns
        const detailsTop = 145;

        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#0F172A')
          .text('BILLED TO:', 50, detailsTop);

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#334155')
          .text(user.name || 'Valued Trainee', 50, detailsTop + 18)
          .text(`Email: ${user.email}`, 50, detailsTop + 32)
          .text(`Phone: ${user.phone || 'N/A'}`, 50, detailsTop + 46);

        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#0F172A')
          .text('PAYMENT DETAILS:', 350, detailsTop, { align: 'right' });

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#334155')
          .text(`Order ID: ${order.merchantTransactionId}`, 300, detailsTop + 18, { align: 'right' })
          .text(`Provider: PhonePe`, 300, detailsTop + 32, { align: 'right' })
          .text(`Transaction Ref: ${payment?.providerTransactionId || payment?.merchantTransactionId || 'Verified'}`, 300, detailsTop + 46, { align: 'right' });

        // Table Header
        const tableTop = 230;
        doc
          .rect(50, tableTop, 495, 24)
          .fill('#F1F5F9');

        doc
          .fillColor('#0F172A')
          .font('Helvetica-Bold')
          .fontSize(9)
          .text('PLAN / SERVICE DESCRIPTION', 60, tableTop + 7)
          .text('DURATION', 280, tableTop + 7)
          .text('SESSIONS', 380, tableTop + 7)
          .text('AMOUNT (INR)', 455, tableTop + 7, { align: 'right' });

        // Table Content
        const itemTop = tableTop + 35;
        doc
          .fillColor('#1E293B')
          .font('Helvetica-Bold')
          .fontSize(10)
          .text(pricing.title || 'Online Coaching Package', 60, itemTop);

        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#64748B')
          .text(`Type: ${pricing.planType ? pricing.planType.toUpperCase() : 'STANDARD'} | Interactive Live Video`, 60, itemTop + 14);

        doc
          .fillColor('#1E293B')
          .fontSize(10)
          .text(pricing.duration || '1 Month', 280, itemTop)
          .text(`${pricing.sessions || 12} Sessions`, 380, itemTop)
          .text(`₹${Number(order.amount).toLocaleString('en-IN')}`, 455, itemTop, { align: 'right' });

        // Table Bottom Divider
        doc
          .strokeColor('#CBD5E1')
          .lineWidth(1)
          .moveTo(50, itemTop + 35)
          .lineTo(545, itemTop + 35)
          .stroke();

        // Total Section
        const totalTop = itemTop + 45;
        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#64748B')
          .text('Subtotal:', 350, totalTop, { align: 'right' })
          .text('Tax / GST (0% Included):', 350, totalTop + 16, { align: 'right' });

        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#0F172A')
          .text('Total Paid:', 350, totalTop + 36, { align: 'right' });

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#1E293B')
          .text(`₹${Number(order.amount).toLocaleString('en-IN')}`, 455, totalTop, { align: 'right' })
          .text('₹0', 455, totalTop + 16, { align: 'right' });

        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#059669')
          .text(`₹${Number(order.amount).toLocaleString('en-IN')}`, 455, totalTop + 36, { align: 'right' });

        // Onboarding Instructions
        const noteTop = totalTop + 80;
        doc
          .rect(50, noteTop, 495, 80)
          .fillAndStroke('#F8FAFC', '#E2E8F0');

        doc
          .fillColor('#0F172A')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Next Steps for Your Coaching Onboarding:', 65, noteTop + 12);

        doc
          .fillColor('#475569')
          .fontSize(9)
          .font('Helvetica')
          .text('1. Kush will connect with you on WhatsApp/Email to schedule your intake assessment.', 65, noteTop + 28)
          .text('2. All live coaching sessions will be conducted via Google Meet or Zoom.', 65, noteTop + 42)
          .text('3. If you have questions, message Coach Kush on WhatsApp or email support@coachkush.com.', 65, noteTop + 56);

        // Footer
        doc
          .fontSize(8)
          .fillColor('#94A3B8')
          .text('This is a computer-generated invoice. No physical signature required.', 50, 750, {
            align: 'center',
            width: 495,
          });

        doc.end();

        writeStream.on('finish', async () => {
          try {
            const invoice = await Invoice.create({
              invoiceNumber,
              orderId: order._id,
              userId: user._id,
              amount: order.amount,
              pdfPath: filePath,
            });

            logger.info('Invoice PDF Generated Successfully', {
              invoiceNumber,
              orderId: order._id,
              filePath,
            });

            resolve(invoice);
          } catch (dbErr) {
            reject(dbErr);
          }
        });

        writeStream.on('error', (err) => {
          logger.error('Invoice PDF Write Stream Error', { error: err.message });
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new InvoiceService();
