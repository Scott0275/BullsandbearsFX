# BullsandbearsFX AI Coding Instructions

## Project Overview
**BullsandbearsFX** is a premium cryptocurrency and forex trading platform built with React 19, TypeScript, and Vite. It features a multi-tier investment system, AI-powered market insights via Gemini API, and role-based authentication (Investor, Tenant Admin, Super Admin).

**Key Stack:** React 19 + React Router v6 + TypeScript 5.8 + Vite 6.2 + Lucide Icons

## Architecture Patterns

### Service-Based Architecture
Services are the primary integration point between the UI and backend APIs:

- **[authService.ts](services/authService.ts)** - Handles authentication flows (signup/login/logout) with token & user data persisted to localStorage. Maps user roles to dashboard paths via `getRedirectPath()`.
- **[aiService.ts](services/aiService.ts)** - Gemini AI integration (model: `gemini-3-flash-preview`) for market sentiment analysis. Always includes fallback responses for API failures/rate-limiting.
- **[cryptoService.ts](services/cryptoService.ts)** - Fetches market data from CoinGecko API with built-in mock fallback (`MOCK_ASSETS`) when API is unreachable.
- **[apiService.ts](services/apiService.ts)** - Centralizes API base URL and request headers; import via `getHeaders()`.

### Data Flow
1. Components → Services (via async methods)
2. Services → External APIs (CoinGecko, Gemini, backend)
3. Fallback mechanisms ensure graceful degradation (mock data, professional fallback messages)

## API Service Integration Patterns

### Backend API Configuration
[apiService.ts](services/apiService.ts) provides centralized API coordination:

```typescript
// API_URL resolves in order: env var → Vercel production → localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://investment-platform-core.vercel.app';

// getHeaders() automatically includes auth token and user context headers
const headers = getHeaders(); 
// Returns: { 
//   Authorization: 'Bearer token',
//   X-User-ID: 'user123',
//   X-User-Tenant-ID: 'tenant456',
//   X-User-Role: 'INVESTOR',
//   X-Tenant-Slug: 'bullsandbearsfx'
// }
```

**Key Points:**
- All backend requests include `X-User-ID`, `X-User-Tenant-ID`, `X-User-Role` headers (extracted from localStorage user_data)
- `X-Tenant-Slug: 'bullsandbearsfx'` included for multi-tenant support
- Auth token auto-injected from localStorage when present
- Use `getHeaders()` import in all services making backend calls

### Authentication Service Pattern
[authService.ts](services/authService.ts) handles all auth flows with database sync:

```typescript
// Login → Backend returns token + user object from database
async login(data: any) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const result = await response.json();
  localStorage.setItem('auth_token', result.token);
  localStorage.setItem('user_data', JSON.stringify(result.user));
  return result;
}

// Refresh user data from backend on app boot
async refreshUserData() {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: 'GET',
    headers: getHeaders(),
  });
  const result = await response.json();
  localStorage.setItem('user_data', JSON.stringify(result.user));
  return result.user;
}
```

**Integration Pattern:**
1. On login, store token + user object (from database)
2. On app boot, call `refreshUserData()` to sync cached data with live database
3. All user updates from backend automatically refresh localStorage
4. Services validate response status with `!response.ok` check
5. Errors throw user-friendly messages; raw errors logged to console

### Wallet Service Pattern
[walletService.ts](services/walletService.ts) manages deposits, withdrawals, and balance:

```typescript
// Get wallet balance + transaction history
const wallet = await walletService.getWallet();
// Returns: { wallet: { id, userId, balance }, transactions: [] }

// Request deposit (crypto payment)
const depositTxn = await walletService.requestDeposit(5000, 'ETH', userWallet);
// User sees transaction ID + crypto address to send funds to
// Admin approves when payment verified on blockchain
// Wallet credited + referral rewards auto-processed

// Request withdrawal
const withdrawalTxn = await walletService.requestWithdrawal(1000, recipientAddress);
// Wallet debited when admin approves
```

**Payment Flow:**
1. User requests deposit with amount + crypto type
2. Backend creates PENDING transaction
3. User sends crypto to provided address (off-chain)
4. Admin reviews + approves in dashboard
5. On approval: wallet credited + referral rewards processed
6. ROI credits also go through this system

### Transaction Service Pattern
[transactionService.ts](services/transactionService.ts) lists and manages transactions:

```typescript
// List user transactions (paginated)
const result = await transactionService.listTransactions(page, limit);
// Types: DEPOSIT, WITHDRAWAL, INVESTMENT_DEBIT, ROI_CREDIT, REFERRAL_CREDIT
// Statuses: PENDING, APPROVED, REJECTED

// Admin approve/reject
await transactionService.approveTransaction(transactionId);
await transactionService.rejectTransaction(transactionId);
```

### Investment Service Pattern
[investmentService.ts](services/investmentService.ts) manages investment lifecycle:

```typescript
// List all investments (active + completed)
const investments = await investmentService.listInvestments();

// Create new investment
const newInvest = await investmentService.createInvestment(planId, amount);
// Validates: sufficient balance, plan exists, amount in range
// Creates INVESTMENT_DEBIT transaction (funds moved to investment)
// ROI will be credited when investment completes
```

### Admin Service Pattern
[adminService.ts](services/adminService.ts) for admin operations (TENANT_ADMIN, SUPER_ADMIN):

```typescript
// Get admin dashboard stats (TENANT_ADMIN+)
const stats = await adminService.getStats();
// Returns: overview, investments breakdown, pending transactions

// Manage crypto payment addresses (ADMIN)
const addresses = await adminService.getPaymentAddresses();
await adminService.addPaymentAddress('ETH', '0x1234...');
await adminService.updatePaymentAddress(addressId, { address: newAddr });

// Distribute ROI to completed investments (SUPER_ADMIN only)
await adminService.distributeROI();
// Finds all COMPLETED investments, calculates ROI, credits wallets
// Prevents double-distribution automatically
```

### Using Services in Components
Standard component pattern for API integration:

```tsx
// ✅ CORRECT: Use service directly, handle errors in component
useEffect(() => {
  const loadData = async () => {
    try {
      const wallet = await walletService.getWallet();
      setBalance(wallet.wallet.balance);
      setTransactions(wallet.transactions);
    } catch (error) {
      setError('Failed to load wallet');
      console.error(error); // Log raw error for debugging
    }
  };
  loadData();
}, []);

// ✅ INVESTOR accessing own wallet
<ProtectedRoute user={user} allowedRoles={['INVESTOR']}>
  <InvestorDashboard /> {/* Can safely call walletService */}
</ProtectedRoute>

// ✅ ADMIN accessing stats
<ProtectedRoute user={user} allowedRoles={['TENANT_ADMIN', 'SUPER_ADMIN']}>
  <AdminDashboard /> {/* Can safely call adminService.getStats() */}
</ProtectedRoute>
```

### Error Handling
All services follow consistent error patterns:

```typescript
try {
  const response = await fetch(...);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Fallback error');
  }
  return response.json();
} catch (error: any) {
  console.error('Operation failed:', error.message); // Log for debugging
  throw error; // Components handle user-facing messages
}
```

**HTTP Status Codes:**
- `200` - Success (GET requests, approve/reject)
- `201` - Created (deposits, withdrawals, investments)
- `400` - Validation error (insufficient balance, invalid amount)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient role for admin endpoints)
- `404` - Not found (plan, address, investment)
- `409` - Conflict (email exists, amount out of range)
- `500` - Server error

### Type Safety
- Core types defined in [types.ts](types.ts): `CryptoAsset`, `Plan`, `Service`, `FAQItem`
- All component props should be explicitly typed; avoid `any` except for auth payloads during integration

## UI & Routing Conventions

### Protected Routes Pattern
[App.tsx](App.tsx#L52) implements `ProtectedRoute` HOC for role-based access control:
```tsx
<ProtectedRoute user={user} allowedRoles={['INVESTOR', 'TENANT_ADMIN']}>
  <DashboardPage />
</ProtectedRoute>
```

### Authentication Modal Pattern
`AuthModal` component handles both login and signup modes. On success, updates parent component's user state and calls `onLoginSuccess()` callback—do not fetch user data directly within the modal.

### Constants & Configuration
- [constants.tsx](constants.tsx) centralizes: `INVESTMENT_PLANS` (Starter/Silver/Gold/Platinum tiers with ROI), `SERVICES`, `WHY_CHOOSE_US`, `FAQS`, `TESTIMONIALS`
- Investment plans use color-coded Tailwind classes (e.g., `bg-emerald-500/20 text-emerald-400` for Starter tier)
- All plan data is immutable and should not be modified in components

## Environment & Build

### Required Environment Variables
- `GEMINI_API_KEY` - Set in `.env.local` for Gemini API access
- Both `process.env.API_KEY` and `process.env.GEMINI_API_KEY` are defined in [vite.config.ts](vite.config.ts)

### Development & Build
```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run preview      # Preview production build
```

### Key Build Details
- Vite dev server runs on `0.0.0.0:3000` (accessible from any network interface)
- React Fast Refresh enabled via `@vitejs/plugin-react`
- Path alias `@` maps to project root (currently unused but available)

## Common Development Tasks

### Adding a New Investment Plan
1. Add new plan object to `INVESTMENT_PLANS` array in [constants.tsx](constants.tsx) with: `name`, `range`, `roi`, `features[]`, `color` (Tailwind), `accent` (bg/text class)
2. Update corresponding investment plan UI component to render the new tier
3. No need to modify types—`Plan` interface already supports the structure

### Integrating New Market Data
1. Add crypto asset to mock data in [cryptoService.ts](services/cryptoService.ts) following `CryptoAsset` interface
2. If adding real API, preserve fallback to `MOCK_ASSETS` on network failure
3. Service methods must be async and handle errors gracefully

### Adding AI Insights to New Features
1. Call `getMarketInsights()` from [aiService.ts](services/aiService.ts) with asset symbols (e.g., "BTC, ETH, SOL")
2. Always handle API failures—service returns professional fallback message
3. Do not expose raw API errors to users; log to console for debugging

### Role-Based UI Changes
1. Get current user via `authService.getCurrentUser()` 
2. Check `user.role` against the role mapping in [authService.ts](services/authService.ts): `SUPER_ADMIN`, `TENANT_ADMIN`, `INVESTOR`
3. Use `ProtectedRoute` for entire pages; use conditional rendering for feature-level access

## Critical Patterns to Follow

- **Error Handling:** Always catch async errors in services and return user-friendly fallbacks; log raw errors to console
- **localStorage Usage:** Only persist `auth_token` and `user_data`; validate/sanitize on retrieval to prevent corruption
- **Component Lifecycle:** Use `useEffect` for API calls; cleanup abort signals in cleanup functions (see cryptoService timeout example)
- **Lucide Icons:** All icons imported from `lucide-react`; avoid hardcoding SVG paths
- **Token Management:** Services handle token storage/retrieval; do not expose tokens in component state when possible

## Files to Review First
1. [App.tsx](App.tsx) - Main routing logic, authentication state, protected routes
2. [types.ts](types.ts) - Interface definitions for type safety
3. [services/apiService.ts](services/apiService.ts) - API base URL and request headers (foundation for all services)
4. [services/authService.ts](services/authService.ts) - Auth flow and user role mapping + refreshUserData()
5. [services/walletService.ts](services/walletService.ts) - Wallet balance, deposits, withdrawals
6. [services/investmentService.ts](services/investmentService.ts) - Investment lifecycle management
7. [constants.tsx](constants.tsx) - Data structures (plans, services, FAQs, testimonials)

## Service Architecture Overview

All services follow the same pattern:
1. **Export interfaces** for TypeScript type safety (request/response bodies)
2. **Centralized error handling** with `getHeaders()` for auth
3. **Graceful fallbacks** on API failures (logged to console, user-friendly errors thrown)
4. **Role-based access control** enforced by ProtectedRoute HOC in components

### Service Files (Complete List)
- **authService.ts** - Login, signup, token management, user refresh
- **walletService.ts** - Balance, deposits, withdrawals
- **transactionService.ts** - Transaction history, admin approve/reject
- **investmentService.ts** - Investment list, create investments
- **adminService.ts** - Admin stats, payment addresses, ROI distribution
- **aiService.ts** - Gemini AI market insights (external API with fallback)
- **cryptoService.ts** - CoinGecko market data (external API with mock fallback)
