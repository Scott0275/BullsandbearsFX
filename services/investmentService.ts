import { API_URL, getHeaders } from './apiService';

export interface Investment {
  id: string;
  planId: string;
  planName: string;
  amount: number;
  expectedReturn: number;
  roiPercentage: number;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  startDate: string;
  endDate: string;
  daysRemaining: number;
}

export interface InvestmentResponse {
  investments: Investment[];
}

export interface CreateInvestmentResponse {
  investment: Investment;
  message: string;
}

export interface BrowseInvestment {
  investmentId: string;
  userId: string;
  userName: string;
  planName: string;
  amount: number;
  roi: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface BrowseInvestmentResponse {
  items: BrowseInvestment[];
  total: number;
  page: number;
}

export interface ActiveInvestment extends Investment {
  projectedReturn: number;
  timeRemaining: number;
}

export interface ActiveInvestmentResponse {
  items: ActiveInvestment[];
  total: number;
}

export interface CopyInvestmentRequest {
  amount: number;
}

/**
 * Investment service handles investment lifecycle:
 * - List active and completed investments
 * - Create new investments from available plans
 * - Browse and copy other users' investments (copy trading)
 * - Track ROI progress
 */
export const investmentService = {
  /**
   * Get all investments for current user
   * Backend: GET /api/investments
   * 
   * Returns both ACTIVE and COMPLETED investments with:
   * - Investment amount and expected return
   * - Plan name and ROI percentage
   * - Timeline (start, end, days remaining)
   * - Current status
   */
  async listInvestments(): Promise<InvestmentResponse> {
    try {
      const response = await fetch(`${API_URL}/api/investments`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch investments');
      }

      return response.json();
    } catch (error: any) {
      console.error('Investment fetch error:', error.message);
      throw error;
    }
  },

  /**
   * Create a new investment
   * Backend: POST /api/investments
   * 
   * Investment flow:
   * 1. User selects plan and amount
   * 2. Backend validates:
   *    - Sufficient wallet balance
   *    - Plan exists and is active
   *    - Amount within plan limits
   * 3. Funds debited from wallet (INVESTMENT_DEBIT transaction)
   * 4. Investment created with start/end dates
   * 5. ROI will be credited when investment completes
   * 
   * Error cases:
   * - 400: Insufficient wallet balance or invalid amount
   * - 404: Plan not found
   * - 409: Plan inactive or amount outside limits
   */
  async createInvestment(planId: string, amount: number): Promise<CreateInvestmentResponse> {
    try {
      const response = await fetch(`${API_URL}/api/investments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          planId,
          amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to create investment'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Investment creation error:', error.message);
      throw error;
    }
  },

  /**
   * Browse available investments from other users (Copy Trading)
   * Backend: GET /api/investments/browse?page=1&limit=10
   * 
   * Allows users to see active investments from other users
   * and optionally copy them with their own capital.
   * 
   * Returns list of active investments with user info
   */
  async browseInvestments(page: number = 1, limit: number = 10): Promise<BrowseInvestmentResponse> {
    try {
      const response = await fetch(
        `${API_URL}/api/investments/browse?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to fetch available investments'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Browse investments error:', error.message);
      throw error;
    }
  },

  /**
   * Copy another user's investment (Copy Trading)
   * Backend: POST /api/investments/copy/:investmentId
   * 
   * Allows user to create their own investment mirroring
   * another user's investment plan. User provides their own capital.
   * 
   * Returns: New investment created with provided amount
   */
  async copyInvestment(investmentId: string, amount: number): Promise<CreateInvestmentResponse> {
    try {
      const response = await fetch(
        `${API_URL}/api/investments/copy/${investmentId}`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            amount,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to copy investment'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Copy investment error:', error.message);
      throw error;
    }
  },

  /**
   * Get all active investments with projections
   * Backend: GET /api/investments/active
   * 
   * Returns only ACTIVE investments with:
   * - Projected return based on time remaining
   * - Time remaining until completion
   * 
   * Useful for dashboard overview showing active ROI tracking
   */
  async getActiveInvestments(): Promise<ActiveInvestmentResponse> {
    try {
      const response = await fetch(`${API_URL}/api/investments/active`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to fetch active investments'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Active investments fetch error:', error.message);
      throw error;
    }
  },

