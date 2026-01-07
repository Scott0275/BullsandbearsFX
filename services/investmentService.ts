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

/**
 * Investment service handles investment lifecycle:
 * - List active and completed investments
 * - Create new investments from available plans
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
};
