// CoachKush Resend Email Service
// Conforms to Resend Node.js SDK standard guidelines

require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Builds the responsive, aligned HTML email template for CoachKush
 */
function buildWelcomeEmailHtml({
  name = 'Athlete',
  planName = 'Coaching Program',
  duration = '4 Weeks',
  amount = '7,999',
  orderNumber = 'CK-OFFICIAL',
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CoachKush</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #070A0F;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #E2E8F0;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #070A0F;
      padding: 30px 10px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #0F1622;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .header {
      background: linear-gradient(135deg, #162032 0%, #0F172A 100%);
      padding: 36px 30px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #F59E0B;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.25);
      padding: 4px 14px;
      border-radius: 9999px;
      margin-bottom: 12px;
    }
    .brand-title {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      margin: 0;
    }
    .brand-tagline {
      font-size: 13px;
      color: #94A3B8;
      margin-top: 6px;
      margin-bottom: 0;
    }
    .content {
      padding: 36px 30px;
    }
    .salutation {
      font-size: 22px;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0 0 16px 0;
    }
    .lead-text {
      font-size: 15px;
      line-height: 1.6;
      color: #CBD5E1;
      margin: 0 0 24px 0;
    }
    .card {
      background-color: #172133;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 20px 24px;
      margin-bottom: 28px;
    }
    .card-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #F59E0B;
      margin: 0 0 14px 0;
    }
    .plan-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .plan-label {
      color: #94A3B8;
    }
    .plan-val {
      font-weight: 700;
      color: #FFFFFF;
      text-align: right;
    }
    .steps-section {
      margin-bottom: 30px;
    }
    .step-item {
      margin-bottom: 16px;
    }
    .step-title {
      font-size: 14px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 4px;
    }
    .step-desc {
      font-size: 13px;
      color: #94A3B8;
      line-height: 1.5;
      margin: 0;
    }
    .cta-wrapper {
      text-align: center;
      margin: 32px 0 16px 0;
    }
    .cta-button {
      display: inline-block;
      background: #10B981;
      color: #070A0F !important;
      font-size: 15px;
      font-weight: 800;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
      letter-spacing: 0.3px;
    }
    .footer {
      background-color: #0A0F17;
      padding: 26px 30px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 12px;
      color: #64748B;
      line-height: 1.6;
    }
    .footer-link {
      color: #94A3B8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      
      <!-- Top Brand Header -->
      <div class="header">
        <span class="badge">Official Coaching Membership</span>
        <h1 class="brand-title">COACH KUSH</h1>
        <p class="brand-tagline">Real-Time Fitness Coaching &bull; Zero Compromise</p>
      </div>

      <!-- Main Body Content -->
      <div class="content">
        <h2 class="salutation">Welcome to the Family, ${name}! 🔥</h2>
        <p class="lead-text">
          Thank you for joining CoachKush. Your commitment to transforming your strength, physique, and lifestyle starts now. No generic PDFs or automated bots—you will be guided directly with personalized accountability and biomechanics precision.
        </p>

        <!-- Membership Summary Card -->
        <div class="card">
          <p class="card-title">Enrolled Program Details</p>
          <table width="100%" cellpadding="4" cellspacing="0">
            <tr>
              <td class="plan-label" style="color: #94A3B8; font-size: 14px;">Package:</td>
              <td class="plan-val" style="color: #FFFFFF; font-weight: 700; text-align: right; font-size: 14px;">${planName}</td>
            </tr>
            <tr>
              <td class="plan-label" style="color: #94A3B8; font-size: 14px;">Duration:</td>
              <td class="plan-val" style="color: #F59E0B; font-weight: 700; text-align: right; font-size: 14px;">${duration}</td>
            </tr>
            <tr>
              <td class="plan-label" style="color: #94A3B8; font-size: 14px;">Amount Paid:</td>
              <td class="plan-val" style="color: #FFFFFF; font-weight: 700; text-align: right; font-size: 14px;">₹${amount} (All Inclusive)</td>
            </tr>
            <tr>
              <td class="plan-label" style="color: #94A3B8; font-size: 14px;">Order Ref:</td>
              <td class="plan-val" style="color: #94A3B8; font-family: monospace; font-size: 13px; text-align: right;">${orderNumber}</td>
            </tr>
          </table>
        </div>

        <!-- Next Steps -->
        <div class="steps-section">
          <p class="card-title">What Happens Next:</p>
          <div class="step-item">
            <div class="step-title">1. Movement & Intake Audit</div>
            <p class="step-desc">We begin with an in-depth intake reviewing your training background, dietary preferences, injuries, and available setup.</p>
          </div>
          <div class="step-item">
            <div class="step-title">2. Custom Strategy Delivery</div>
            <p class="step-desc">Your tailored workouts, macro breakdown, and progression plan will be finalized and mapped to your calendar.</p>
          </div>
          <div class="step-item">
            <div class="step-title">3. Direct WhatsApp Coaching</div>
            <p class="step-desc">Connect directly on WhatsApp with Kush for continuous form cues, weekly adjustments, and live video booking.</p>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="cta-wrapper">
          <a href="https://wa.me/917042858524?text=Hi%20Kush,%20I%20just%20enrolled%20in%20the%20coaching%20program!" class="cta-button">
            Message Coach Kush on WhatsApp
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 8px 0;">
          Need assistance or invoice inquiries? Contact us at 
          <a href="mailto:support@coachkush.in" class="footer-link">support@coachkush.in</a> or 
          <a href="https://wa.me/917042858524" class="footer-link">+91 70428 58524</a>.
        </p>
        <p style="margin: 0;">
          &copy; ${new Date().getFullYear()} CoachKush Fitness. All rights reserved. &bull; <a href="https://coachkush.in" class="footer-link">coachkush.in</a>
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;
}

/**
 * Sends the Thank You / Welcome Email via Resend SDK
 *
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email address(es)
 * @param {string} [options.name] - Trainee's full name
 * @param {string} [options.planName] - Name of the coaching package
 * @param {string} [options.duration] - Program duration (e.g. '4 Weeks')
 * @param {string|number} [options.amount] - Payment amount
 * @param {string} [options.orderNumber] - Internal or Razorpay order reference
 * @returns {Promise<{ data: Object|null, error: Object|null }>}
 */
async function sendWelcomeEmail({
  to,
  name = 'Athlete',
  planName = 'Diet Plan',
  duration = '4 Weeks',
  amount = '7,999',
  orderNumber = 'CK-JOIN-2026',
}) {
  const html = buildWelcomeEmailHtml({
    name,
    planName,
    duration,
    amount,
    orderNumber,
  });

  const { data, error } = await resend.emails.send({
    from: 'Coach Kush <support@coachkush.in>',
    to: Array.isArray(to) ? to : [to],
    replyTo: 'support@coachkush.in',
    subject: `Welcome to CoachKush, ${name}! Your Coaching Journey Starts Now`,
    html,
  });

  if (error) {
    console.error('[Resend Error sending welcome email]:', error);
    return { data: null, error };
  }

  console.log('[Resend Success]: Email sent successfully with ID:', data.id);
  return { data, error: null };
}

module.exports = {
  resend,
  sendWelcomeEmail,
  buildWelcomeEmailHtml,
};
