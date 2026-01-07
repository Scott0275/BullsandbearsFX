import { API_URL, getHeaders } from './apiService';

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
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

export interface WalletResponse {
  wallet: Wallet;
  transactions: Transaction[];
}

/**
 * Wallet service handles all wallet-related operations:
 * - View balance and transaction history
 * - Request deposits (crypto payment)
 * - Request withdrawals
 * 
 * All endpoints require authentication headers.
 */
export const walletService = {
  /**
   * Get wallet balance and transaction history
   * Backend: GET /api/wallet
   */
  async getWallet(): Promise<WalletResponse> {
    try {
      const response = await fetch(`${API_URL}/api/wallet`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch wallet');
      }

      return response.json();
    } catch (error: any) {
      console.error('Wallet fetch error:', error.message);
      throw error;
    }
  },

  /**
   * Request a deposit to wallet
   * Backend: POST /api/wallet/deposit
   * 
   * Payment flow:
   * 1. User requests deposit with crypto type
   * 2. Backend returns transaction with crypto address
   * 3. User sends crypto to address (off-chain)
   * 4. Admin verifies and approves
   * 5. Wallet credited + referral rewards processed
   */
  async requestDeposit(amount: number, cryptoType: string, walletAddress: string) {
    try {
      const response = await fetch(`${API_URL}/api/wallet/deposit`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          amount,
          cryptoType,
          walletAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to create deposit request'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Deposit request error:', error.message);
      throw error;
    }
  },

  /**
   * Request a withdrawal from wallet
   * Backend: POST /api/wallet/withdraw
   * 
   * Withdrawal flow:
   * 1. User requests withdrawal to recipient address
   * 2. Backend validates balance
   * 3. Transaction created with PENDING status
   * 4. Admin approves (requires verification)
   * 5. Wallet debited and crypto sent
   */
  async requestWithdrawal(amount: number, recipientAddress: string) {
    try {
      const response = await fetch(`${API_URL}/api/wallet/withdraw`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          amount,
          recipientAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to create withdrawal request'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Withdrawal request error:', error.message);
      throw error;
    }
  },
};
