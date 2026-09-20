# CoachKush - Production Deployment Guide
**Architecture**: React + Vite + Supabase (PostgreSQL, Auth, Storage, Edge Functions) + Razorpay

This modern serverless architecture eliminates traditional VPS maintenance, Express backend containers, and MongoDB hosting in favor of **Vercel** for the frontend and **Supabase** for database, auth, storage, and serverless Edge Functions.

---

## 🏗️ Architecture Overview

| Component | Provider | Details |
|---|---|---|
| **Frontend** | Vercel | React 18 + Vite SPA |
| **Database** | Supabase | PostgreSQL 15 with Row-Level Security (RLS) |
| **Authentication** | Supabase Auth | Built-in JWT with role-based policies |
| **Backend Logic** | Supabase Edge Functions | Deno/JavaScript serverless workers |
| **Object Storage** | Supabase Storage | `product-images` (public) & `avatars` (private) |
| **Payments** | Razorpay | Standard Checkout with server-side HMAC-SHA256 verification |

---

## 🛠️ Step-by-Step Deployment Sequence

### 1. Supabase Project Setup
1. Log in to [Supabase](https://supabase.com) and create a new project named `CoachKush`.
2. Save your Project URL, Anon/Publishable Key, and Service Role Key from **Project Settings > API**.
3. Install the Supabase CLI locally:
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```

### 2. Run Database Migration & Seeds
Execute the comprehensive migration file which provisions all 18+ tables, RLS policies, storage buckets, and seeds the 4 coaching products:
```bash
supabase db push
```
Or execute `supabase/migrations/20250101000000_supabase_razorpay_schema.sql` directly in the Supabase SQL Editor.

### 3. Configure Edge Functions Secrets
Set your Razorpay secrets in Supabase (these remain strictly server-side and are NEVER exposed to the frontend):
```bash
supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
supabase secrets set RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
supabase secrets set RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxx
```

### 4. Deploy Supabase Edge Functions
Deploy the three serverless payment handlers:
```bash
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
supabase functions deploy razorpay-webhook
```

Verify deployment:
```bash
supabase functions list
```

### 5. Configure Razorpay Webhook
1. Go to the [Razorpay Dashboard](https://dashboard.razorpay.com/) > **Settings** > **Webhooks**.
2. Click **Add New Webhook**.
3. Set the Webhook URL to:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/razorpay-webhook
   ```
4. Enter your `RAZORPAY_WEBHOOK_SECRET`.
5. Select active events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`

### 6. Deploy Frontend to Vercel
1. Import your repository into [Vercel](https://vercel.com).
2. Configure Environment Variables in the Vercel Dashboard:
   - `VITE_SUPABASE_URL`: `https://YOUR_PROJECT_REF.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: `YOUR_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID`: `rzp_live_xxxxxxxx`
   - `VITE_WHATSAPP_CONTACT_URL`: `https://wa.me/917042858524`
3. Deploy! Vercel will automatically run `npm run build` producing the production bundle in `frontend/dist`.

---

## 📋 Production Verification Checklist

- [x] Legacy MongoDB and Express backend removed
- [ ] Database migration executed against Supabase PostgreSQL
- [ ] Row-Level Security (RLS) active on all tables
- [ ] 4 official coaching products seeded with features
- [ ] Supabase Auth configured (Email/Password)
- [ ] Storage buckets created (`product-images`, `avatars`)
- [ ] Razorpay secrets configured in Supabase secrets
- [ ] Edge Functions deployed (`create-razorpay-order`, `verify-razorpay-payment`, `razorpay-webhook`)
- [ ] Razorpay webhook URL configured in Razorpay dashboard
- [ ] Test successful payment flow in sandbox mode
- [ ] Test coupon discounts (`KUSH10`, `TRANSFORM500`)
- [ ] Test signature verification declines mismatched payload
- [ ] Test webhook idempotency with duplicate events
- [ ] Frontend deployed and verified on Vercel
