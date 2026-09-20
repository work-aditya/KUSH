# CoachKush - Elite Online Coaching Platform
**Stack**: React + Vite + JavaScript (JSX) + Supabase + Razorpay

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A sharp, modern, high-performance online coaching platform designed for Coach Kush. Built on **React 18**, **Vite**, **Supabase** (PostgreSQL, Supabase Auth, Storage, Edge Functions), and **Razorpay** payment gateway.

---

## 🏛️ Architecture Overview

```
Client (Browser)
    │
    ├── Public / Trainee UI ─────────► Supabase Auth (JWT & Role verification)
    │                                ├── PostgreSQL Database (RLS Enforced)
    │                                └── Supabase Storage (product-images, avatars)
    │
    └── Checkout Initiation ────────► Supabase Edge Functions (Deno / JavaScript)
                                     ├── create-razorpay-order
                                     │     └─► Fetches authoritative price from PostgreSQL
                                     │     └─► Applies validated coupon
                                     │     └─► Calls Razorpay REST API
                                     │
                                     ├── verify-razorpay-payment
                                     │     └─► Verifies HMAC-SHA256 signature
                                     │     └─► Updates order status to 'paid'
                                     │     └─► Activates program_enrollments
                                     │
                                     └── razorpay-webhook
                                           └─► Idempotent webhook handling (payment_events)
```

---

## 🚀 Technology Stack

### Frontend
- **Framework**: React 18 + Vite (JavaScript / JSX)
- **Styling**: Tailwind CSS (Obsidian, Amber Accent, Emerald palette)
- **State Management**: TanStack Query v5 + Redux Toolkit
- **Client SDK**: `@supabase/supabase-js`
- **Routing**: React Router v6 (Protected & Role-guarded Admin layouts)
- **Forms & Validation**: React Hook Form + Zod
- **Icons & Micro-animations**: Lucide React + Framer Motion

### Backend & Serverless
- **Platform**: Supabase
- **Database**: PostgreSQL 15 with Row Level Security (RLS) policies
- **Edge Functions**: Deno / JavaScript
  - `create-razorpay-order`
  - `verify-razorpay-payment`
  - `razorpay-webhook`
- **Authentication**: Supabase Auth (JWT + Profiles trigger)
- **Payments**: Razorpay Standard Checkout + Webhooks

---

## 🛠️ Local Development Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `frontend/.env` and update values:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
VITE_RAZORPAY_KEY_ID=rzp_test_placeholder
VITE_WHATSAPP_CONTACT_URL=https://wa.me/917042858524
```

### 3. Run Local Supabase (Optional)
```bash
npx supabase start
npx supabase db push
npx supabase functions serve --env-file supabase/functions/.env
```

### 4. Start Vite Dev Server
```bash
npm run dev
```

Navigate to `http://localhost:5173` to explore the live website and coaching programs.

---

## 📦 Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components & checkout modal
│   │   ├── hooks/           # useAuth and custom hooks
│   │   ├── layouts/         # Main & Admin layouts
│   │   ├── lib/
│   │   │   └── supabaseClient.js  # Supabase client singleton
│   │   ├── pages/           # Public & Admin pages
│   │   ├── services/
│   │   │   ├── productService.js  # PostgreSQL products query
│   │   │   ├── paymentService.js  # Edge Functions payment client
│   │   │   ├── authService.js     # Supabase Auth client
│   │   │   ├── orderService.js    # Order & coupon manager
│   │   │   ├── adminService.js    # Direct Supabase Admin CRUD
│   │   │   └── contactService.js  # Contact messages & CMS
│   │   └── store/           # Redux slices
├── supabase/
│   ├── config.toml          # Supabase CLI configuration
│   ├── migrations/
│   │   └── 20250101000000_supabase_razorpay_schema.sql # Complete DB schema & seeds
│   └── functions/
│       ├── create-razorpay-order/
│       ├── verify-razorpay-payment/
│       └── razorpay-webhook/
├── DEPLOYMENT.md            # Production deployment guide (Vercel + Supabase)
├── vercel.json              # Vercel SPA routing configuration
└── package.json             # Root monorepo scripts
```

---

## 🔒 Security Principles

1. **Zero Client Trust**: All product prices and discount calculations are executed on the server.
2. **PostgreSQL Row-Level Security (RLS)**: Enforced across all tables; customers can only access their own profile and orders.
3. **Cryptographic Signature Verification**: Razorpay payment signatures are validated using HMAC-SHA256 on the server.
4. **Secrets Isolation**: `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` are never bundled into client-side code.
