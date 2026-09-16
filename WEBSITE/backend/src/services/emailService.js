const nodemailer = require('nodemailer');
const fs = require('fs');
const env = require('../config/env');
const logger = require('../config/logger');
const { getPaymentConfirmationEmail } = require('../templates/emailTemplates');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.init();
  }

  init() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465, // true for 465, false for other ports
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      });
      this.isConfigured = true;
      logger.info('Nodemailer SMTP transporter initialized');
    } else {
      logger.warn('SMTP credentials not fully configured. Email service will run in mock/log mode.');
    }
  }

  /**
   * Sends payment confirmation email with invoice PDF attached
   */
  async sendPaymentConfirmation({ user, order, pricing, invoiceNumber, pdfPath }) {
    const subject = `CoachKush Payment Confirmation - ${invoiceNumber}`;
    const html = getPaymentConfirmationEmail({
      userName: user.name,
      planTitle: pricing.title,
      amount: order.amount,
      invoiceNumber,
      merchantTransactionId: order.merchantTransactionId,
      whatsappUrl: env.WHATSAPP_CONTACT_URL,
    });

    const attachments = [];
    if (pdfPath && fs.existsSync(pdfPath)) {
      attachments.push({
        filename: `CoachKush-Invoice-${invoiceNumber}.pdf`,
        path: pdfPath,
      });
    }

    const mailOptions = {
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: user.email,
      subject,
      html,
      attachments,
    };

    if (!this.isConfigured) {
      logger.info('Mock Email Dispatch (SMTP not configured in current environment)', {
        to: user.email,
        subject,
        invoiceNumber,
        attachmentsCount: attachments.length,
      });
      return { success: true, simulated: true };
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Payment confirmation email dispatched', {
        messageId: info.messageId,
        to: user.email,
        invoiceNumber,
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Failed to send confirmation email', {
        error: error.message,
        to: user.email,
        invoiceNumber,
      });
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
