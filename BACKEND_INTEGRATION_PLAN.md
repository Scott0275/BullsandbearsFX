# Frontend Backend Integration Plan

## Overview
Complete integration plan for connecting the React frontend to the Next.js backend API. Based on comprehensive backend specification with 25+ endpoints across 5 implementation phases.

## Test Accounts (For Development)
```
SUPER_ADMIN:    oscarscott2411@gmail.com / Oscar101@
TENANT_ADMIN:   adminbuchi@gmail.com / Admin0275@
INVESTOR:       investor@example.com / Investor@123
```

## API Configuration
- **Base URL:** https://investment-platform-core.vercel.app
- **Auth:** Bearer token in Authorization header
- **Required Headers:** Authorization, X-User-ID, X-User-Tenant-ID, X-User-Role, X-Tenant-Slug
- **Response Format:** Standardized with error, details, success fields

---

## Phase 1: Login/Auth + Investor Dashboard (PRIORITY: IMMEDIATE)

### Endpoints to Implement

#### ✅ POST /api/auth/login
- **Status:** Already implemented in authService.ts
- **Response:** `{ token, user: { id, name, email, role, ... } }`
- **Action:** Store token + user in localStorage, redirect to role-based dashboard

#### ✅ POST /api/auth/signup  
- **Status:** Already implemented in authService.ts
- **Response:** `{ token, user: { ... } }`
- **Action:** Same as login flow

#### ✅ GET /api/auth/me
- **Status:** Already implemented (refreshUserData)
- **Response:** `{ user: { id, name, email, role, walletId, ... } }`
- **Action:** Call on app boot to sync user data with database

#### ❌ GET /api/dashboard/investor (NEW)
- **Status:** NOT IMPLEMENTED
- **Response:**
  ```json
  {
    "wallet": { "id", "balance", "totalInvested", "totalEarned" },
    "investments": {
      "active": 5,
      "completed": 2,
      "totalValue": 50000
    },
    "transactions": [
      { "id", "type", "amount", "status", "cryptoTxHash", "createdAt" }
    ],
    "kycStatus": "APPROVED|PENDING|REJECTED",
    "unreadNotifications": 3,
    "paymentAddresses": [
      { "id", "crypto", "address" }
    ]
  }
  ```
- **Action:** Create new endpoint call in investmentService or new dashboardService
- **UI Updates Needed:**
  - Wallet balance card with total invested/earned
  - Active investments counter
  - Recent transactions table (last 5)
  - KYC status badge (different styling for each status)
  - Unread notifications bell with count
  - Payment address selector for deposits

### Files to Modify
- [ ] Create `services/dashboardService.ts` → Call GET /api/dashboard/investor
- [ ] Update `App.tsx` → InvestorDashboard component to use real data
- [ ] Update `services/authService.ts` → Add getRedirectPath() enhancements

### Expected Output
InvestorDashboard with:
- Real wallet balance from backend
- Active/completed investment counts
- Recent transaction history (sortable)
- KYC status indicator with link to KYC flow
- Unread notification bell

---

## Phase 2: KYC Verification + Admin Dashboard

### New Endpoints

#### ❌ GET /api/kyc/status (NEW)
- **Response:** `{ status: "APPROVED|PENDING|REJECTED", submittedAt?, rejectionReason? }`
- **Files:** Create `services/kycService.ts`

#### ❌ POST /api/kyc/status (NEW)
- **Request:** 
  ```json
  {
    "firstName", "lastName", "dateOfBirth", "nationality",
    "idType": "PASSPORT|DRIVER_LICENSE|NATIONAL_ID",
    "idNumber", "idExpiry", "idDocumentBase64"
  }
  ```
- **Response:** `{ status: "PENDING", submittedAt }`
- **Files:** Update `services/kycService.ts`

#### ❌ GET /api/admin/kyc-requests (ADMIN ONLY) (NEW)
- **Response:** `{ items: [{ id, userId, status, firstName, lastName, idType, submittedAt }], total }`
- **Files:** Update `services/adminService.ts`

#### ❌ POST /api/admin/kyc-requests/:id/approve (ADMIN ONLY) (NEW)
- **Request:** `{ approvedAt }`
- **Response:** `{ id, userId, status: "APPROVED" }`
- **Files:** Update `services/adminService.ts`

#### ❌ POST /api/admin/kyc-requests/:id/reject (ADMIN ONLY) (NEW)
- **Request:** `{ rejectionReason }`
- **Response:** `{ id, userId, status: "REJECTED", rejectionReason }`
- **Files:** Update `services/adminService.ts`

#### ❌ GET /api/admin/dashboard (ADMIN ONLY) (NEW)
- **Response:**
  ```json
  {
    "overview": {
      "totalUsers": 150,
      "totalInvested": 500000,
      "totalEarned": 75000,
      "activeInvestments": 45
    },
    "pendingTransactions": { "deposits": 3, "withdrawals": 2 },
    "pendingKyc": 5,
    "recentInvestments": [],
    "investmentStats": {
      "byPlan": { "Starter": 10, "Silver": 20, ... },
      "totalValue": 500000
    }
  }
  ```
- **Files:** Update `services/adminService.ts`

### UI Components Needed
- [ ] KYC verification form (investor-facing)
- [ ] KYC status badge with different states
- [ ] Admin dashboard overview cards
- [ ] Pending transactions queue with approval buttons
- [ ] Pending KYC requests table with document viewer
- [ ] Investment breakdown charts

### Files to Modify
- [ ] Create `services/kycService.ts`
- [ ] Update `services/adminService.ts` with new endpoints
- [ ] Update `App.tsx` → AdminDashboard component
- [ ] Update `App.tsx` → Add KYC status link in InvestorDashboard

---

## Phase 3: Wallet & Transactions

### Endpoints (Some Already Implemented)

#### ✅ GET /api/wallet
- **Status:** Already implemented in walletService.ts
- **Action:** Ensure correct response handling

#### ✅ POST /api/wallet/deposit
- **Status:** Already implemented
- **Action:** Show deposit form with crypto selection

#### ✅ POST /api/wallet/withdraw
- **Status:** Already implemented
- **Action:** Show withdrawal form with address input

#### ✅ GET /api/transactions (Paginated)
- **Status:** Already implemented in transactionService.ts
- **Action:** Add filtering and sorting to UI

#### ✅ POST /api/transactions/approve
- **Status:** Already implemented
- **Action:** Button in admin dashboard

#### ✅ POST /api/transactions/reject
- **Status:** Already implemented
- **Action:** Button in admin dashboard

### UI Enhancements
- [ ] Deposit form with crypto address display
- [ ] Withdrawal form with recipient address input
- [ ] Transaction history with filtering (by type, status, date)
- [ ] Transaction detail modal
- [ ] Admin approval workflow UI

### Files to Modify
- [ ] Update `App.tsx` → Add deposit/withdrawal forms
- [ ] Update `services/walletService.ts` → Ensure all response types match backend

---

## Phase 4: Admin Management Workflows

### New Endpoints (All ADMIN ONLY)

#### ❌ GET /api/admin/payment-addresses (NEW)
- **Response:** `{ items: [{ id, crypto, address, createdAt }], total }`
- **Files:** Update `services/adminService.ts`

#### ❌ POST /api/admin/payment-addresses (NEW)
- **Request:** `{ crypto: "BTC|ETH|USDC|...", address }`
- **Response:** `{ id, crypto, address }`
- **Files:** Update `services/adminService.ts`

#### ❌ PATCH /api/admin/payment-addresses/:id (NEW)
- **Request:** `{ address }`
- **Response:** `{ id, crypto, address }`
- **Files:** Update `services/adminService.ts`

#### ❌ DELETE /api/admin/payment-addresses/:id (NEW)
- **Response:** `{ success: true }`
- **Files:** Update `services/adminService.ts`

#### ❌ GET /api/admin/users (NEW)
- **Response:** `{ items: [{ id, name, email, role, status, createdAt, totalInvested }], total, page }`
- **Files:** Update `services/adminService.ts`

#### ❌ POST /api/admin/users/:id/suspend (NEW)
- **Request:** `{ reason }`
- **Response:** `{ id, status: "SUSPENDED" }`
- **Files:** Update `services/adminService.ts`

#### ❌ POST /api/admin/users/:id/unsuspend (NEW)
- **Response:** `{ id, status: "ACTIVE" }`
- **Files:** Update `services/adminService.ts`

#### ❌ GET /api/admin/investment-plans (NEW)
- **Response:** `{ items: [{ id, name, minAmount, maxAmount, roi, duration, status }], total }`
- **Files:** Update `services/adminService.ts`

#### ❌ POST /api/admin/investment-plans (NEW)
- **Request:** `{ name, minAmount, maxAmount, roi, duration, description, features[] }`
- **Response:** `{ id, name, minAmount, ... }`
- **Files:** Update `services/adminService.ts`

#### ❌ PATCH /api/admin/investment-plans/:id (NEW)
- **Request:** Partial plan update
- **Response:** Updated plan object
- **Files:** Update `services/adminService.ts`

#### ❌ POST /api/admin/roi-distribution (NEW)
- **Status:** Already partially implemented
- **Response:** `{ distributed: true, count: 45, totalDistributed: 15000 }`
- **Action:** Ensure endpoint call is correct

### UI Components Needed
- [ ] Payment address management interface (CRUD)
- [ ] User management table with suspend/unsuspend buttons
- [ ] Investment plan management interface
- [ ] ROI distribution button with confirmation modal

### Files to Modify
- [ ] Update `services/adminService.ts` with all new endpoints
- [ ] Update `App.tsx` → AdminDashboard with management interfaces
- [ ] Update `App.tsx` → SuperAdminDashboard with ROI controls

---

## Phase 5: Advanced Features

### New Endpoints

#### ❌ GET /api/notifications (NEW)
- **Response:** `{ items: [{ id, userId, type, title, message, read, createdAt }], total, unreadCount }`
- **Files:** Create `services/notificationService.ts`

#### ❌ POST /api/notifications/:id/read (NEW)
- **Response:** `{ id, read: true }`
- **Files:** Create `services/notificationService.ts`

#### ❌ POST /api/notifications/read-all (NEW)
- **Response:** `{ markedRead: 10 }`
- **Files:** Create `services/notificationService.ts`

#### ❌ GET /api/user/profile (NEW)
- **Response:** `{ id, name, email, role, phone, address, city, country, referralCode, totalReferrals, referralEarnings }`
- **Files:** Create `services/userService.ts`

#### ❌ PATCH /api/user/profile (NEW)
- **Request:** `{ name?, email?, phone?, address?, city?, country? }`
- **Response:** Updated profile object
- **Files:** Create `services/userService.ts`

#### ❌ POST /api/user/change-password (NEW)
- **Request:** `{ currentPassword, newPassword }`
- **Response:** `{ success: true }`
- **Files:** Create `services/userService.ts`

#### ❌ GET /api/investments/browse (NEW)
- **Response:** `{ items: [{ investmentId, userId, userName, planName, amount, roi, startDate, endDate, status }], total, page }`
- **Purpose:** Browse active investments from other users (copy trading)
- **Files:** Update `services/investmentService.ts`

#### ❌ POST /api/investments/copy/:investmentId (NEW)
- **Request:** `{ amount }`
- **Response:** `{ id, planId, amount, status: "ACTIVE" }`
- **Purpose:** Create investment mirroring another user's plan
- **Files:** Update `services/investmentService.ts`

#### ❌ GET /api/investments/active (NEW)
- **Response:** `{ items: [{ ...investment, roi, timeRemaining, projectedReturn }], total }`
- **Files:** Update `services/investmentService.ts`

### UI Components Needed
- [ ] Notification center with bell icon and dropdown
- [ ] Mark as read functionality
- [ ] User profile page with edit capability
- [ ] Change password form
- [ ] Referral link copy button
- [ ] Browse active investments page (copy trading)
- [ ] Advanced transaction filtering with date range, type, status

### Files to Create/Modify
- [ ] Create `services/notificationService.ts`
- [ ] Create `services/userService.ts`
- [ ] Update `services/investmentService.ts` with browse/copy/active endpoints
- [ ] Update `App.tsx` with notification center, profile page

---

## Implementation Progress Tracking

### Summary by Phase

| Phase | Status | Endpoints | Files | Blocker? |
|-------|--------|-----------|-------|----------|
| 1: Auth + Investor Dashboard | ⏳ IN PROGRESS | 4/4 login, 1/1 dashboard | dashboardService, App.tsx | None |
| 2: KYC + Admin Dashboard | ⏹️ PENDING | 5/5 new KYC/admin endpoints | kycService, adminService, App.tsx | Phase 1 |
| 3: Wallet + Transactions | ⏹️ PENDING | 6/6 already implemented | walletService, transactionService | Phase 1 |
| 4: Admin Management | ⏹️ PENDING | 11/11 new endpoints | adminService, App.tsx | Phase 2 |
| 5: Advanced Features | ⏹️ PENDING | 8/8 new endpoints | notificationService, userService | Phase 3 |

### Total Endpoints by Service

- **authService:** 3 endpoints (login, signup, me) ✅
- **dashboardService:** 1 endpoint (investor dashboard) ❌
- **kycService:** 3 endpoints (status, submit, admin) ❌
- **walletService:** 3 endpoints (balance, deposit, withdraw) ✅
- **transactionService:** 3 endpoints (list, approve, reject) ✅
- **investmentService:** 4 endpoints (list, browse, create, copy) 🟨 (partial)
- **adminService:** 11 endpoints (stats, KYC, users, plans, addresses, ROI) 🟨 (partial)
- **notificationService:** 3 endpoints (list, mark read, read all) ❌
- **userService:** 3 endpoints (profile, change password, referral) ❌

**Total: 34 endpoints | 9 implemented ✅ | 25 pending ❌**

---

## Critical Implementation Notes

### Service Architecture Pattern
All services follow this pattern:
```typescript
import { API_URL, getHeaders } from './apiService';

export interface ResponseType { /* fields */ }

export const myService = {
  async methodName(params: any): Promise<ResponseType> {
    try {
      const response = await fetch(`${API_URL}/api/endpoint`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Operation failed');
      }

      return response.json();
    } catch (error: any) {
      console.error('Operation failed:', error.message);
      throw error;
    }
  },
};
```

### Component Integration Pattern
```tsx
useEffect(() => {
  const loadData = async () => {
    try {
      const data = await service.methodName();
      setState(data);
    } catch (error) {
      setError('User-friendly error message');
      console.error(error);
    }
  };
  loadData();
}, []);
```

### Headers Automatically Included
Via `getHeaders()` from apiService.ts:
- `Authorization: Bearer {token}`
- `X-User-ID: {userId}`
- `X-User-Tenant-ID: {tenantId}`
- `X-User-Role: {role}`
- `X-Tenant-Slug: bullsandbearsfx`

---

## Next Steps (Immediate)

1. **Create dashboardService.ts** → Call GET /api/dashboard/investor
2. **Update InvestorDashboard** → Use real dashboard data instead of hardcoded values
3. **Test with provided test accounts** → Verify login and dashboard rendering
4. **Create kycService.ts** → Implement KYC endpoints for Phase 2
5. **Update adminService.ts** → Add admin-specific endpoints

---

## Testing Checklist

### Phase 1 Verification
- [ ] Login with SUPER_ADMIN account → Redirect to /super-admin
- [ ] Login with TENANT_ADMIN account → Redirect to /admin
- [ ] Login with INVESTOR account → Redirect to /dashboard
- [ ] InvestorDashboard displays real wallet balance
- [ ] InvestorDashboard displays active investments count
- [ ] InvestorDashboard displays recent transactions
- [ ] KYC status badge shows correct status
- [ ] Unread notifications count is displayed

### Phase 2 Verification
- [ ] Admin can view KYC requests queue
- [ ] Admin can approve/reject KYC requests
- [ ] AdminDashboard displays real statistics
- [ ] Pending transactions queue is functional

### Phase 3 Verification
- [ ] Deposit form shows crypto addresses
- [ ] Withdrawal form accepts recipient address
- [ ] Transaction history is filterable

---

## Environment Setup

Ensure these are configured:
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://investment-platform-core.vercel.app
GEMINI_API_KEY=your_key_here
```

Development:
```bash
npm run dev  # Runs on localhost:3000
```

---

## Files Modified Summary

**New Files to Create:**
1. `services/dashboardService.ts`
2. `services/kycService.ts`
3. `services/notificationService.ts`
4. `services/userService.ts`

**Files to Extend:**
1. `services/adminService.ts` (add 11 new endpoints)
2. `services/investmentService.ts` (add 3 new endpoints)
3. `App.tsx` (update all dashboard components)

**Files Already Complete:**
1. `services/authService.ts` ✅
2. `services/walletService.ts` ✅
3. `services/transactionService.ts` ✅

---

Generated: Backend Integration Plan for BullsandbearsFX
Phase 1 Status: In Progress - Awaiting dashboardService implementation
