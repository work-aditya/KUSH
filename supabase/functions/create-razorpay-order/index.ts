// Supabase Edge Function: create-razorpay-order
// Runtime: Deno (JavaScript)
// Rule: Never trust frontend price or payment status

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase server environment variables not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Authenticate caller using Supabase JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Parse payload: React sends ONLY product_id, optional quantity, and optional coupon_code
    const body = await req.json();
    const { product_id, quantity = 1, coupon_code } = body;

    if (!product_id) {
      return new Response(
        JSON.stringify({ error: "Product ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Authoritative product price lookup from PostgreSQL
    let productQuery = supabase.from("products").select("*").eq("is_active", true);
    const isProductUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(product_id).trim());
    if (isProductUUID) {
      productQuery = productQuery.eq("id", String(product_id).trim());
    } else {
      productQuery = productQuery.eq("slug", String(product_id).trim());
    }

    const { data: product, error: prodError } = await productQuery.single();

    if (prodError || !product) {
      return new Response(
        JSON.stringify({ error: "Requested product was not found or is inactive" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const unitPrice = parseFloat(product.price);
    const subtotal = unitPrice * qty;

    // 4. Authoritative coupon calculation if provided
    let discountAmount = 0;
    let validatedCoupon = null;

    if (coupon_code) {
      const cleanCode = String(coupon_code).trim().toUpperCase();
      const { data: coupon, error: couponError } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", cleanCode)
        .eq("is_active", true)
        .single();

      if (!couponError && coupon) {
        const now = new Date();
        const validStart = !coupon.starts_at || new Date(coupon.starts_at) <= now;
        const validExpiry = !coupon.expires_at || new Date(coupon.expires_at) >= now;
        const validLimit = !coupon.usage_limit || coupon.used_count < coupon.usage_limit;
        const validMinAmount = subtotal >= parseFloat(coupon.minimum_order_amount || 0);

        if (validStart && validExpiry && validLimit && validMinAmount) {
          validatedCoupon = coupon;
          if (coupon.discount_type === "percentage") {
            const rawDiscount = (subtotal * parseFloat(coupon.discount_value)) / 100;
            discountAmount = coupon.max_discount_amount
              ? Math.min(rawDiscount, parseFloat(coupon.max_discount_amount))
              : rawDiscount;
          } else if (coupon.discount_type === "fixed") {
            discountAmount = Math.min(subtotal, parseFloat(coupon.discount_value));
          }
        }
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);
    const orderNumber =
      "CK-" +
      Date.now().toString(36).toUpperCase() +
      "-" +
      Math.random().toString(36).substring(2, 6).toUpperCase();

    // 5. Ensure profile exists for customer to satisfy foreign key
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Client",
      },
      { onConflict: "id", ignoreDuplicates: true }
    );

    // 6. Create Order and Order Items in PostgreSQL
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: user.id,
        subtotal: subtotal,
        discount_amount: discountAmount,
        tax_amount: 0,
        shipping_amount: 0,
        total_amount: totalAmount,
        currency: "INR",
        status: "pending",
        coupon_code: validatedCoupon ? validatedCoupon.code : null,
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(`Failed to create order record: ${orderError?.message}`);
    }

    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      unit_price: unitPrice,
      quantity: qty,
      subtotal: subtotal,
    });

    // 6. Handle 100% Free / Zero Amount Orders (No Razorpay transaction required)
    if (totalAmount <= 0) {
      await supabase.from("orders").update({ status: "paid" }).eq("id", order.id);

      await supabase.from("payments").insert({
        order_id: order.id,
        provider: "coupon",
        razorpay_order_id: `free_${Date.now()}`,
        amount: 0,
        currency: "INR",
        status: "captured",
        paid_at: new Date().toISOString(),
      });

      await supabase.from("program_enrollments").insert({
        customer_id: user.id,
        product_id: product.id,
        order_id: order.id,
        start_date: new Date().toISOString().split("T")[0],
        status: "active",
      });

      if (validatedCoupon) {
        await supabase
          .from("coupons")
          .update({ used_count: (validatedCoupon.used_count || 0) + 1 })
          .eq("id", validatedCoupon.id);
      }

      return new Response(
        JSON.stringify({
          success: true,
          freeOrder: true,
          orderId: order.id,
          orderNumber: order.order_number,
          razorpayOrderId: null,
          amount: 0,
          currency: "INR",
          keyId: razorpayKeyId || "rzp_test_placeholder",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. Create Razorpay Order
    let razorpayOrderId = "";
    const isMock =
      !razorpayKeyId ||
      !razorpayKeySecret ||
      razorpayKeyId.startsWith("rzp_test_placeholder") ||
      razorpayKeyId === "YOUR_RAZORPAY_KEY_ID";

    if (isMock) {
      // Sandbox fallback for development without live keys
      razorpayOrderId = `order_sim_${Date.now()}`;
    } else {
      const basicAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100), // amount in paise
          currency: "INR",
          receipt: orderNumber,
          notes: {
            order_id: String(order.id),
            customer_id: user.id,
            product_slug: product.slug,
          },
        }),
      });

      if (!rzpRes.ok) {
        const errorText = await rzpRes.text();
        throw new Error(`Razorpay API order creation failed: ${errorText}`);
      }

      const rzpData = await rzpRes.json();
      razorpayOrderId = rzpData.id;
    }

    // 7. Insert Payment record
    const { error: payError } = await supabase.from("payments").insert({
      order_id: order.id,
      provider: "razorpay",
      razorpay_order_id: razorpayOrderId,
      amount: totalAmount,
      currency: "INR",
      status: "created",
    });

    if (payError) {
      console.warn("Could not insert initial payment record:", payError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        razorpayOrderId: razorpayOrderId,
        amount: totalAmount,
        currency: "INR",
        keyId: razorpayKeyId || "rzp_test_placeholder",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("create-razorpay-order error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
