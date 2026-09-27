import 'dotenv/config';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Recipient can be passed as CLI arg: node scripts/send-welcome-email.mjs user@example.com
const recipient = process.argv[2] || 'delivered@resend.dev';
const clientName = process.argv[3] || 'Aditya';
const selectedPlan = process.argv[4] || 'Diet Plan';
const planDuration = process.argv[5] || '4 Weeks';
const planPrice = process.argv[6] || '7,999';

const welcomeHtml = `<!DOCTYPE html>
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
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    td {
      padding: 0;
    }
    .wrapper {
      width: 100%;
      background-color: #070A0F;
      padding: 40px 10px;
    }
    .main-table {
      max-width: 600px;
      width: 100%;
      margin: 0 auto;
      background-color: #0F1622;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .header-td {
      background: linear-gradient(135deg, #162032 0%, #0F172A 100%);
      padding: 40px 30px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #F59E0B;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 5px 16px;
      border-radius: 9999px;
      margin-bottom: 14px;
    }
    .brand-title {
      font-size: 30px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      margin: 0;
      line-height: 1.2;
    }
    .brand-tagline {
      font-size: 13px;
      color: #94A3B8;
      margin-top: 8px;
      margin-bottom: 0;
    }
    .content-td {
      padding: 40px 32px;
    }
    .salutation {
      font-size: 24px;
      font-weight: 900;
      color: #FFFFFF;
      margin: 0 0 16px 0;
      letter-spacing: -0.5px;
    }
    .lead-text {
      font-size: 15px;
      line-height: 1.65;
      color: #CBD5E1;
      margin: 0 0 28px 0;
    }
    .card-table {
      width: 100%;
      background-color: #172133;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      margin-bottom: 30px;
    }
    .card-padding {
      padding: 22px 24px;
    }
    .card-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #F59E0B;
      margin: 0 0 16px 0;
    }
    .item-row td {
      padding: 7px 0;
      font-size: 14px;
    }
    .item-label {
      color: #94A3B8;
    }
    .item-val {
      font-weight: 700;
      color: #FFFFFF;
      text-align: right;
    }
    .step-box {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 16px 18px;
      margin-bottom: 14px;
    }
    .step-title {
      font-size: 14px;
      font-weight: 800;
      color: #FFFFFF;
      margin-bottom: 4px;
    }
    .step-desc {
      font-size: 13px;
      color: #94A3B8;
      line-height: 1.5;
      margin: 0;
    }
    .cta-td {
      text-align: center;
      padding: 20px 0 10px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #10B981;
      color: #070A0F !important;
      font-size: 15px;
      font-weight: 800;
      text-decoration: none;
      padding: 15px 36px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);
      letter-spacing: 0.3px;
    }
    .footer-td {
      background-color: #0A0F17;
      padding: 28px 30px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 12px;
      color: #64748B;
      line-height: 1.7;
    }
    .footer-link {
      color: #94A3B8;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" align="center" cellpadding="0" cellspacing="0" role="presentation">
      
      <!-- Top Branding -->
      <tr>
        <td class="header-td">
          <span class="badge">Official Coaching Membership</span>
          <h1 class="brand-title">COACH KUSH</h1>
          <p class="brand-tagline">Real-Time Fitness Coaching &bull; Zero Compromise</p>
        </td>
      </tr>

      <!-- Content -->
      <tr>
        <td class="content-td">
          <h2 class="salutation">Welcome to the Family, ${clientName}! 🔥</h2>
          <p class="lead-text">
            Thank you for enrolling in <strong>CoachKush</strong>. Your decision to invest in your health, physique, and sustainable habits is the first step toward lasting transformation. Every session and recommendation is 100% personalized to your biomechanics, goals, and lifestyle.
          </p>

          <!-- Plan Card -->
          <table class="card-table" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td class="card-padding">
                <p class="card-title">Enrolled Program Summary</p>
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr class="item-row">
                    <td class="item-label">Package:</td>
                    <td class="item-val">${selectedPlan}</td>
                  </tr>
                  <tr class="item-row">
                    <td class="item-label">Program Duration:</td>
                    <td class="item-val" style="color: #F59E0B;">${planDuration}</td>
                  </tr>
                  <tr class="item-row">
                    <td class="item-label">Investment:</td>
                    <td class="item-val">₹${planPrice} (All Inclusive)</td>
                  </tr>
                  <tr class="item-row">
                    <td class="item-label">Account Support:</td>
                    <td class="item-val" style="color: #10B981;">WhatsApp Priority</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Next Steps -->
          <p style="font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #F59E0B; margin: 0 0 16px 0;">
            Next Steps For Onboarding:
          </p>

          <div class="step-box">
            <div class="step-title">1. Movement Assessment & Goal Intake</div>
            <p class="step-desc">We review your health history, current routine, food preferences, and equipment setup to dial in your baseline.</p>
          </div>

          <div class="step-box">
            <div class="step-title">2. Tailored Plan Delivery</div>
            <p class="step-desc">Receive your calibrated macronutrient breakdown, customized meal options, and progressive workout schedule.</p>
          </div>

          <div class="step-box">
            <div class="step-title">3. Continuous WhatsApp Accountability</div>
            <p class="step-desc">Daily communication, weekly form and composition check-ins, and direct access to Kush to answer questions.</p>
          </div>

          <!-- CTA Button -->
          <div class="cta-td">
            <a href="https://wa.me/917042858524?text=Hi%20Kush,%20I%20just%20joined%20the%20coaching%20program!" class="cta-button" target="_blank">
              Message Coach Kush on WhatsApp
            </a>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td class="footer-td">
          <p style="margin: 0 0 8px 0;">
            Questions about your schedule or invoice? Contact us at 
            <a href="mailto:support@coachkush.in" class="footer-link">support@coachkush.in</a> or 
            <a href="https://wa.me/917042858524" class="footer-link">+91 70428 58524</a>.
          </p>
          <p style="margin: 0;">
            &copy; ${new Date().getFullYear()} CoachKush Fitness. All rights reserved. &bull; 
            <a href="https://coachkush.in" class="footer-link">coachkush.in</a>
          </p>
        </td>
      </tr>

    </table>
  </div>
</body>
</html>`;

(async function () {
  console.log(`Sending Welcome & Thank You email to: ${recipient}...`);

  const { data, error } = await resend.emails.send({
    from: 'Coach Kush <support@coachkush.in>',
    to: [recipient],
    replyTo: 'support@coachkush.in',
    subject: `Welcome to CoachKush, ${clientName}! Thank You for Joining 🔥`,
    html: welcomeHtml,
  });

  if (error) {
    console.error('Error sending email via Resend:');
    console.error(error);
    return;
  }

  console.log('Email sent successfully!');
  console.log('Resend Response ID:', data.id);
})();
