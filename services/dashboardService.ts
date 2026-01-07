import { API_URL, getHeaders } from './apiService';

/**
 * Dashboard data types
 */
export interface WalletSummary {
  id: string;
  balance: number;
  totalInvested: number;
  totalEarned: number;
}

export interface InvestmentSummary {
  active: number;
  completed: number;
  totalValue: number;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'INVESTMENT_DEBIT' | 'ROI_CREDIT' | 'REFERRAL_CREDIT';
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  cryptoTxHash?: string;
  investmentId?: string;
  createdAt: string;
}

export interface PaymentAddress {
  id: string;
  crypto: string;
  address: string;
}

export interface InvestorDashboardData {
  wallet: WalletSummary;
  investments: InvestmentSummary;
  transactions: Transaction[];
  kycStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NOT_SUBMITTED';
  unreadNotifications: number;
  paymentAddresses: PaymentAddress[];
}

/**
 * Dashboard service for fetching dashboard data for different user roles.
 * Centralizes all dashboard API calls and data transformations.
 */
export const dashboardService = {
  /**
   * Get investor dashboard data
   * Backend: GET /api/dashboard/investor
   * Returns: Complete dashboard overview with wallet, investments, transactions, KYC status
   */
  async getInvestorDashboard(): Promise<InvestorDashboardData> {
    try {
      const response = await fetch(`${API_URL}/api/dashboard/investor`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to load dashboard data'
        );
      }

      const data = await response.json();
      
      // Ensure consistent data structure (fallback to defaults if fields missing)
      return {
        wallet: data.wallet || {
          id: '',
          balance: 0,
          totalInvested: 0,
          totalEarned: 0,
        },
        investments: data.investments || {
          active: 0,
          completed: 0,
          totalValue: 0,
        },
        transactions: Array.isArray(data.transactions) ? data.transactions : [],
        kycStatus: data.kycStatus || 'NOT_SUBMITTED',
        unreadNotifications: data.unreadNotifications || 0,
        paymentAddresses: Array.isArray(data.paymentAddresses) ? data.paymentAddresses : [],
      };
    } catch (error: any) {
      console.error('Failed to fetch investor dashboard:', error.message);
      throw error;
    }
  },

  /**
   * Get admin dashboard data (for TENANT_ADMIN and SUPER_ADMIN)
   * Backend: GET /api/admin/dashboard
   * Returns: Overview statistics, pending transactions, pending KYC requests, investment stats
   */
  async getAdminDashboard(): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/api/admin/dashboard`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to load admin dashboard'
        );
      }

      const data = await response.json();
      
      // Ensure consistent structure
      return {
        overview: data.overview || {
          totalUsers: 0,
          totalInvested: 0,
          totalEarned: 0,
          activeInvestments: 0,
        },
        pendingTransactions: data.pendingTransactions || {
          deposits: 0,
          withdrawals: 0,
        },
        pendingKyc: data.pendingKyc || 0,
        recentInvestments: Array.isArray(data.recentInvestments) ? data.recentInvestments : [],
        investmentStats: data.investmentStats || {
          byPlan: {},
          totalValue: 0,
        },
      };
    } catch (error: any) {
      console.error('Failed to fetch admin dashboard:', error.message);
      throw error;
    }
  },

  /**
   * Get super admin dashboard data
   * Backend: GET /api/super-admin/dashboard
   * Returns: Platform-wide metrics, user management stats, ROI distribution info
   */
  async getSuperAdminDashboard(): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/api/super-admin/dashboard`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to load super admin dashboard'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Failed to fetch super admin dashboard:', error.message);
      throw error;
    }
  },
};
