# CoachKush - Production Full-Stack Online Coaching Platform

[![CI Pipeline](https://github.com/coachkush/platform/actions/workflows/ci.yml/badge.svg)](https://github.com/coachkush/platform/actions/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A sharp, minimalistic, high-performance full-stack online coaching platform designed for Coach Kush. Supports real-time interactive 1-on-1 and couple coaching sessions via **Google Meet** and **Zoom**, featuring official **Razorpay** payment processing, cryptographic signature verification, dynamic coupon discount promotions, automated **PDF tax invoice** generation, **SMTP email confirmation**, editable CMS documents (Privacy Policy, Terms), and a role-based administrative dashboard.

---

## 🏛️ Application Architecture

```
Internet
    │
    ▼
Domain / DNS
    │
    ▼
Nginx Reverse Proxy (:80 / :443)
    ├── / ───────► React Vite SPA (:80 internal)
    └── /api ────► Express REST API (:5000 internal)
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
    MongoDB Atlas           Razorpay Gateway
          │                         │
          │ (Authoritative)         ▼ (Signature Verification)
          ▼                  Verified Result
      Database                      │
          │                         ▼
          ├──────────────► PDFKit Invoice Generation
          │                         │
          ▼                         ▼
   Trainee Orders ◄─────── Nodemailer SMTP Email
```

---

## 🚀 Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (Custom Dark & Athletic Obsidian/Amber/Emerald palette)
- **State Management**: TanStack Query v5 (server state) + Redux Toolkit (auth & UI session state)
- **Routing**: React Router v6 with Protected & Role-guarded Admin layouts
- **HTTP Client**: Axios with interceptors and HTTP-only cookie credentials
- **Forms & Validation**: React Hook Form + Zod
- **Icons & Micro-animations**: Lucide React + Framer Motion

### Backend
- **Runtime & Framework**: Node.js 22 + Express.js REST API
- **Database & ODM**: MongoDB with Mongoose
- **Password Hashing**: Argon2id (`argon2`)
- **Authentication**: JWT transported via Secure, SameSite, HTTP-only cookies (`coachkush_session`)
- **Payments**: Razorpay PG Standard Integration (HMAC-SHA256 signature verification, webhook verification, server-side authoritative pricing & coupons)
- **PDF Generation**: PDFKit (branded tax invoices)
- **Email Delivery**: Nodemailer (SMTP transport with PDF invoice attachment)
- **Security Middleware**: Helmet, CORS, Express Rate Limit, Mongo Sanitize, Structured JSON Logging

### DevOps & Deployment
- **Containerization**: Docker multi-stage builds (Alpine Linux, non-root user)
- **Orchestration**: Docker Compose
- **Web Server & Reverse Proxy**: Nginx with Gzip, HTTP-to-HTTPS redirect, rate limiting zones
- **CI/CD**: GitHub Actions (linting, tests, production build verification, automated server deploy)

---

## 🔒 Security Principles

1. **Zero Hard-Coded Credentials**: Every secret, domain, key, database URI, and password must be configured through environment variables or server secrets.
2. **Authoritative Server-Side Pricing & Discounts**: Trainees send only `pricingId` and optional `couponCode`. The backend retrieves the authoritative price from MongoDB and computes discounts securely. Client-submitted prices are completely ignored.
3. **Cryptographic Payment Verification**: Payment success is verified using Razorpay HMAC-SHA256 signatures before marking orders `paid`.
4. **Idempotency & Duplicate Protection**: Webhooks and status verification handlers are idempotent to eliminate double-charging or duplicate invoice generation.
5. **IDOR Prevention**: Trainees can only view or download invoices and orders matching their authenticated `userId`. Admin privileges are verified server-side via JWT identity (`role === 'admin'`).
6. **Credential Redaction**: Passwords, hashes, tokens, cookies, and gateway secret keys are automatically redacted from structured logs.

---

## 📁 Repository Structure

```
├── .github/workflows/       # CI & CD GitHub Actions workflows
├── nginx/                   # Root reverse proxy Nginx configuration
├── docker-compose.yml       # Multi-container production deployment
├── .env.example             # Complete environment configuration template
├── backend/
│   ├── Dockerfile           # Multi-stage Node 22 Alpine backend container
│   ├── src/
│   │   ├── config/          # Environment validation, DB, logger
│   │   ├── controllers/     # REST controllers (auth, pricing, orders, payments, coupons, admin)
│   │   ├── middleware/      # Auth, rateLimiter, errorHandler, validation
│   │   ├── models/          # User, Pricing, Page, Order, Payment, Invoice, Coupon, ContactMessage
│   │   ├── routes/          # Express route declarations
│   │   ├── services/        # Razorpay, PDFKit Invoice, Nodemailer, Admin Bootstrapper
│   │   ├── templates/       # HTML email templates
│   │   └── utils/           # Argon2id hash, JWT cookies, response formatter
│   └── tests/               # Jest & Supertest integration tests
└── frontend/
    ├── Dockerfile           # Multi-stage Vite build + Nginx static server
    ├── nginx.conf           # SPA client routing fallback configuration
    └── src/
        ├── components/      # Navbar, Footer, Buttons, Modals, WhatsApp CTA, FAQSection, CheckoutModal
        ├── layouts/         # MainLayout, AdminLayout
        ├── pages/           # Home, About, Pricing, FAQ, Contact, Login, Register, Payment, Admin
        ├── services/        # Axios API client modules
        └── store/           # Redux Toolkit auth and UI slices
```

---

## 🛠️ Local Development Setup

### 1. Clone & Configure Environment
```bash
cp .env.example .env
```
Edit `.env` to configure your MongoDB connection string and secret keys:
```ini
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/coachkush
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourSecureAdminPassword123!
WHATSAPP_CONTACT_URL=https://wa.me/917042858524
VITE_WHATSAPP_CONTACT_URL=https://wa.me/917042858524
RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_RAZORPAY_WEBHOOK_SECRET
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Seed Database
On initial backend startup, an admin account and the 4 initial pricing plans are automatically seeded. You can also seed manually:
```bash
cd backend && npm run seed
```

### 4. Run Development Servers
```bash
# Terminal 1: Backend API (http://localhost:5000)
cd backend && npm run dev

# Terminal 2: Frontend Vite App (http://localhost:5173)
cd frontend && npm run dev
```

---

## 🧪 Testing

Execute the automated test suite:
```bash
# Run backend integration tests
cd backend && npm test

# Run frontend build check
cd frontend && npm run build
```

---

## 🚢 Production Deployment

For full VPS deployment instructions with Let's Encrypt SSL, see [DEPLOYMENT.md](file:///f:/CODING/SECOND/DEPLOYMENT.md).
