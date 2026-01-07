# Quick Start: Frontend-Backend Integration

## ✅ Frontend is Ready to Connect

All endpoint URLs have been verified and corrected. The frontend is fully synced with the backend API.

---

## 🚀 Start Here

### Step 1: Verify Backend
```bash
# Backend URL
https://investment-platform-core.vercel.app

# Test endpoints with curl
curl -X POST https://investment-platform-core.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"investor@example.com","password":"Investor@123"}'
```

### Step 2: Start Frontend
```bash
cd c:\Projects\BullsandbearsFX
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

### Step 3: Login & Test
Use any of these test accounts:
- **Investor:** investor@example.com / Investor@123
- **Admin:** adminbuchi@gmail.com / Admin0275@
- **Super Admin:** oscarscott2411@gmail.com / Oscar101@

---

## 📊 What Was Fixed

| Issue | Before | After | Impact |
|-------|--------|-------|--------|
| Investor Dashboard | `/api/investor/dashboard` | `/api/dashboard/investor` | ✅ Fixed |
| Admin Dashboard | `/api/admin/dashboard` | `/api/dashboard/admin` | ✅ Fixed |
| Super Admin Dashboard | `/api/super-admin/dashboard` | `/api/dashboard/super-admin` | ✅ Fixed |

---

## 🔗 Service Mapping

### Core Services
| Service | Purpose | Key Methods |
|---------|---------|------------|
| **authService** | Login/Signup | login(), signup(), refreshUserData() |
| **dashboardService** | Dashboard data | getInvestorDashboard(), getAdminDashboard(), getSuperAdminDashboard() |
| **walletService** | Wallet ops | getWallet(), requestDeposit(), requestWithdrawal() |
| **investmentService** | Investments | listInvestments(), createInvestment(), browseInvestments() |
| **transactionService** | Transactions | listTransactions(), approveTransaction(), rejectTransaction() |
| **kycService** | KYC verification | getStatus(), submitKYC(), approveKYC(), rejectKYC() |
| **adminService** | Admin operations | getStats(), listUsers(), suspendUser(), createInvestmentPlan() |
| **notificationService** | Notifications | getNotifications(), markAsRead(), markAllAsRead() |
| **userService** | User profile | getProfile(), updateProfile(), changePassword() |

---

## 🧪 Quick Test Checklist

### For Investors
- [ ] Login to /dashboard
- [ ] See wallet balance
- [ ] See active investments count
- [ ] See recent transactions
- [ ] Check KYC status

### For Admins  
- [ ] Login to /admin
- [ ] See total users
- [ ] See pending transactions
- [ ] See pending KYC requests
- [ ] Can approve/reject transactions

### For Super Admins
- [ ] Login to /super-admin
- [ ] See platform statistics
- [ ] Can manage payment addresses
- [ ] Can create investment plans
- [ ] Can distribute ROI

---

## 🔍 Debugging

### Check API Calls
1. Open DevTools (F12)
2. Go to Network tab
3. Login and watch for API calls
4. Verify response status is 200

### Check Headers
In Network tab, click any API request and check Headers:
- `Authorization: Bearer {token}` ✅
- `X-User-ID: {userId}` ✅
- `X-User-Role: {role}` ✅
- `X-Tenant-Slug: bullsandbearsfx` ✅

### Check Console
Look for debug logs:
- `Investor dashboard data: {...}`
- `Admin dashboard data: {...}`
- Error messages with full details

---

## 📄 Service Layer Pattern

Every service follows this pattern:

```typescript
import { API_URL, getHeaders } from './apiService';

export const myService = {
  async methodName(params: any) {
    try {
      const response = await fetch(`${API_URL}/api/endpoint`, {
        method: 'GET', // or POST, PATCH, DELETE
        headers: getHeaders(), // Automatically includes auth + user context
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed');
      }

      return response.json();
    } catch (error: any) {
      console.error('Operation failed:', error.message);
      throw error;
    }
  },
};
```

---

## 🎯 Endpoint Groups

### Authentication (3 endpoints)
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Dashboards (3 endpoints)
- `GET /api/dashboard/investor`
- `GET /api/dashboard/admin`
- `GET /api/dashboard/super-admin`

### Wallet (3 endpoints)
- `GET /api/wallet`
- `POST /api/wallet/deposit`
- `POST /api/wallet/withdraw`

### Transactions (3 endpoints)
- `GET /api/transactions`
- `POST /api/transactions/approve`
- `POST /api/transactions/reject`

### Investments (5 endpoints)
- `GET /api/investments`
- `POST /api/investments`
- `GET /api/investments/browse`
- `POST /api/investments/copy/:id`
- `GET /api/investments/active`

### KYC (5 endpoints)
- `GET /api/kyc/status`
- `POST /api/kyc/status`
- `GET /api/admin/kyc-requests`
- `POST /api/admin/kyc-requests/:id/approve`
- `POST /api/admin/kyc-requests/:id/reject`

### Admin (11 endpoints)
- `GET /api/admin/stats`
- `GET /api/admin/payment-addresses`
- `POST /api/admin/payment-addresses`
- `PATCH /api/admin/payment-addresses/:id`
- `DELETE /api/admin/payment-addresses/:id`
- `POST /api/admin/roi-distribution`
- `GET /api/admin/users`
- `POST /api/admin/users/:id/suspend`
- `POST /api/admin/users/:id/unsuspend`
- `GET /api/admin/investment-plans`
- `POST /api/admin/investment-plans`
- `PATCH /api/admin/investment-plans/:id`

### Notifications (3 endpoints)
- `GET /api/notifications`
- `POST /api/notifications/:id/read`
- `POST /api/notifications/read-all`

### User (3 endpoints)
- `GET /api/user/profile`
- `PATCH /api/user/profile`
- `POST /api/user/change-password`

**Total: 39 endpoints ✅**

---

## 📚 See Also

- [FRONTEND_BACKEND_SYNC_COMPLETE.md](FRONTEND_BACKEND_SYNC_COMPLETE.md) - Complete integration details
- [BACKEND_INTEGRATION_PLAN.md](BACKEND_INTEGRATION_PLAN.md) - Original integration plan
- [services/apiService.ts](services/apiService.ts) - Base API configuration
- [App.tsx](App.tsx) - Main routing and authentication

---

**Ready to test! 🚀**
