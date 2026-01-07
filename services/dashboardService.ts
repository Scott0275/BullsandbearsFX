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
 * 
 * NOTE: This is the SINGLE SOURCE OF TRUTH for all dashboard data.
 * Each method calls ONE backend endpoint and returns the response with fallbacks.
 */
export const dashboardService = {
  /**
   * Get investor dashboard data
   * Backend: GET /api/investor/dashboard
   * Returns: wallet, investments, transactions, kycStatus, notifications
   */
  async getInvestorDashboard(): Promise<InvestorDashboardData> {
    try {
      // SIMPLE: Call one backend endpoint
      const response = await fetch(`${API_URL}/api/investor/dashboard`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to load dashboard'
        );
      }

      const data = await response.json();
      console.log('Investor dashboard data:', data); // Debug log
      
      // Map backend response to component expectations
      // Backend can return in any format - we normalize it here
      return {
        wallet: data.wallet || data.walletData || {
          id: '',
          balance: 0,
          totalInvested: 0,
          totalEarned: 0,
        },
        investments: data.investments || data.investmentData || {
          active: 0,
          completed: 0,
          totalValue: 0,
        },
        transactions: Array.isArray(data.transactions) ? data.transactions : Array.isArray(data.transactionHistory) ? data.transactionHistory : [],
        kycStatus: data.kycStatus || 'NOT_SUBMITTED',
        unreadNotifications: data.unreadNotifications || 0,
        paymentAddresses: Array.isArray(data.paymentAddresses) ? data.paymentAddresses : [],
      };
    } catch (error: any) {
      console.error('Dashboard API error:', error);
      throw error;
    }
  },

  /**
   * Get admin dashboard data (for TENANT_ADMIN and SUPER_ADMIN)
   * Backend: GET /api/admin/dashboard
   * Returns: overview, pendingTransactions, kycRequests, investmentStats
   */
  async getAdminDashboard(): Promise<any> {
    try {
      // SIMPLE: Call one backend endpoint
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
      console.log('Admin dashboard data:', data); // Debug log
      
      // Map backend response - handle various response formats
      return {
        overview: data.overview || data.stats || {
          totalUsers: 0,
          totalAUM: 0,
          totalInvested: 0,
          totalEarned: 0,
          activeInvestments: 0,
        },
        pendingTransactions: Array.isArray(data.pendingTransactions) ? data.pendingTransactions : Array.isArray(data.transactions?.pending?.details) ? data.transactions.pending.details : [],
        pendingKyc: Array.isArray(data.kycRequests) ? data.kycRequests.length : data.pendingKyc || 0,
        kycRequests: Array.isArray(data.kycRequests) ? data.kycRequests : [],
        recentInvestments: Array.isArray(data.recentInvestments) ? data.recentInvestments : [],
        investmentStats: data.investmentStats || data.investments || {
          active: 0,
          completed: 0,
          activeDetails: [],
        },
      };
    } catch (error: any) {
      console.error('Admin dashboard API error:', error);
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
