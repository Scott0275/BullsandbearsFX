import { API_URL, getHeaders } from './apiService';
import { Transaction } from './walletService';

export interface AdminStatsResponse {
  overview: {
    totalUsers: number;
    totalAUM: number; // Assets Under Management
    totalWalletBalance: number;
    totalExpectedReturns: number;
  };
  investments: {
    active: number;
    completed: number;
    activeDetails: Array<{
      id: string;
      userId: string;
      amount: number;
      expectedReturn: number;
      status: string;
    }>;
  };
  transactions: {
    pending: {
      count: number;
      details: Transaction[];
    };
    approved: number;
    rejected: number;
  };
}

export interface PaymentAddress {
  id: string;
  cryptoType: string;
  crypto?: string;
  address: string;
  isActive?: boolean;
  updatedAt?: string;
  createdAt?: string;
}

export interface PaymentAddressResponse {
  items?: PaymentAddress[];
  addresses?: PaymentAddress[];
  id?: string;
  cryptoType?: string;
  crypto?: string;
  address?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  totalInvested: number;
  createdAt: string;
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  roi: number;
  duration: number;
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
  features?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface InvestmentPlanListResponse {
  items: InvestmentPlan[];
  total: number;
}

export interface PlanCreateRequest {
  name: string;
  minAmount: number;
  maxAmount: number;
  roi: number;
  duration: number;
  description?: string;
  features?: string[];
}

export interface PlanUpdateRequest {
  name?: string;
  minAmount?: number;
  maxAmount?: number;
  roi?: number;
  duration?: number;
  description?: string;
  features?: string[];
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface SuspendUserResponse {
  id: string;
  status: 'SUSPENDED';
  reason: string;
}

export interface UnsuspendUserResponse {
  id: string;
  status: 'ACTIVE';
}

/**
 * Admin service handles administrative operations
 * Requires TENANT_ADMIN or SUPER_ADMIN role for all endpoints
 * 
 * Operations:
 * - View platform stats (users, investments, transactions)
 * - Manage crypto payment addresses
 * - Manage users (view, suspend, unsuspend)
 * - Manage investment plans (CRUD)
 * - Distribute ROI to completed investments (SUPER_ADMIN only)
 */
export const adminService = {
  /**
   * Get admin dashboard statistics (ADMIN ONLY)
   * Backend: GET /api/admin/stats
   * 
   * Requires: TENANT_ADMIN or SUPER_ADMIN role
   * 
   * Returns:
   * - Platform overview (users, AUM, wallet balance, expected returns)
   * - Investment metrics (active count, completed, details)
   * - Transaction metrics (pending approvals, approved, rejected)
   */
  async getStats(): Promise<AdminStatsResponse> {
    try {
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const status = response.status;
        if (status === 403) {
          throw new Error('Insufficient permissions. Admin access required.');
        }
        throw new Error(errorData.error || 'Failed to fetch admin stats');
      }

      return response.json();
    } catch (error: any) {
      console.error('Admin stats error:', error.message);
      throw error;
    }
  },

  /**
   * Get all crypto payment addresses (ADMIN ONLY)
   * Backend: GET /api/admin/payment-addresses
   * 
   * Returns addresses configured for receiving crypto deposits
   * Multiple addresses can be active for different crypto types (ETH, BTC, SOL, etc.)
   */
  async getPaymentAddresses(): Promise<{ addresses: PaymentAddress[] }> {
    try {
      const response = await fetch(`${API_URL}/api/admin/payment-addresses`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch payment addresses');
      }

      return response.json();
    } catch (error: any) {
      console.error('Payment addresses fetch error:', error.message);
      throw error;
    }
  },

  /**
   * Add a new crypto payment address (ADMIN ONLY)
   * Backend: POST /api/admin/payment-addresses
   * 
   * Creates a new payment address for receiving crypto deposits
   * Can have multiple addresses for different crypto types
   */
  async addPaymentAddress(cryptoType: string, address: string) {
    try {
      const response = await fetch(`${API_URL}/api/admin/payment-addresses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          cryptoType,
          address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add payment address');
      }

      return response.json();
    } catch (error: any) {
      console.error('Add payment address error:', error.message);
      throw error;
    }
  },

  /**
   * Update an existing crypto payment address (ADMIN ONLY)
   * Backend: PATCH /api/admin/payment-addresses/[id]
   * 
   * Updates address details or active status
   */
  async updatePaymentAddress(
    addressId: string,
    updates: { address?: string; isActive?: boolean }
  ) {
    try {
      const response = await fetch(`${API_URL}/api/admin/payment-addresses/${addressId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update payment address');
      }

      return response.json();
    } catch (error: any) {
      console.error('Update payment address error:', error.message);
      throw error;
    }
  },

  /**
   * Distribute ROI to completed investments (SUPER_ADMIN ONLY)
   * Backend: POST /api/admin/roi-distribution
   * 
   * Requires: SUPER_ADMIN role only
   * 
   * Automated ROI distribution:
   * 1. Finds all COMPLETED investments (endDate <= now)
   * 2. Calculates ROI (expectedReturn - amount)
   * 3. Credits investor wallets
   * 4. Creates ROI_CREDIT transactions
   * 5. Prevents double-distribution automatically
   * 
   * Returns detailed report of processed investments
   */
  async distributeROI(): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/api/admin/roi-distribution`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const status = response.status;
        if (status === 403) {
          throw new Error('ROI distribution requires SUPER_ADMIN role');
        }
        throw new Error(errorData.error || 'Failed to distribute ROI');
      }

      return response.json();
    } catch (error: any) {
      console.error('ROI distribution error:', error.message);
      throw error;
    }
  },

  /**
   * Get all users (ADMIN ONLY)
   * Backend: GET /api/admin/users?page=1&limit=10
   * 
   * Lists all users with their status and investment info
   * Supports pagination and filtering
   */
  async listUsers(page: number = 1, limit: number = 10): Promise<UserListResponse> {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/users?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      return response.json();
    } catch (error: any) {
      console.error('Users fetch error:', error.message);
      throw error;
    }
  },

  /**
   * Suspend a user account (ADMIN ONLY)
   * Backend: POST /api/admin/users/:id/suspend
   * 
   * Suspends user account, preventing login and transactions
   */
  async suspendUser(userId: string, reason: string): Promise<SuspendUserResponse> {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to suspend user');
      }

      return response.json();
    } catch (error: any) {
      console.error('Suspend user error:', error.message);
      throw error;
    }
  },

  /**
   * Unsuspend a user account (ADMIN ONLY)
   * Backend: POST /api/admin/users/:id/unsuspend
   * 
   * Restores suspended user account to ACTIVE status
   */
  async unsuspendUser(userId: string): Promise<UnsuspendUserResponse> {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/unsuspend`, {
        method: 'POST',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to unsuspend user');
      }

      return response.json();
    } catch (error: any) {
      console.error('Unsuspend user error:', error.message);
      throw error;
    }
  },

  /**
   * Get all investment plans (ADMIN ONLY)
   * Backend: GET /api/admin/investment-plans
   * 
   * Lists all investment plans with their parameters
   */
  async listInvestmentPlans(): Promise<InvestmentPlanListResponse> {
    try {
      const response = await fetch(`${API_URL}/api/admin/investment-plans`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch investment plans');
      }

      return response.json();
    } catch (error: any) {
      console.error('Investment plans fetch error:', error.message);
      throw error;
    }
  },

  /**
   * Create a new investment plan (ADMIN ONLY)
   * Backend: POST /api/admin/investment-plans
   * 
   * Creates new investment plan available to all users
   */
  async createInvestmentPlan(data: PlanCreateRequest): Promise<InvestmentPlan> {
    try {
      const response = await fetch(`${API_URL}/api/admin/investment-plans`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create investment plan');
      }

      return response.json();
    } catch (error: any) {
      console.error('Create investment plan error:', error.message);
      throw error;
    }
  },

  /**
   * Update an investment plan (ADMIN ONLY)
   * Backend: PATCH /api/admin/investment-plans/:id
   * 
   * Updates plan parameters (only provided fields)
   */
  async updateInvestmentPlan(planId: string, data: PlanUpdateRequest): Promise<InvestmentPlan> {
    try {
      const response = await fetch(`${API_URL}/api/admin/investment-plans/${planId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update investment plan');
      }

      return response.json();
    } catch (error: any) {
      console.error('Update investment plan error:', error.message);
      throw error;
    }
  },

  /**
   * Delete a crypto payment address (ADMIN ONLY)
   * Backend: DELETE /api/admin/payment-addresses/:id
   * 
   * Removes payment address from active use
   */
  async deletePaymentAddress(addressId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_URL}/api/admin/payment-addresses/${addressId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete payment address');
      }

      return response.json();
    } catch (error: any) {
      console.error('Delete payment address error:', error.message);
      throw error;
    }
  }
};
