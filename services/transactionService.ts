import { API_URL, getHeaders } from './apiService';
import { Transaction } from './walletService';

export interface TransactionResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

/**
 * Transaction service handles transaction history and admin operations
 * - List transactions (paginated, user-filtered)
 * - Approve/reject deposit and withdrawal requests (admin only)
 */
export const transactionService = {
  /**
   * List all transactions for current user (paginated)
   * Backend: GET /api/transactions?page=1&limit=25
   * 
   * Returns transactions sorted by creation date (newest first)
   * Includes all transaction types: DEPOSIT, WITHDRAWAL, INVESTMENT_DEBIT, ROI_CREDIT, REFERRAL_CREDIT
   */
  async listTransactions(page: number = 1, limit: number = 25): Promise<TransactionResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_URL}/api/transactions?${params}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch transactions');
      }

      return response.json();
    } catch (error: any) {
      console.error('Transaction fetch error:', error.message);
      throw error;
    }
  },

  /**
   * Approve a pending transaction (ADMIN ONLY)
   * Backend: POST /api/transactions/approve
   * 
   * What happens on approval:
   * - DEPOSIT: Wallet credited + referral rewards auto-processed
   * - WITHDRAWAL: Wallet debited (crypto sent by admin separately)
   * 
   * Requires role: TENANT_ADMIN or SUPER_ADMIN
   */
  async approveTransaction(transactionId: string) {
    try {
      const response = await fetch(`${API_URL}/api/transactions/approve`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ transactionId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to approve transaction'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Transaction approval error:', error.message);
      throw error;
    }
  },

  /**
   * Reject a pending transaction (ADMIN ONLY)
   * Backend: POST /api/transactions/reject
   * 
   * Effect: Transaction marked as REJECTED, no wallet changes
   * 
   * Requires role: TENANT_ADMIN or SUPER_ADMIN
   */
  async rejectTransaction(transactionId: string) {
    try {
      const response = await fetch(`${API_URL}/api/transactions/reject`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ transactionId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to reject transaction'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Transaction rejection error:', error.message);
      throw error;
    }
  },
};
