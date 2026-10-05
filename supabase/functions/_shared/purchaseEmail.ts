// Supabase Edge Functions Shared: purchaseEmail.ts
// Runtime: Deno (TypeScript)
// Automated email confirmation with Coach Kush contact guidance

export interface PurchaseEmailOptions {
  resendApiKey: string;
  recipientEmail: string;
  recipientName?: string;
  orderNumber: string;
  planName: string;
  amount: number | string;
  currency?: string;
}

export function buildPurchaseEmailHtml({
  recipientName = "Athlete",
  orderNumber,
  planName,
  amount,
  currency = "INR",
}: {
  recipientName?: string;
  orderNumber: string;
  planName: string;
  amount: number | string;
  currency?: string;
}): string {
  const currentYear = new Date().getFullYear();
  const whatsappPreFilled = encodeURIComponent(
    `Hi Kush, I just completed my purchase for ${planName}! (Order: ${orderNumber})`
  );
  const whatsappUrl = `https://wa.me/917042858524?text=${whatsappPreFilled}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coaching Enrollment Confirmed - Coach Kush</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070A0F; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E2E8F0; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070A0F; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0F1622; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #162032 0%, #0F172A 100%); padding: 36px 30px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
              <div style="display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #10B981; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.25); padding: 4px 14px; border-radius: 9999px; margin-bottom: 12px;">
                Official Enrollment Confirmed
              </div>
              <h1 style="font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: #FFFFFF; margin: 0;">
                COACH <span style="color: #F59E0B;">KUSH</span>
              </h1>
              <p style="font-size: 13px; color: #94A3B8; margin-top: 6px; margin-bottom: 0;">
                Elite 1-on-1 Fitness, Nutrition & Biomechanics Coaching
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 36px 30px;">
              <h2 style="font-size: 22px; font-weight: 800; color: #FFFFFF; margin: 0 0 16px 0;">
                Welcome to CoachKush, ${recipientName}! 🔥
              </h2>
              <p style="font-size: 15px; line-height: 1.6; color: #CBD5E1; margin: 0 0 24px 0;">
                Thank you for your purchase. Your payment and enrollment have been verified, and your custom coaching protocol is now active.
              </p>

              <!-- Order Summary Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #172133; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 14px; padding: 20px 24px; margin-bottom: 28px;">
                <tr>
                  <td colspan="2" style="font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #F59E0B; padding-bottom: 12px;">
                    Order Details
                  </td>
                </tr>
                <tr>
                  <td style="color: #94A3B8; font-size: 14px; padding: 6px 0;">Enrolled Program:</td>
                  <td align="right" style="color: #FFFFFF; font-weight: 700; font-size: 14px; padding: 6px 0;">${planName}</td>
                </tr>
                <tr>
                  <td style="color: #94A3B8; font-size: 14px; padding: 6px 0;">Order Reference:</td>
                  <td align="right" style="color: #94A3B8; font-family: monospace; font-size: 13px; padding: 6px 0;">${orderNumber}</td>
                </tr>
                <tr>
                  <td style="color: #94A3B8; font-size: 14px; padding: 6px 0;">Total Amount:</td>
                  <td align="right" style="color: #10B981; font-weight: 700; font-size: 15px; padding: 6px 0;">₹${amount}</td>
                </tr>
                <tr>
                  <td style="color: #94A3B8; font-size: 14px; padding: 6px 0;">Status:</td>
                  <td align="right" style="color: #10B981; font-weight: 700; font-size: 13px; padding: 6px 0;">PAID & CONFIRMED</td>
                </tr>
              </table>

              <!-- Prominent Contact Coach Kush Callout -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 14px; padding: 22px 24px; margin-bottom: 28px;">
                <tr>
                  <td>
                    <h3 style="color: #FFFFFF; font-size: 16px; font-weight: 800; margin: 0 0 10px 0;">
                      ⚡ Next Step: Contact Coach Kush Directly
                    </h3>
                    <p style="font-size: 14px; color: #CBD5E1; line-height: 1.6; margin: 0 0 16px 0;">
                      To kick off your intake audit, customize your diet and workout plans, and schedule your live video coaching sessions on Google Meet / Zoom, please contact Coach Kush immediately through any of these options:
                    </p>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 18px;">
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #E2E8F0;">
                          &bull; <strong>WhatsApp:</strong> 
                          <a href="${whatsappUrl}" style="color: #10B981; font-weight: 700; text-decoration: none;">+91 70428 58524</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #E2E8F0;">
                          &bull; <strong>Official Support Email:</strong> 
                          <a href="mailto:support@coachkush.in" style="color: #38BDF8; font-weight: 600; text-decoration: none;">support@coachkush.in</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #E2E8F0;">
                          &bull; <strong>Direct Email:</strong> 
                          <a href="mailto:jeekush460@gmail.com" style="color: #38BDF8; font-weight: 600; text-decoration: none;">jeekush460@gmail.com</a>
                        </td>
                      </tr>
                    </table>
                    <div style="text-align: center; margin-top: 14px;">
                      <a href="${whatsappUrl}" style="display: inline-block; background-color: #25D366; color: #FFFFFF !important; font-size: 15px; font-weight: 800; text-decoration: none; padding: 13px 28px; border-radius: 12px; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.4);">
                        💬 Chat with Coach Kush on WhatsApp
                      </a>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; color: #94A3B8; line-height: 1.6; margin: 0;">
                If you have questions about your sessions or need an official invoice copy, simply reply directly to this email or send a message on WhatsApp anytime.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #0A0F17; padding: 24px 30px; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 12px; color: #64748B; line-height: 1.6;">
              <p style="margin: 0 0 6px 0;">
                Contact: <a href="mailto:support@coachkush.in" style="color: #94A3B8; text-decoration: none;">support@coachkush.in</a> &bull; <a href="mailto:jeekush460@gmail.com" style="color: #94A3B8; text-decoration: none;">jeekush460@gmail.com</a> &bull; <a href="https://wa.me/917042858524" style="color: #94A3B8; text-decoration: none;">+91 70428 58524</a>
              </p>
              <p style="margin: 0;">
                &copy; ${currentYear} CoachKush Fitness. All rights reserved. &bull; <a href="https://coachkush.in" style="color: #94A3B8; text-decoration: none;">coachkush.in</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendPurchaseConfirmationEmail(
  options: PurchaseEmailOptions
): Promise<{ success: boolean; id?: string; error?: string }> {
  const {
    resendApiKey,
    recipientEmail,
    recipientName = "Athlete",
    orderNumber,
    planName,
    amount,
    currency = "INR",
  } = options;

  if (!resendApiKey) {
    console.warn("[Email Skipped] Missing RESEND_API_KEY");
    return { success: false, error: "Missing RESEND_API_KEY" };
  }

  if (!recipientEmail) {
    console.warn("[Email Skipped] Missing recipientEmail");
    return { success: false, error: "Missing recipientEmail" };
  }

  const html = buildPurchaseEmailHtml({
    recipientName,
    orderNumber,
    planName,
    amount,
    currency,
  });

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Coach Kush <support@coachkush.in>",
        to: [recipientEmail],
        reply_to: ["support@coachkush.in", "jeekush460@gmail.com"],
        subject: `Welcome to CoachKush! Your Enrollment is Confirmed (${orderNumber})`,
        html: html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Resend Error]:", res.status, errText);
      return { success: false, error: errText };
    }

    const data = await res.json();
    console.log("[Resend Success] Purchase confirmation email sent, ID:", data.id);
    return { success: true, id: data.id };
  } catch (err: any) {
    console.error("[Resend Exception]:", err);
    return { success: false, error: err.message };
  }
}
