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
  address: string;
  isActive: boolean;
  updatedAt?: string;
}

export interface ROIDistributionResponse {
  message: string;
  distributed: {
    count: number;
    totalAmount: number;
    investmentsProcessed: Array<{
      investmentId: string;
      userId: string;
      roiAmount: number;
      status: 'CREDITED';
    }>;
  };
}

/**
 * Admin service handles administrative operations
 * Requires TENANT_ADMIN or SUPER_ADMIN role for all endpoints
 * 
 * Operations:
 * - View platform stats (users, investments, transactions)
 * - Manage crypto payment addresses
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
  async distributeROI(): Promise<ROIDistributionResponse> {
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
};
