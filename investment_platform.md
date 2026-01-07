# Investment Platform Frontend Integration Guide

## Overview
This document provides complete integration specifications for the new investor and admin dashboards, including all API endpoints, response formats, authentication requirements, and UI/UX flow.

---

## Authentication & Headers

### Login Response Format
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "INVESTOR",  // or "TENANT_ADMIN" or "SUPER_ADMIN"
    "tenantId": "tenant456",
    "status": "ACTIVE"
  }
}
```
Required Headers for All Protected Endpoints
### Request Headers
When making requests to the API, include the following headers:

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'X-User-ID': userId,
  'X-User-Tenant-ID': tenantId,
  'X-User-Role': userRole
}
```

INVESTOR DASHBOARD
1. Dashboard Summary (Load on Dashboard Mount)
Endpoint: GET /api/dashboard/investor

Response:
```json
{
  "wallet": {
    "id": "wallet123",
    "balance": 15000,
    "lastUpdated": "2024-01-06T10:30:00Z"
  },
  "investments": {
    "activeCount": 3,
    "totalInvested": 25000,
    "expectedReturns": 31250,
    "activeDetails": [
      {
        "id": "inv1",
        "planName": "Gold Plan",
        "amount": 5000,
        "roiPercentage": 25,
        "expectedReturn": 6250,
        "startDate": "2024-01-01T00:00:00Z",
        "endDate": "2024-04-01T00:00:00Z",
        "daysRemaining": 85,
        "status": "ACTIVE"
      }
    ]
  },
  "kyc": {
    "status": "NOT_SUBMITTED",  // or "PENDING", "APPROVED", "REJECTED"
    "submittedAt": null,
    "approvedAt": null,
    "rejectedAt": null,
    "rejectionReason": null
  },
  "transactions": {
    "recentCount": 3,
    "recent": [
      {
        "id": "txn1",
        "type": "DEPOSIT",
        "amount": 5000,
        "status": "APPROVED",
        "date": "2024-01-05T14:20:00Z"
      },
      {
        "id": "txn2",
        "type": "INVESTMENT_DEBIT",
        "amount": 2500,
        "status": "APPROVED",
        "date": "2024-01-04T10:15:00Z"
      },
      {
        "id": "txn3",
        "type": "REFERRAL_CREDIT",
        "amount": 500,
        "status": "APPROVED",
        "date": "2024-01-03T09:00:00Z"
      }
    ]
  },
  "referral": {
    "code": "REF-1704816000-xyz",
    "shareLink": "https://bullsandbears-fx.vercel.app/signup?ref=REF-1704816000-xyz",
    "totalReferrals": 2,
    "rewardTier": "Premium",  // Starter, Premium, Elite
    "rewardPercentage": 13,
    "totalRewardsEarned": 1300
  }
}
```
UI Components to Display:

Wallet balance card (large, prominent)
Active investments count badge
Expected returns total
KYC status indicator (NOT_SUBMITTED → red, PENDING → yellow, APPROVED → green, REJECTED → red with reason)
Last 3 transactions list
Referral code display with copy button
Share referral link button

2. Wallet Management
Get Wallet Details with Transaction History
Endpoint: GET /api/wallet

Response:
```json
{
  "wallet": {
    "id": "wallet123",
    "userId": "user123",
    "balance": 15000,
    "createdAt": "2023-12-15T00:00:00Z",
    "transactions": [
      {
        "id": "txn1",
        "type": "DEPOSIT",
        "amount": 5000,
        "status": "APPROVED",
        "date": "2024-01-05T14:20:00Z",
        "reference": "Deposit request approved"
      }
    ]
  }
}
```

Request Deposit
Endpoint: POST /api/wallet/deposit

Request Body:
```json
{
  "amount": 5000,
  "cryptoType": "ETH"  // Optional, for display
}
```
Response:
```json
{
  "message": "Deposit request created",
  "transaction": {
    "id": "txn123",
    "type": "DEPOSIT",
    "amount": 5000,
    "status": "PENDING",
    "date": "2024-01-06T10:30:00Z",
    "createdAt": "2024-01-06T10:30:00Z"
  },
  "paymentInfo": {
    "instructions": "Send exactly 5000 to the address below",
    "addresses": [
      {
        "cryptoType": "ETH",
        "address": "0x1234567890abcdef1234567890abcdef12345678",
        "isActive": true
      },
      {
        "cryptoType": "BTC",
        "address": "1A1z7agoat2YLt7xrLga7XMhvj1Tz4Wbby",
        "isActive": true
      }
    ]
  }
}
```

UI Flow:

Show deposit form with amount input
Display available crypto addresses
Show QR code for each address
"Copy Address" button for each crypto type
Transaction status: PENDING → waiting for payment → Admin approval
Request Withdrawal
Endpoint: POST /api/wallet/withdraw

Request Body:
```json
{
  "amount": 2000,
  "withdrawalAddress": "0xUserCryptoAddress",
  "cryptoType": "ETH"
}
```
Response:
```json
{
  "message": "Withdrawal request created",
  "transaction": {
    "id": "txn456",
    "type": "WITHDRAWAL",
    "amount": 2000,
    "status": "PENDING",
    "date": "2024-01-06T11:00:00Z",
    "createdAt": "2024-01-06T11:00:00Z"
  },
  "details": {
    "kycRequired": true,
    "kycStatus": "APPROVED",  // or "NOT_SUBMITTED", "PENDING", "REJECTED"
    "message": "KYC approved. Waiting for admin approval."
  }
}
```

UI Flow:

Show withdrawal form
Check KYC status first
If KYC not approved: Show "KYC Required" message with link to KYC submission
If KYC approved: Allow withdrawal request
Show transaction in pending list
Admin approval notification
3. Investments
Browse Available Investments (Copy Trading)
Endpoint: GET /api/investments/browse?page=1&limit=10

Response:

UI Flow:

Display list of active investments from other users
Show creator info (name, wallet balance - indicates credibility)
Show plan details (name, ROI%, duration)
Investment amount & expected returns
Days remaining until maturity
"Copy Trade" button for each investment
Get User's Investments
Endpoint: GET /api/investments

Response:

Create Investment
Endpoint: POST /api/investments

Request Body:

Response:

UI Flow:

Show available investment plans
Allow amount selection within min/max range
Show expected returns calculation
Confirm investment creation
Update wallet balance immediately
Add to active investments list
Copy Investment
Endpoint: POST /api/investments/copy

Request Body:

Response:

UI Flow:

In Browse Investments view, click "Copy Trade"
Input amount (validate against plan limits)
Show expected returns preview
Confirm copy
Debit wallet immediately
Add to user's active investments
4. Transactions
Get All Transactions (Paginated)
Endpoint: GET /api/transactions?page=1&limit=10&status=APPROVED

Response:

UI Components:

Transaction history table/list
Filter by type (DEPOSIT, WITHDRAWAL, INVESTMENT_DEBIT, REFERRAL_CREDIT, ROI_CREDIT)
Filter by status (PENDING, APPROVED, REJECTED)
Sort by date
Show crypto transaction hash for verified deposits
5. Referrals
Get Referral Information & List
Endpoint: GET /api/user/referrals

Response:

UI Components:

Referral code display
"Copy to Clipboard" button
Social share buttons (WhatsApp, Facebook, Twitter, Email)
QR code generation for share link
Reward tier indicator
Referral bonus percentage display
List of referred users with status
Total referrals count
Total rewards earned
6. KYC Verification
Get KYC Status
Endpoint: GET /api/kyc/status

Response:

Submit KYC Documents
Endpoint: POST /api/kyc/submit

Request Body (FormData):

Response:

UI Flow:

Check KYC status on dashboard
If NOT_SUBMITTED: Show KYC submission form
Form fields:
Full Name
ID Type dropdown (Passport, Driver's License, National ID)
Upload ID Front (image)
Upload ID Back (image)
Upload Selfie (image)
Preview uploaded images before submission
Submit and show "Submitted" status
Admin will review and approve/reject
Show notification when approved or rejected
7. User Profile
Get User Profile
Endpoint: GET /api/user/profile

Response:

Update User Profile
Endpoint: PATCH /api/user/profile

Request Body:

Response:

Change Password
Endpoint: POST /api/user/profile/change-password

Request Body:

Response:

UI Flow:

Profile page with user details
Edit name/email fields
Separate "Change Password" section
Current password verification
New password + confirm password
Password strength indicator
Show success/error messages
8. Notifications
Get Notifications
Endpoint: GET /api/notifications?page=1&limit=20&isRead=false

Response:

Mark Notification as Read
Endpoint: PATCH /api/notifications/{notificationId}

Request Body:

Response:

UI Components:

Notification bell icon (with unread count badge)
Dropdown notification list
Color-coded by type (SUCCESS = green, ERROR = red, WARNING = yellow, INFO = blue)
Mark as read on click
Link to relevant page when clicked
Notification timestamp
Clear old notifications option
ADMIN DASHBOARD
1. Admin Dashboard Summary
Endpoint: GET /api/dashboard/admin

Response:

2. User Management
Get All Users
Endpoint: GET /api/admin/users?page=1&limit=20&status=ACTIVE&search=john

Response:

Update User Status
Endpoint: PATCH /api/admin/users

Request Body:

Response:

UI Components:

User list table with:
Name, Email, Role
Wallet balance
KYC status (badge)
Account status (ACTIVE/SUSPENDED)
Last login date
Created date
Search by name/email
Filter by status, role, KYC status
Suspend/Activate button per user
View user details link
3. KYC Verification Requests
Get Pending KYC Requests
Endpoint: GET /api/admin/kyc-requests?page=1&limit=10&status=PENDING

Response:

Approve KYC Request
Endpoint: POST /api/admin/kyc-requests/approve

Request Body:

Response:

Reject KYC Request
Endpoint: POST /api/admin/kyc-requests/reject

Request Body:

Response:

UI Components:

KYC requests table
Filter by status (PENDING, APPROVED, REJECTED)
Image preview modal for:
ID Front
ID Back
Selfie
User info section (name, email)
Approve/Reject buttons
Rejection reason textarea
Submission date and days pending
Bulk approval for multiple requests
4. Withdrawal Requests
Get Pending Withdrawals
Endpoint: GET /api/admin/withdrawals?page=1&limit=10&status=PENDING

Response:

Approve Withdrawal
Endpoint: POST /api/admin/withdrawals/approve

Request Body:

Response:

Reject Withdrawal
Endpoint: POST /api/admin/withdrawals/reject

Request Body:

Response:

UI Components:

Withdrawal requests table
Filter by status (PENDING, APPROVED, REJECTED)
User info (name, email, wallet balance, KYC status)
Withdrawal details (amount, crypto type, address)
KYC status indicator (red if not approved)
Approve/Reject buttons
Rejection reason textarea
Optional: Crypto tx hash input
Request age (days pending)
Bulk approval for multiple requests
5. Deposit Management
Get Pending Deposits
Endpoint: GET /api/admin/deposits?page=1&limit=10&status=PENDING

Response:

Approve Deposit
Endpoint: POST /api/admin/deposits/approve

Request Body:

Response:

Reject Deposit
Endpoint: POST /api/admin/deposits/reject

Request Body:

UI Components:

Deposit requests table
Filter by status (PENDING, APPROVED, REJECTED)
User info and amount
Crypto type and tx hash field
Referral info (if applicable)
Approve/Reject buttons
Rejection reason textarea
Request age (days pending)
6. Investment Plans
Get All Investment Plans
Endpoint: GET /api/admin/investment-plans

Response:

Create Investment Plan (SUPER_ADMIN only)
Endpoint: POST /api/admin/investment-plans

Request Body:

Response:

UI Components:

Investment plans table with:
Plan name
Min/Max amounts
ROI percentage
Duration days
Active status toggle
Number of investments
Total invested
Average investment amount
Create new plan form (SUPER_ADMIN only)
Edit plan details
Deactivate/Activate plans
7. Wallet Management
Get All Wallets
Endpoint: GET /api/admin/wallets?page=1&limit=20&sortBy=balance

Response:

Adjust Wallet Balance (SUPER_ADMIN only)
Endpoint: PATCH /api/admin/wallets

Request Body:

Response:

UI Components:

Wallets table with:
User name & email
Wallet balance (sorted)
Transaction count
Last transaction date
Created date
Search by user name/email
Sort by balance, date, transaction count
Manual adjustment form (SUPER_ADMIN only)
Amount input
ADD/SUBTRACT toggle
Reason/note textarea
Wallet details modal with transaction history
8. Notifications & Alerts
Get Admin Notifications
Endpoint: GET /api/notifications?page=1&limit=20&isRead=false

Same as investor notifications but includes admin-specific alerts:

New KYC submissions
New withdrawal requests
Large investments
System alerts
COMMON UI/UX PATTERNS
Error Handling
Loading States
Show spinner/skeleton during API calls
Disable buttons during submission
Prevent duplicate submissions
Success Notifications
Toast message: "Action successful"
Refresh relevant data
Update UI optimistically where appropriate
Authentication
Store token in localStorage/sessionStorage
Include token in Authorization header
Redirect to login on 401 response
Refresh token if expired
Multi-Tab Synchronization
Consider using localStorage events or WebSockets
Sync auth token across tabs
Sync notifications across tabs
IMPLEMENTATION CHECKLIST
Investor Dashboard
 Create /dashboard route
 Implement wallet balance card
 Implement active investments card
 Implement expected returns card
 Implement KYC status indicator
 Implement recent transactions list (last 3)
 Implement referral link display with copy button
Investor Tabs
 Deposit tab with crypto address display
 Withdraw tab with KYC check
 Invest tab with plan selection
 Transaction History tab with pagination
 Referrals tab with share options
 Profile tab with edit & password change
 KYC verification tab with document upload
Admin Dashboard
 Create /admin/dashboard route
 Implement summary cards (users, wallets, pending requests)
 Implement recent requests cards
 Implement investment plans overview
Admin Tabs/Pages
 User Management page
 KYC Requests page with image preview
 Withdrawal Requests page
 Deposit Requests page
 Investment Plans page
 Wallet Management page
 Notifications page
General
 Authentication flow
 Header/footer navigation
 Responsive design
 Dark mode (optional)
 Error handling
 Loading states
 Toast notifications
 Modal dialogs
DEPLOYMENT & TESTING
Test Accounts
Investor:

Email: investor@test.com
Password: Investor123!
Admin (TENANT_ADMIN):

Email: adminbuchi@gmail.com
Password: Admin0275@
Super Admin (SUPER_ADMIN):

Email: superadminbuchi@gmail.com
Password: Super0275@
API Base URL
Development: http://localhost:3000
Production: https://investment-platform-core.vercel.app
Frontend Base URL
Development: http://localhost:5173
Production: https://bullsandbears-fx.vercel.app
SUPPORT & DOCUMENTATION
For backend API issues:

Check /api/admin/stats endpoint response format
Verify all required headers are being sent
Check browser console for CORS errors
Verify tenant ID is included in all requests
All endpoints are protected and require Bearer token authentication.

Claude Haiku 4.5 • 0.33x
Response:

UI Flow:

Show withdrawal form
Check KYC status first
If KYC not approved: Show "KYC Required" message with link to KYC submission
If KYC approved: Allow withdrawal request
Show transaction in pending list
Admin approval notification
3. Investments
Browse Available Investments (Copy Trading)
Endpoint: GET /api/investments/browse?page=1&limit=10

Response:
{
  "investments": [
    {
      "id": "inv_user_123",
      "createdBy": {
        "id": "user456",
        "name": "John Trader",
        "email": "john@example.com",
        "walletBalance": 50000
      },
      "plan": {
        "id": "plan1",
        "name": "Gold Plan",
        "minAmount": 1000,
        "maxAmount": 50000,
        "roiPercentage": 25,
        "durationDays": 90
      },
      "amount": 10000,
      "expectedReturn": 12500,
      "roiPercentage": 25,
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-04-01T00:00:00Z",
      "daysRemaining": 85,
      "status": "ACTIVE"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}

UI Flow:

Display list of active investments from other users
Show creator info (name, wallet balance - indicates credibility)
Show plan details (name, ROI%, duration)
Investment amount & expected returns
Days remaining until maturity
"Copy Trade" button for each investment
Get User's Investments
Endpoint: GET /api/investments

Response:
{
  "investments": [
    {
      "id": "inv1",
      "planName": "Gold Plan",
      "amount": 5000,
      "expectedReturn": 6250,
      "roiPercentage": 25,
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-04-01T00:00:00Z",
      "daysRemaining": 85,
      "status": "ACTIVE"
    },
    {
      "id": "inv2",
      "planName": "Premium Plan",
      "amount": 10000,
      "expectedReturn": 13000,
      "roiPercentage": 30,
      "startDate": "2023-10-01T00:00:00Z",
      "endDate": "2024-01-01T00:00:00Z",
      "daysRemaining": 0,
      "status": "COMPLETED"
    }
  ],
  "summary": {
    "activeCount": 1,
    "completedCount": 1,
    "totalInvested": 15000,
    "totalExpectedReturns": 19250
  }
}
Create Investment
Endpoint: POST /api/investments

Request Body:
{
  "planId": "plan1",
  "amount": 5000
}
Response:
{
  "message": "Investment created successfully",
  "investment": {
    "id": "inv_new_123",
    "planName": "Gold Plan",
    "amount": 5000,
    "expectedReturn": 6250,
    "roiPercentage": 25,
    "startDate": "2024-01-06T10:30:00Z",
    "endDate": "2024-04-06T10:30:00Z",
    "daysRemaining": 90,
    "status": "ACTIVE"
  },
  "walletAfter": {
    "balance": 10000  // Updated balance after debit
  }
}

UI Flow:

Show available investment plans
Allow amount selection within min/max range
Show expected returns calculation
Confirm investment creation
Update wallet balance immediately
Add to active investments list
Copy Investment
Endpoint: POST /api/investments/copy

Request Body:
{
  "investmentId": "inv_user_123",
  "amount": 5000
}
Response:

{
  "message": "Investment copied successfully",
  "newInvestment": {
    "id": "inv_copy_456",
    "planName": "Gold Plan",
    "amount": 5000,
    "expectedReturn": 6250,
    "roiPercentage": 25,
    "startDate": "2024-01-06T10:30:00Z",
    "endDate": "2024-04-06T10:30:00Z",
    "daysRemaining": 90,
    "status": "ACTIVE"
  },
  "walletAfter": {
    "balance": 10000
  }
}

UI Flow:

In Browse Investments view, click "Copy Trade"
Input amount (validate against plan limits)
Show expected returns preview
Confirm copy
Debit wallet immediately
Add to user's active investments

4. Transactions
Get All Transactions (Paginated)
Endpoint: GET /api/transactions?page=1&limit=10&status=APPROVED

Response:
{
  "transactions": [
    {
      "id": "txn1",
      "type": "DEPOSIT",
      "amount": 5000,
      "status": "APPROVED",
      "date": "2024-01-05T14:20:00Z",
      "reference": "Deposit approved",
      "cryptoTxHash": null
    },
    {
      "id": "txn2",
      "type": "INVESTMENT_DEBIT",
      "amount": 2500,
      "status": "APPROVED",
      "date": "2024-01-04T10:15:00Z",
      "reference": "Investment in Gold Plan",
      "investmentId": "inv1"
    },
    {
      "id": "txn3",
      "type": "WITHDRAWAL",
      "amount": 1000,
      "status": "PENDING",
      "date": "2024-01-06T09:00:00Z",
      "reference": "Withdrawal request",
      "cryptoTxHash": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
UI Components:

Transaction history table/list
Filter by type (DEPOSIT, WITHDRAWAL, INVESTMENT_DEBIT, REFERRAL_CREDIT, ROI_CREDIT)
Filter by status (PENDING, APPROVED, REJECTED)
Sort by date
Show crypto transaction hash for verified deposits
5. Referrals
Get Referral Information & List
Endpoint: GET /api/user/referrals

Response:
{
  "referral": {
    "code": "REF-1704816000-xyz",
    "shareLink": "https://bullsandbears-fx.vercel.app/signup?ref=REF-1704816000-xyz",
    "totalReferrals": 5,
    "rewardTier": "Elite",  // Starter (1-5), Premium (6-10), Elite (11+)
    "rewardPercentage": 20,
    "totalRewardsEarned": 3500,
    "referredUsers": [
      {
        "id": "user2",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "status": "ACTIVE",
        "joinDate": "2024-01-01T00:00:00Z",
        "walletBalance": 10000,
        "depositApproved": true,
        "rewardCredit": 500
      }
    ]
  }
}
UI Components:

Referral code display
"Copy to Clipboard" button
Social share buttons (WhatsApp, Facebook, Twitter, Email)
QR code generation for share link
Reward tier indicator
Referral bonus percentage display
List of referred users with status
Total referrals count
Total rewards earned
6. KYC Verification
Get KYC Status
Endpoint: GET /api/kyc/status

Response:
{
  "kyc": {
    "id": "kyc123",
    "status": "NOT_SUBMITTED",  // NOT_SUBMITTED, PENDING, APPROVED, REJECTED
    "fullName": null,
    "idType": null,
    "idFrontUrl": null,
    "idBackUrl": null,
    "selfieUrl": null,
    "submittedAt": null,
    "approvedAt": null,
    "rejectedAt": null,
    "rejectionReason": null,
    "updatedAt": "2024-01-06T00:00:00Z"
  }
}

Submit KYC Documents
Endpoint: POST /api/kyc/submit

Request Body (FormData):
const formData = new FormData();
formData.append('fullName', 'John Doe');
formData.append('idType', 'PASSPORT');  // PASSPORT, DRIVERS_LICENSE, NATIONAL_ID
formData.append('idFront', fileIdFront);  // File object
formData.append('idBack', fileIdBack);    // File object
formData.append('selfie', fileSelfie);    // File object

Response:
{
  "message": "KYC documents submitted successfully",
  "kyc": {
    "id": "kyc123",
    "status": "PENDING",
    "fullName": "John Doe",
    "idType": "PASSPORT",
    "submittedAt": "2024-01-06T10:30:00Z",
    "updatedAt": "2024-01-06T10:30:00Z"
  }
}

UI Flow:

Check KYC status on dashboard
If NOT_SUBMITTED: Show KYC submission form
Form fields:
Full Name
ID Type dropdown (Passport, Driver's License, National ID)
Upload ID Front (image)
Upload ID Back (image)
Upload Selfie (image)
Preview uploaded images before submission
Submit and show "Submitted" status
Admin will review and approve/reject
Show notification when approved or rejected
7. User Profile
Get User Profile
Endpoint: GET /api/user/profile

Response:
{
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "INVESTOR",
    "status": "ACTIVE",
    "tenantId": "tenant456",
    "referralCode": "REF-1704816000-xyz",
    "createdAt": "2023-12-15T00:00:00Z"
  },
  "wallet": {
    "balance": 15000
  },
  "referral": {
    "code": "REF-1704816000-xyz",
    "shareLink": "https://bullsandbears-fx.vercel.app/signup?ref=REF-1704816000-xyz",
    "totalReferrals": 2,
    "rewardTier": "Premium",
    "rewardPercentage": 13,
    "totalRewardsEarned": 1300
  }
}

Update User Profile
Endpoint: PATCH /api/user/profile

Request Body:
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
Response:
{
  "message": "Profile updated successfully",
  "user": {
    "id": "user123",
    "name": "John Updated",
    "email": "john.updated@example.com"
  }
}
Change Password
Endpoint: POST /api/user/profile/change-password

Request Body:
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "confirmPassword": "NewPass456!"
}
Response:
{
  "message": "Password changed successfully"
}
UI Flow:

Profile page with user details
Edit name/email fields
Separate "Change Password" section
Current password verification
New password + confirm password
Password strength indicator
Show success/error messages
8. Notifications
Get Notifications
Endpoint: GET /api/notifications?page=1&limit=20&isRead=false

Response:
{
  "notifications": [
    {
      "id": "notif1",
      "title": "Deposit Approved",
      "message": "Your deposit of $5000 has been approved",
      "type": "SUCCESS",  // INFO, SUCCESS, WARNING, ERROR
      "isRead": false,
      "createdAt": "2024-01-06T10:30:00Z"
    },
    {
      "id": "notif2",
      "title": "KYC Approved",
      "message": "Your KYC verification has been approved",
      "type": "SUCCESS",
      "isRead": false,
      "createdAt": "2024-01-05T14:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "pages": 1
  }
}
Mark Notification as Read
Endpoint: PATCH /api/notifications/{notificationId}

Request Body:
{
  "isRead": true
}
Response:
{
  "message": "Notification marked as read"
}
UI Components:

Notification bell icon (with unread count badge)
Dropdown notification list
Color-coded by type (SUCCESS = green, ERROR = red, WARNING = yellow, INFO = blue)
Mark as read on click
Link to relevant page when clicked
Notification timestamp
Clear old notifications option
ADMIN DASHBOARD
1. Admin Dashboard Summary
Endpoint: GET /api/dashboard/admin

Response:
{
  "summary": {
    "totalUsers": 150,
    "activeInvestors": 120,
    "totalWalletBalance": 750000,
    "totalAUM": 500000,
    "pendingKYC": 8,
    "pendingWithdrawals": 3,
    "pendingDeposits": 5
  },
  "recentRequests": {
    "kycRequests": [
      {
        "id": "kyc1",
        "userId": "user1",
        "userName": "John Doe",
        "status": "PENDING",
        "submittedAt": "2024-01-06T10:00:00Z"
      }
    ],
    "withdrawalRequests": [
      {
        "id": "txn1",
        "userId": "user2",
        "userName": "Jane Smith",
        "amount": 2000,
        "status": "PENDING",
        "createdAt": "2024-01-06T09:30:00Z"
      }
    ],
    "depositRequests": [
      {
        "id": "txn2",
        "userId": "user3",
        "userName": "Bob Johnson",
        "amount": 5000,
        "status": "PENDING",
        "createdAt": "2024-01-06T08:15:00Z"
      }
    ]
  },
  "investmentPlans": [
    {
      "id": "plan1",
      "name": "Gold Plan",
      "roiPercentage": 25,
      "durationDays": 90,
      "investmentCount": 45,
      "totalInvested": 225000
    }
  ],
  "userStatistics": {
    "active": 120,
    "suspended": 5,
    "kycPending": 8,
    "kycApproved": 110,
    "kycRejected": 2
  }
}
2. User Management
Get All Users
Endpoint: GET /api/admin/users?page=1&limit=20&status=ACTIVE&search=john

Response:
{
  "users": [
    {
      "id": "user1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "INVESTOR",
      "status": "ACTIVE",
      "walletBalance": 10000,
      "totalInvested": 5000,
      "kycStatus": "APPROVED",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLogin": "2024-01-06T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
Update User Status
Endpoint: PATCH /api/admin/users

Request Body:
{
  "userId": "user1",
  "status": "SUSPENDED"  // ACTIVE or SUSPENDED
}
Response:
{
  "message": "User status updated",
  "user": {
    "id": "user1",
    "name": "John Doe",
    "status": "SUSPENDED"
  }
}
UI Components:

User list table with:
Name, Email, Role
Wallet balance
KYC status (badge)
Account status (ACTIVE/SUSPENDED)
Last login date
Created date
Search by name/email
Filter by status, role, KYC status
Suspend/Activate button per user
View user details link
3. KYC Verification Requests
Get Pending KYC Requests
Endpoint: GET /api/admin/kyc-requests?page=1&limit=10&status=PENDING

Response:
{
  "requests": [
    {
      "id": "kyc1",
      "userId": "user1",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "fullName": "John Alexander Doe",
      "idType": "PASSPORT",
      "idFrontUrl": "https://...",
      "idBackUrl": "https://...",
      "selfieUrl": "https://...",
      "status": "PENDING",
      "submittedAt": "2024-01-06T10:00:00Z",
      "submittedDaysAgo": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "pages": 1
  }
}
Approve KYC Request
Endpoint: POST /api/admin/kyc-requests/approve

Request Body:
{
  "kycId": "kyc1"
}
Response:
{
  "message": "KYC approved successfully",
  "kyc": {
    "id": "kyc1",
    "status": "APPROVED",
    "approvedAt": "2024-01-06T11:00:00Z"
  },
  "notification": {
    "id": "notif1",
    "title": "KYC Approved",
    "message": "Your KYC verification has been approved. You can now withdraw funds."
  }
}
Reject KYC Request
Endpoint: POST /api/admin/kyc-requests/reject

Request Body:
{
  "kycId": "kyc1",
  "rejectionReason": "Document is unclear. Please resubmit with clearer images."
}
Response:
{
  "message": "KYC rejected successfully",
  "kyc": {
    "id": "kyc1",
    "status": "REJECTED",
    "rejectionReason": "Document is unclear. Please resubmit with clearer images.",
    "rejectedAt": "2024-01-06T11:00:00Z"
  },
  "notification": {
    "id": "notif2",
    "title": "KYC Rejected",
    "message": "Your KYC verification was rejected. Reason: Document is unclear. Please resubmit with clearer images."
  }
}
UI Components:

KYC requests table
Filter by status (PENDING, APPROVED, REJECTED)
Image preview modal for:
ID Front
ID Back
Selfie
User info section (name, email)
Approve/Reject buttons
Rejection reason textarea
Submission date and days pending
Bulk approval for multiple requests
4. Withdrawal Requests
Get Pending Withdrawals
Endpoint: GET /api/admin/withdrawals?page=1&limit=10&status=PENDING

Response:
{
  "withdrawals": [
    {
      "id": "txn1",
      "userId": "user2",
      "userName": "Jane Smith",
      "userEmail": "jane@example.com",
      "amount": 2000,
      "cryptoType": "ETH",
      "withdrawalAddress": "0xUserAddress...",
      "status": "PENDING",
      "kycStatus": "APPROVED",
      "walletBalance": 10000,
      "createdAt": "2024-01-06T09:30:00Z",
      "requestedDaysAgo": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "pages": 1
  }
}
Approve Withdrawal
Endpoint: POST /api/admin/withdrawals/approve

Request Body:
{
  "transactionId": "txn1",
  "cryptoTxHash": "0x1234567890abcdef..."  // Optional
}
Response:
{
  "message": "Withdrawal approved successfully",
  "transaction": {
    "id": "txn1",
    "status": "APPROVED",
    "approvedAt": "2024-01-06T10:00:00Z"
  },
  "notification": {
    "id": "notif3",
    "title": "Withdrawal Approved",
    "message": "Your withdrawal of $2000 has been approved. Funds will be sent to your wallet."
  }
}
Reject Withdrawal
Endpoint: POST /api/admin/withdrawals/reject

Request Body:
{
  "transactionId": "txn1",
  "rejectionReason": "KYC verification failed. Please resubmit."
}
Response:
{
  "message": "Withdrawal rejected successfully",
  "transaction": {
    "id": "txn1",
    "status": "REJECTED",
    "rejectedAt": "2024-01-06T10:00:00Z"
  },
  "notification": {
    "id": "notif4",
    "title": "Withdrawal Rejected",
    "message": "Your withdrawal request was rejected. Reason: KYC verification failed. Please resubmit."
  }
}
UI Components:

Withdrawal requests table
Filter by status (PENDING, APPROVED, REJECTED)
User info (name, email, wallet balance, KYC status)
Withdrawal details (amount, crypto type, address)
KYC status indicator (red if not approved)
Approve/Reject buttons
Rejection reason textarea
Optional: Crypto tx hash input
Request age (days pending)
Bulk approval for multiple requests
5. Deposit Management
Get Pending Deposits
Endpoint: GET /api/admin/deposits?page=1&limit=10&status=PENDING

Response:
{
  "deposits": [
    {
      "id": "txn2",
      "userId": "user3",
      "userName": "Bob Johnson",
      "userEmail": "bob@example.com",
      "amount": 5000,
      "cryptoType": "BTC",
      "status": "PENDING",
      "cryptoTxHash": null,
      "createdAt": "2024-01-06T08:15:00Z",
      "requestedDaysAgo": 1,
      "referrerId": "user1",
      "referrerName": "John Doe"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
Approve Deposit
Endpoint: POST /api/admin/deposits/approve

Request Body:
{
  "transactionId": "txn2",
  "cryptoTxHash": "abc123def456..."
}
Response:
{
  "message": "Deposit approved successfully",
  "transaction": {
    "id": "txn2",
    "status": "APPROVED",
    "approvedAt": "2024-01-06T08:30:00Z"
  },
  "wallet": {
    "balance": 15000  // Updated balance
  },
  "referralCredit": {
    "referrerId": "user1",
    "amount": 500,  // 10% of $5000
    "credited": true
  },
  "notifications": [
    {
      "title": "Deposit Approved",
      "message": "Your deposit of $5000 has been approved"
    },
    {
      "title": "Referral Bonus",
      "message": "You earned $500 referral bonus from Bob Johnson's deposit"
    }
  ]
}
Reject Deposit
Endpoint: POST /api/admin/deposits/reject

Request Body:
{
  "transactionId": "txn2",
  "rejectionReason": "Crypto transaction not verified"
}
UI Components:

Deposit requests table
Filter by status (PENDING, APPROVED, REJECTED)
User info and amount
Crypto type and tx hash field
Referral info (if applicable)
Approve/Reject buttons
Rejection reason textarea
Request age (days pending)
6. Investment Plans
Get All Investment Plans
Endpoint: GET /api/admin/investment-plans

Response:
{
  "plans": [
    {
      "id": "plan1",
      "name": "Gold Plan",
      "minAmount": 1000,
      "maxAmount": 50000,
      "roiPercentage": 25,
      "durationDays": 90,
      "isActive": true,
      "investmentCount": 45,
      "totalInvested": 225000,
      "avgInvestmentAmount": 5000,
      "createdAt": "2023-12-01T00:00:00Z"
    },
    {
      "id": "plan2",
      "name": "Premium Plan",
      "minAmount": 5000,
      "maxAmount": 100000,
      "roiPercentage": 30,
      "durationDays": 180,
      "isActive": true,
      "investmentCount": 20,
      "totalInvested": 500000,
      "avgInvestmentAmount": 25000,
      "createdAt": "2023-11-15T00:00:00Z"
    }
  ]
}
Create Investment Plan (SUPER_ADMIN only)
Endpoint: POST /api/admin/investment-plans

Request Body:
{
  "name": "Platinum Plan",
  "minAmount": 10000,
  "maxAmount": 250000,
  "roiPercentage": 35,
  "durationDays": 365
}
Response:
{
  "message": "Investment plan created successfully",
  "plan": {
    "id": "plan3",
    "name": "Platinum Plan",
    "minAmount": 10000,
    "maxAmount": 250000,
    "roiPercentage": 35,
    "durationDays": 365,
    "isActive": true,
    "createdAt": "2024-01-06T11:00:00Z"
  }
}
UI Components:

Investment plans table with:
Plan name
Min/Max amounts
ROI percentage
Duration days
Active status toggle
Number of investments
Total invested
Average investment amount
Create new plan form (SUPER_ADMIN only)
Edit plan details
Deactivate/Activate plans
7. Wallet Management
Get All Wallets
Endpoint: GET /api/admin/wallets?page=1&limit=20&sortBy=balance

Response:
{
  "wallets": [
    {
      "id": "wallet1",
      "userId": "user1",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "balance": 50000,
      "transactionCount": 15,
      "lastTransactionDate": "2024-01-06T10:30:00Z",
      "createdAt": "2023-12-15T00:00:00Z"
    }
  ],
  "summary": {
    "totalWallets": 150,
    "totalBalance": 750000,
    "averageBalance": 5000,
    "largestWallet": 100000,
    "smallestWallet": 0
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
Adjust Wallet Balance (SUPER_ADMIN only)
Endpoint: PATCH /api/admin/wallets

Request Body:
{
  "walletId": "wallet1",
  "adjustmentAmount": 1000,
  "adjustmentType": "ADD",  // ADD or SUBTRACT
  "reason": "Manual adjustment - promotional bonus"
}
Response:
{
  "message": "Wallet balance adjusted successfully",
  "wallet": {
    "id": "wallet1",
    "balance": 51000,
    "previousBalance": 50000
  },
  "transaction": {
    "id": "txn_admin_1",
    "type": "MANUAL_ADJUSTMENT",
    "amount": 1000,
    "reason": "Manual adjustment - promotional bonus"
  }
}
UI Components:

Wallets table with:
User name & email
Wallet balance (sorted)
Transaction count
Last transaction date
Created date
Search by user name/email
Sort by balance, date, transaction count
Manual adjustment form (SUPER_ADMIN only)
Amount input
ADD/SUBTRACT toggle
Reason/note textarea
Wallet details modal with transaction history
8. Notifications & Alerts
Get Admin Notifications
Endpoint: GET /api/notifications?page=1&limit=20&isRead=false

Same as investor notifications but includes admin-specific alerts:

New KYC submissions
New withdrawal requests
Large investments
System alerts
COMMON UI/UX PATTERNS
Error Handling
try {
  const response = await fetch(endpoint, {
    headers: {...}
  });
  
  if (!response.ok) {
    const error = await response.json();
    // Show error.error or error.message
    showErrorToast(error.error || error.message);
    return;
  }
  
  const data = await response.json();
  // Process data
} catch (error) {
  showErrorToast('Network error. Please try again.');
}
Loading States
Show spinner/skeleton during API calls
Disable buttons during submission
Prevent duplicate submissions

Success Notifications
Toast message: "Action successful"
Refresh relevant data
Update UI optimistically where appropriate

Authentication
Store token in localStorage/sessionStorage
Include token in Authorization header
Redirect to login on 401 response
Refresh token if expired

Multi-Tab Synchronization
Consider using localStorage events or WebSockets
Sync auth token across tabs
Sync notifications across tabs

IMPLEMENTATION CHECKLIST
Investor Dashboard
 Create /dashboard route
 Implement wallet balance card
 Implement active investments card
 Implement expected returns card
 Implement KYC status indicator
 Implement recent transactions list (last 3)
 Implement referral link display with copy button
Investor Tabs
 Deposit tab with crypto address display
 Withdraw tab with KYC check
 Invest tab with plan selection
 Transaction History tab with pagination
 Referrals tab with share options
 Profile tab with edit & password change
 KYC verification tab with document upload
Admin Dashboard
 Create /admin/dashboard route
 Implement summary cards (users, wallets, pending requests)
 Implement recent requests cards
 Implement investment plans overview
Admin Tabs/Pages
 User Management page
 KYC Requests page with image preview
 Withdrawal Requests page
 Deposit Requests page
 Investment Plans page
 Wallet Management page
 Notifications page
General
 Authentication flow
 Header/footer navigation
 Responsive design
 Dark mode (optional)
 Error handling
 Loading states
 Toast notifications
 Modal dialogs
DEPLOYMENT & TESTING
Test Accounts
Investor:

Email: investor@test.com
Password: Investor123!
Admin (TENANT_ADMIN):

Email: adminbuchi@gmail.com
Password: Admin0275@
Super Admin (SUPER_ADMIN):

Email: superadminbuchi@gmail.com
Password: Super0275@
API Base URL
Development: http://localhost:3000
Production: https://investment-platform-core.vercel.app
Frontend Base URL
Development: http://localhost:5173
Production: https://bullsandbears-fx.vercel.app
SUPPORT & DOCUMENTATION
For backend API issues:

Check /api/admin/stats endpoint response format
Verify all required headers are being sent
Check browser console for CORS errors
Verify tenant ID is included in all requests
All endpoints are protected and require Bearer token authentication.

Claude Haiku 4.5 • 0.33x