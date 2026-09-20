// Supabase Edge Function: razorpay-webhook
// Runtime: Deno (JavaScript)
// Rule: Idempotently process official Razorpay webhook events with signature verification

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

async function verifyHmacSha256(secret, rawPayload, expectedHex) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(rawPayload));
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex === expectedHex;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase server environment variables not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // 1. Signature Verification
    if (webhookSecret && webhookSecret !== "YOUR_RAZORPAY_WEBHOOK_SECRET") {
      if (!signature) {
        return new Response(JSON.stringify({ error: "Missing webhook signature" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const isValid = await verifyHmacSha256(webhookSecret, rawBody, signature);
      if (!isValid) {
        return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const eventId = event.event_id || event.id || `evt_${Date.now()}`;
    const payload = event.payload || {};

    // 2. Idempotency Check: Prevent duplicate event processing
    const { data: existingEvent } = await supabase
      .from("payment_events")
      .select("id")
      .eq("razorpay_event_id", eventId)
      .single();

    if (existingEvent) {
      return new Response(
        JSON.stringify({ received: true, already_processed: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Extract Razorpay Entities
    const paymentEntity = payload.payment?.entity;
    const orderEntity = payload.order?.entity;
    const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;
    const rzpPaymentId = paymentEntity?.id;

    // Find internal payment/order
    let internalPayment = null;
    if (rzpOrderId) {
      const { data } = await supabase
        .from("payments")
        .select("*, orders(*, order_items(*))")
        .eq("razorpay_order_id", rzpOrderId)
        .single();
      internalPayment = data;
    }

    // 4. Record event in payment_events table
    await supabase.from("payment_events").insert({
      payment_id: internalPayment ? internalPayment.id : null,
      razorpay_event_id: eventId,
      event_type: eventType,
      payload: event,
    });

    // 5. State transitions based on event
    if (eventType === "payment.captured" || eventType === "order.paid") {
      if (internalPayment) {
        // Update payment record
        await supabase
          .from("payments")
          .update({
            status: "captured",
            razorpay_payment_id: rzpPaymentId || internalPayment.razorpay_payment_id,
            method: paymentEntity?.method || internalPayment.method,
            paid_at: new Date().toISOString(),
          })
          .eq("id", internalPayment.id);

        // Update order record
        await supabase
          .from("orders")
          .update({
            status: "paid",
            updated_at: new Date().toISOString(),
          })
          .eq("id", internalPayment.order_id);

        // Provision enrollment if missing
        const customerId = internalPayment.orders?.customer_id;
        const productId = internalPayment.orders?.order_items?.[0]?.product_id;

        if (customerId && productId) {
          const { data: existingEnrollment } = await supabase
            .from("program_enrollments")
            .select("id")
            .eq("order_id", internalPayment.order_id)
            .single();

          if (!existingEnrollment) {
            await supabase.from("program_enrollments").insert({
              customer_id: customerId,
              product_id: productId,
              order_id: internalPayment.order_id,
              start_date: new Date().toISOString().split("T")[0],
              status: "active",
            });
          }
        }
      }
    } else if (eventType === "payment.failed") {
      if (internalPayment) {
        await supabase
          .from("payments")
          .update({
            status: "failed",
            razorpay_payment_id: rzpPaymentId,
          })
          .eq("id", internalPayment.id);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("razorpay-webhook error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Webhook processing failure" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
