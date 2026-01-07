<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🚀 BullsandbearsFX - Premium Cryptocurrency & Forex Trading Platform

A production-ready React 19 + TypeScript frontend integrated with a Next.js 14 backend, featuring JWT authentication, multi-tier investments, wallet management, and role-based admin controls.

**Live Demo:** https://ai.studio/apps/drive/1ABjYjYsKwFN_SCEWIcmCp8R0G33gDnik

---

## 📋 Project Overview

BullsandbearsFX is an institutional-grade trading platform that enables users to:
- 💰 **Invest** in 4-tier plans (Starter → Platinum) with 30-80% ROI
- 🤖 **Copy Trade** from expert traders with real-time execution
- 💸 **Manage Wallets** with crypto deposits/withdrawals
- 📊 **Track Investments** with ROI calculations and completion timelines
- 🔗 **Earn Referrals** (10-25% commission per tier)
- 🎯 **Access Admin Dashboard** for transaction approvals and platform management

**Architecture:** Service-based frontend with dedicated backend API integration, role-based access control (INVESTOR, TENANT_ADMIN, SUPER_ADMIN), and multi-tenant support.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages: Landing, Dashboard, Admin, Super-Admin       │   │
│  │  Protected Routes with Role-Based Access Control     │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Service Layer (TypeScript)               │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ authService      - Auth flow & user refresh     │ │   │
│  │  │ walletService    - Balance & transactions       │ │   │
│  │  │ transactionService - History & admin approval   │ │   │
│  │  │ investmentService - Investment lifecycle        │ │   │
│  │  │ adminService     - Admin operations & ROI       │ │   │
│  │  │ aiService        - Gemini AI insights           │ │   │
│  │  │ cryptoService    - Market data & fallbacks      │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓ (HTTPS/JWT)
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Next.js 14)                      │
│              https://investment-platform-core.vercel.app     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Auth API    - Login, signup, user refresh (GET/me)  │   │
│  │  Wallet API  - Balance, deposits, withdrawals        │   │
│  │  Investment API - List, create, track ROI            │   │
│  │  Transaction API - History, approve, reject          │   │
│  │  Admin API   - Stats, payment addresses, ROI distrib │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Database (PostgreSQL + Prisma)          │   │
│  │  Users, Wallets, Transactions, Investments, Plans    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 19.2.3 |
| **Build Tool** | Vite | 6.2.0 |
| **Language** | TypeScript | 5.8.2 |
| **Routing** | React Router | 6.22.3 |
| **Icons** | Lucide React | 0.562.0 |
| **AI** | Google Generative AI | 1.34.0 |
| **Styling** | Tailwind CSS (via HTML) | Latest |
| **Backend** | Next.js 14 | (separate repo) |
| **Auth** | JWT (Bearer tokens) | - |
| **Database** | PostgreSQL | (backend) |

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js** 16+ (LTS recommended)
- **npm** 8+ or **yarn**
- **Git**

### Step 1: Clone Repository
```bash
git clone https://github.com/Scott0275/BullsandbearsFX.git
cd BullsandbearsFX
```

### Step 2: Install Dependencies
```bash
npm install
```
This installs 138 packages including React, TypeScript, Vite, and Lucide icons.

### Step 3: Configure Environment Variables
Create `.env.local` in the project root:

```env
# Gemini AI API Key (for market insights)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Backend API URL (defaults to production)
# VITE_API_BASE_URL=http://localhost:3000
```

**Where to get `GEMINI_API_KEY`:**
1. Visit [Google AI Studio](https://ai.google.dev/tutorials/setup)
2. Generate an API key
3. Paste in `.env.local`

### Step 4: Start Development Server
```bash
npm run dev
```

Server runs on `http://localhost:3000` and is accessible from any network interface.

### Step 5: Open in Browser
```bash
# Local: http://localhost:3000
# Network: http://192.168.x.x:3000
```

---

## 🔐 Authentication & Authorization

### Login Flow

1. **User enters credentials** → AuthModal validates
2. **Frontend calls** `POST /api/auth/login`
3. **Backend verifies** email & password against database
4. **Returns** `{ token: "JWT...", user: { id, email, name, role, tenantId } }`
5. **Frontend stores** token + user in localStorage
6. **App redirects** based on role:
   - `INVESTOR` → `/dashboard`
   - `TENANT_ADMIN` → `/admin`
   - `SUPER_ADMIN` → `/super-admin`

### Protected Routes

All dashboard routes use `ProtectedRoute` HOC:

```tsx
<ProtectedRoute user={user} allowedRoles={['INVESTOR']}>
  <InvestorDashboard />
</ProtectedRoute>
```

**Access check flow:**
1. No user → Redirects to `/` (landing page)
2. User + wrong role → Redirects to `/`
3. User + correct role → Renders dashboard

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| SUPER_ADMIN | oscarscott2411@gmail.com | Oscar101@ |
| INVESTOR | (created via signup) | (your choice) |

---

## 🔌 Service Layer Architecture

The frontend uses a **service-based architecture** for all API communication. Each service handles a specific domain:

### Core Services

#### 1. **authService** - Authentication & User Management
```typescript
// Login user
await authService.login({ email, password });

// Refresh user data from database (called on app boot)
await authService.refreshUserData(); // GET /api/auth/me

// Get current user from localStorage
const user = authService.getCurrentUser();

// Logout
authService.logout();
```

**Key innovation:** `refreshUserData()` ensures user data is always synced from the database, preventing stale cached data.

---

#### 2. **walletService** - Balance & Transactions
```typescript
// Get wallet balance + transaction history
const { wallet, transactions } = await walletService.getWallet();

// Request deposit (crypto payment flow)
await walletService.requestDeposit(5000, 'ETH', '0x...');
// Returns: PENDING transaction + crypto address to send to
// Admin approves when payment is verified on blockchain

// Request withdrawal
await walletService.requestWithdrawal(1000, '0x...');
// Returns: PENDING transaction
// Admin processes after verification
```

**Payment Flow:**
1. User requests deposit → Transaction created (PENDING)
2. User sends crypto to provided address
3. Admin verifies on blockchain + approves
4. Wallet credited + referral rewards processed

---

#### 3. **transactionService** - History & Admin Operations
```typescript
// List transactions (paginated)
const result = await transactionService.listTransactions(page, limit);

// Admin: Approve transaction
await transactionService.approveTransaction(transactionId);

// Admin: Reject transaction
await transactionService.rejectTransaction(transactionId);
```

**Transaction Types:**
- `DEPOSIT` - User requested deposit (PENDING until approved)
- `WITHDRAWAL` - User requested withdrawal
- `INVESTMENT_DEBIT` - Funds moved to investment
- `ROI_CREDIT` - ROI distributed from completed investment
- `REFERRAL_CREDIT` - Referral reward (auto-credited)

---

#### 4. **investmentService** - Investment Lifecycle
```typescript
// List all investments (active + completed)
const investments = await investmentService.listInvestments();

// Create new investment
const newInvest = await investmentService.createInvestment(planId, 2000);
// Validates: sufficient balance, plan exists, amount in range
// Creates INVESTMENT_DEBIT transaction
// ROI credited when investment completes
```

**Investment Plans:**
| Plan | Amount Range | ROI | Features |
|------|--------------|-----|----------|
| Starter | $1K-$5K | 30% | Basic support, 10% referrals |
| Silver | $5K-$50K | 45% | Priority trading, 15% referrals |
| Gold | $50K-$100K | 60% | Dedicated manager, 20% referrals |
| Platinum | $100K+ | 80% | All premium, direct desk, 25% referrals |

---

#### 5. **adminService** - Admin Operations (TENANT_ADMIN, SUPER_ADMIN)
```typescript
// Get admin dashboard stats
const stats = await adminService.getStats();
// Returns: overview (users, AUM, expected returns), 
//          investments breakdown, pending transactions

// Manage crypto payment addresses
const addresses = await adminService.getPaymentAddresses();
await adminService.addPaymentAddress('ETH', '0x1234...');

// Distribute ROI to completed investments (SUPER_ADMIN only)
await adminService.distributeROI();
// Processes all completed investments, credits wallets, prevents double-distribution
```

---

#### 6. **aiService** - AI Market Insights (Gemini)
```typescript
const insight = await getMarketInsights('BTC, ETH, SOL');
// Returns: Professional market sentiment analysis
// Falls back gracefully on API failure with professional message
```

**Model:** `gemini-3-flash-preview` (high-speed, cost-effective)

---

#### 7. **cryptoService** - Market Data (CoinGecko)
```typescript
const assets = await fetchMarketData();
// Returns: Top 20 crypto assets with 24h price change
// Falls back to MOCK_ASSETS if API rate-limited
```

---

## 📝 API Headers & Authentication

Every backend request includes these headers (auto-injected by `getHeaders()`):

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-User-ID: user456xyz
X-User-Tenant-ID: tenant123abc
X-User-Role: INVESTOR
X-Tenant-Slug: bullsandbearsfx
Content-Type: application/json
```

**Backend validates:**
- Valid JWT signature
- User exists in database
- User has required role for endpoint
- User belongs to correct tenant (multi-tenant)

---

## 🚀 Build & Deployment

### Production Build
```bash
npm run build
```
Generates optimized static files in `dist/` directory.

### Preview Production Build
```bash
npm run preview
```
Serves production build locally for testing.

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

**Environment Variables in Vercel:**
- `GEMINI_API_KEY` - Your Gemini API key
- `VITE_API_BASE_URL` - Backend API URL (optional, defaults to production)

---

## 📁 Project Structure

```
BullsandbearsFX/
├── .github/
│   └── copilot-instructions.md    # AI coding agent guidelines
├── services/                       # Service layer (API integration)
│   ├── apiService.ts              # Base URL, headers, token management
│   ├── authService.ts             # Login, signup, user refresh
│   ├── walletService.ts           # Balance, deposits, withdrawals
│   ├── transactionService.ts      # Transaction history, approvals
│   ├── investmentService.ts       # Investment lifecycle
│   ├── adminService.ts            # Admin operations
│   ├── aiService.ts               # Gemini AI integration
│   └── cryptoService.ts           # CoinGecko market data
├── App.tsx                         # Main app, routing, state management
├── constants.tsx                   # Investment plans, services, FAQs
├── types.ts                        # TypeScript interfaces
├── index.tsx                       # React entry point
├── index.html                      # HTML template
├── vite.config.ts                  # Vite build configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies & scripts
└── README.md                       # This file
```

---

## 🔄 State Management Flow

```
User Login
   ↓
authService.login() → Backend returns { token, user }
   ↓
localStorage.setItem('auth_token', token)
localStorage.setItem('user_data', JSON.stringify(user))
   ↓
App.tsx: handleLoginSuccess(user) → setUser(user)
   ↓
ProtectedRoute checks user.role
   ↓
Dashboard renders with role-based content
```

**On app boot:**
```
App mounts
   ↓
authService.refreshUserData() → Fetches latest user from database
   ↓
setUser(freshUser) → App state updated
   ↓
isInitializing = false → Render phase begins
   ↓
Dashboards render (or landing page if no user)
```

---

## 🧪 Testing the App

### Test Login
1. Click **"Sign In"** button on landing page
2. Use test credentials:
   - Email: `oscarscott2411@gmail.com`
   - Password: `Oscar101@`
3. Verify redirect to `/super-admin`

### Test Investor Dashboard
1. Click **"Get Started"** to create new account
2. Fill signup form with valid email/password
3. Login with new credentials
4. Verify redirect to `/dashboard`

### Test Admin Functions
1. Login as SUPER_ADMIN (test credentials above)
2. Navigate to `/admin` → See transaction approvals
3. Approve a deposit → Wallet credited

---

## 🐛 Troubleshooting

### "Welcome back securely signing in" freeze
✅ **Fixed** - Removed race condition in `App.tsx`. App now waits for `isInitializing` flag before rendering routes.

### API returns 401 Unauthorized
- Verify `auth_token` in localStorage
- Check if token has expired
- Try logging out and back in

### "Failed to fetch wallet"
- Verify backend is running
- Check `VITE_API_BASE_URL` environment variable
- Look at browser console for detailed error

### Gemini AI insights not working
- Verify `GEMINI_API_KEY` in `.env.local`
- Check API key has proper permissions at https://ai.google.dev
- App has fallback message, won't crash

---

## 📚 Backend Integration Guide

Full backend integration documentation is in [`.github/copilot-instructions.md`](.github/copilot-instructions.md).

**Backend URL:** `https://investment-platform-core.vercel.app`  
**Backend Repo:** (Separate Next.js 14 project)

**Supported Endpoints:**
- ✅ POST `/api/auth/login` - User login
- ✅ POST `/api/auth/signup` - New account
- ✅ GET `/api/auth/me` - Refresh user data
- ✅ GET `/api/wallet` - Get balance + history
- ✅ POST `/api/wallet/deposit` - Request deposit
- ✅ POST `/api/wallet/withdraw` - Request withdrawal
- ✅ GET `/api/transactions` - List transactions
- ✅ POST `/api/transactions/approve` - Admin approval
- ✅ POST `/api/transactions/reject` - Admin rejection
- ✅ GET `/api/investments` - List investments
- ✅ POST `/api/investments` - Create investment
- ✅ GET `/api/admin/stats` - Admin dashboard
- ✅ GET `/api/admin/payment-addresses` - Crypto addresses
- ✅ POST `/api/admin/roi-distribution` - Distribute ROI

---

## 🤝 Contributing

1. **Read** [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for architecture guidelines
2. **Create feature branch:** `git checkout -b feature/your-feature`
3. **Follow service patterns** - Use existing services as templates
4. **Add error handling** - All services have try/catch with fallbacks
5. **Test thoroughly** - Verify with different user roles
6. **Commit with detail:** `git commit -m "feat: description"`
7. **Push & create PR:** `git push origin feature/your-feature`

---

## 📄 License

Proprietary - BullsandbearsFX Trading Platform

---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Enhanced dashboard charts
- [ ] SMS/Email notifications
- [ ] Automated ROI distribution scheduler
- [ ] Advanced KYC verification
- [ ] Multi-currency support
- [ ] Leverage trading
- [ ] Mobile app push notifications

---

## 📞 Support

For issues or questions:
1. Check [Troubleshooting](#-troubleshooting) section
2. Review [`.github/copilot-instructions.md`](.github/copilot-instructions.md)
3. Check backend API documentation
4. Contact development team

---

**Built with ❤️ using React 19, TypeScript, and Vite**
