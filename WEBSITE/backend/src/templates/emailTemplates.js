const getPaymentConfirmationEmail = ({ userName, planTitle, amount, invoiceNumber, merchantTransactionId, whatsappUrl }) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0B0F17; color: #E2E8F0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #111827; border: 1px solid #1F2937; border-radius: 12px; overflow: hidden; }
    .header { background: #0F172A; padding: 30px; text-align: center; border-bottom: 1px solid #1F2937; }
    .header h1 { margin: 0; font-size: 28px; color: #F59E0B; letter-spacing: 1px; }
    .content { padding: 30px; line-height: 1.6; }
    .highlight-card { background: #1F2937; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B; }
    .btn { display: inline-block; background: #F59E0B; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin-top: 15px; }
    .footer { padding: 20px 30px; background: #0F172A; text-align: center; font-size: 12px; color: #64748B; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>COACHKUSH</h1>
      <p style="color: #94A3B8; margin: 5px 0 0 0;">Live Online Coaching • Google Meet & Zoom</p>
    </div>
    <div class="content">
      <h2 style="color: #F8FAFC; margin-top: 0;">Welcome to the Team, ${userName}!</h2>
      <p>Thank you for choosing CoachKush. Your payment has been verified and your training program is officially confirmed.</p>
      
      <div class="highlight-card">
        <p style="margin: 0 0 8px 0;"><strong>Plan:</strong> ${planTitle}</p>
        <p style="margin: 0 0 8px 0;"><strong>Amount Paid:</strong> ₹${Number(amount).toLocaleString('en-IN')}</p>
        <p style="margin: 0 0 8px 0;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
        <p style="margin: 0;"><strong>Order Reference:</strong> ${merchantTransactionId}</p>
      </div>

      <h3 style="color: #F8FAFC;">Next Steps: Live Session Onboarding</h3>
      <ol style="padding-left: 20px; color: #CBD5E1;">
        <li>Your tax invoice is attached as a PDF to this email for your records.</li>
        <li>Kush will reach out to schedule your 1-on-1 intake and posture assessment.</li>
        <li>All live sessions are held interactively over <strong>Google Meet</strong> or <strong>Zoom</strong>.</li>
      </ol>

      <p>Want to get started immediately? Connect directly with Kush on WhatsApp:</p>
      <a href="${whatsappUrl}" class="btn" target="_blank">Chat with Kush on WhatsApp</a>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} CoachKush. All rights reserved.</p>
      <p>If you have any questions, reply to this email or reach out to Kush on WhatsApp.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

module.exports = {
  getPaymentConfirmationEmail,
};
