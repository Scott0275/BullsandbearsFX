# Quick Reference: Service Layer Integration Guide

## TL;DR - What Changed

✅ Created 4 new services (dashboardService, kycService, notificationService, userService)  
✅ Extended 2 existing services (investmentService, adminService)  
✅ **34/34 endpoints** now have corresponding service methods  
✅ All services ready for component integration  

---

## Service Import Quick Reference

```typescript
// Dashboard data
import { dashboardService } from './services/dashboardService';
// Usage: await dashboardService.getInvestorDashboard()

// KYC workflow
import { kycService } from './services/kycService';
// Usage: await kycService.submitKYC(data, file)

// Notifications
import { notificationService } from './services/notificationService';
// Usage: await notificationService.getNotifications()

// User profile
import { userService } from './services/userService';
// Usage: await userService.getProfile()

// Investments (extended)
import { investmentService } from './services/investmentService';
// Usage: await investmentService.browseInvestments()

// Admin operations (extended)
import { adminService } from './services/adminService';
// Usage: await adminService.listUsers()
```

---

## Phase 1: Investor Dashboard

### What Endpoint to Call

```typescript
const dashboardData = await dashboardService.getInvestorDashboard();
```

### Response Structure

```typescript
{
  wallet: {
    id: string,
    balance: number,
    totalInvested: number,
    totalEarned: number
  },
  investments: {
    active: number,
    completed: number,
    totalValue: number
  },
  transactions: Transaction[],  // Last 5-10
  kycStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NOT_SUBMITTED',
  unreadNotifications: number,
  paymentAddresses: PaymentAddress[]
}
```

### Where to Integrate

**File:** `App.tsx`, lines 282-394 (InvestorDashboard component)

**Replace these hardcoded values:**
- `const balance = 45678.90` → `const balance = dashboardData.wallet.balance`
- `const totalInvested = 50000` → `const totalInvested = dashboardData.wallet.totalInvested`
- `const activeInvestments = 3` → `const activeInvestments = dashboardData.investments.active`
- etc.

**Example Implementation:**
```tsx
const [dashboardData, setDashboardData] = useState<InvestorDashboardData | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const load = async () => {
    try {
      const data = await dashboardService.getInvestorDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  load();
}, []);

if (loading) return <LoadingSpinner />;
if (!dashboardData) return null;

return (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-gray-400">Wallet Balance</p>
        <p className="text-2xl font-bold text-green-400">
          ${dashboardData.wallet.balance.toFixed(2)}
        </p>
      </div>
      {/* More cards using dashboardData */}
    </div>
  </div>
);
```

---

## Phase 2: KYC Workflow

### For Investors: Submit KYC

```typescript
// Check status first
const status = await kycService.getStatus();

// Submit if not yet submitted
if (status.status === 'NOT_SUBMITTED') {
  const result = await kycService.submitKYC(
    {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      nationality: 'US',
      idType: 'PASSPORT',
      idNumber: 'P12345',
      idExpiry: '2030-01-01',
    },
    idFile  // File object from <input type="file" />
  );
  // result.status = 'PENDING'
}
```

### For Admins: Approve KYC

```typescript
// List pending requests
const requests = await kycService.listKYCRequests(1, 10);

// Approve
await kycService.approveKYC(kycRequestId);

// Or reject
await kycService.rejectKYC(kycRequestId, 'Invalid document');
```

---

## Phase 3: Wallet Operations (Already Implemented)

```typescript
// Get balance
const { wallet, transactions } = await walletService.getWallet();

// Request deposit
await walletService.requestDeposit(
  amount,      // e.g., 5000
  cryptoType,  // e.g., 'ETH'
  userWallet   // e.g., '0x123...'
);

// Request withdrawal
await walletService.requestWithdrawal(
  amount,            // e.g., 1000
  recipientAddress   // e.g., '0x456...'
);
```

---

## Phase 4: Admin Management

### List Users
```typescript
const users = await adminService.listUsers(1, 10);  // page 1, 10 per page
```

### Suspend/Unsuspend User
```typescript
await adminService.suspendUser(userId, 'Suspicious activity');
await adminService.unsuspendUser(userId);
```

### Investment Plan CRUD
```typescript
// List plans
const plans = await adminService.listInvestmentPlans();

// Create plan
const newPlan = await adminService.createInvestmentPlan({
  name: 'Platinum',
  minAmount: 100000,
  maxAmount: 500000,
  roi: 25,
  duration: 90,
  description: 'High-value investment plan',
});

// Update plan
await adminService.updateInvestmentPlan(planId, {
  roi: 28,  // Only fields to update
});
```

### Payment Address Management
```typescript
// List
const addresses = await adminService.getPaymentAddresses();

// Add
await adminService.addPaymentAddress('ETH', '0x123...');

// Update
await adminService.updatePaymentAddress(addressId, { address: '0x456...' });

// Delete
await adminService.deletePaymentAddress(addressId);
```

### ROI Distribution (SuperAdmin Only)
```typescript
const result = await adminService.distributeROI();
// result.distributed.count = number of investments processed
// result.distributed.totalAmount = total ROI distributed
```

---

## Phase 5: Advanced Features

### Notifications
```typescript
// Get notifications
const notifs = await notificationService.getNotifications(1, 10);

// Mark as read
await notificationService.markAsRead(notificationId);

// Mark all as read
await notificationService.markAllAsRead();

// Get unread count
const count = await notificationService.getUnreadCount();
```

### User Profile
```typescript
// Get profile
const profile = await userService.getProfile();

// Update profile
await userService.updateProfile({
  name: 'New Name',
  phone: '+1234567890',
});

// Change password
await userService.changePassword('oldPassword', 'newPassword');

// Referral info
const stats = await userService.getReferralStats();
// stats.referralCode
// stats.totalReferrals
// stats.referralEarnings

// Copy referral code
await userService.copyReferralCode();
```

### Investment Features
```typescript
// Browse other users' investments (copy trading)
const investments = await investmentService.browseInvestments(1, 10);

// Copy an investment
await investmentService.copyInvestment(investmentId, myAmount);

// Get active investments with projections
const active = await investmentService.getActiveInvestments();
```

---

## Error Handling Pattern

All services throw errors. Handle them in components:

```typescript
try {
  const data = await dashboardService.getInvestorDashboard();
  setData(data);
} catch (error: any) {
  // Show user-friendly message
  setError('Failed to load dashboard. Please try again.');
  
  // Log raw error for debugging
  console.error(error.message);
}
```

---

## Type Definitions

Import types from services:

```typescript
import { 
  InvestorDashboardData,
  KYCStatus,
  Notification,
  UserProfile,
  Investment,
} from './services/dashboardService';
import { KYCStatus } from './services/kycService';
// etc...
```

---

## Response Format

All endpoints return consistent JSON:

**Success (2xx):**
```json
{
  "wallet": { ... },
  "investments": { ... },
  ...
}
```

**Error (4xx, 5xx):**
```json
{
  "error": "Human-readable error message",
  "details": "Technical details if available"
}
```

Services automatically handle errors and throw with message.

---

## HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET requests, approvals |
| 201 | Created | POST new resources |
| 400 | Bad Request | Insufficient balance |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Admin endpoint, non-admin user |
| 404 | Not Found | ID not found |
| 409 | Conflict | Email exists, invalid range |
| 500 | Server Error | Backend error |

---

## Test Accounts

```
INVESTOR:       investor@example.com / Investor@123
TENANT_ADMIN:   adminbuchi@gmail.com / Admin0275@
SUPER_ADMIN:    oscarscott2411@gmail.com / Oscar101@
```

**Test Flow:**
1. Login with INVESTOR
2. Check dashboard (InvestorDashboard)
3. Submit KYC
4. Login as TENANT_ADMIN
5. Check admin dashboard
6. Approve KYC
7. Verify INVESTOR sees approved status

---

## File Locations

- **Services:** `services/` directory
- **Components:** `App.tsx` (all dashboard components)
- **Types:** `types.ts` + individual service files
- **API Config:** `services/apiService.ts`
- **Auth:** `services/authService.ts`

---

## Debugging

Enable console logs to see:
- API URLs being called
- Request/response bodies
- Error messages from backend
- Raw exceptions (for tech support)

All errors are logged with `console.error()` before being thrown.

---

## Common Gotchas

1. **Auth Headers:** Automatically included by `getHeaders()` - don't add manually
2. **File Upload:** Only KYC uses File object - convert to base64 in service
3. **Pagination:** Always use `page` and `limit` parameters
4. **Role Checking:** Use user.role from localStorage (case-sensitive on backend)
5. **PENDING Status:** Transactions stay PENDING until admin approves

---

## Commit Reference

**Latest:** 84f057e - "docs: add comprehensive service layer implementation report"
**Before that:** a91fa5d - "feat: implement Phase 1-5 service layer"

Both commits are on `main` branch and pushed to `origin/main`.

---

## Next Action

Update InvestorDashboard component to call:
```typescript
const data = await dashboardService.getInvestorDashboard();
```

Replace hardcoded values with `data.wallet.balance`, `data.investments.active`, etc.

---

Generated: Quick Reference Guide for Service Layer Integration
