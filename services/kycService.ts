import { API_URL, getHeaders } from './apiService';

/**
 * KYC status types
 */
export type KYCStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'NOT_SUBMITTED';

export interface KYCStatusResponse {
  status: KYCStatus;
  submittedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface KYCRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  idType: 'PASSPORT' | 'DRIVER_LICENSE' | 'NATIONAL_ID';
  idNumber: string;
  idExpiry: string;
  idDocumentBase64: string;
}

export interface KYCSubmission extends KYCRequest {
  submittedAt: string;
}

export interface KYCRequestItem {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  idType: string;
  status: KYCStatus;
  submittedAt: string;
  rejectionReason?: string;
}

export interface KYCListResponse {
  items: KYCRequestItem[];
  total: number;
}

/**
 * KYC (Know Your Customer) verification service.
 * Handles user KYC submissions and admin KYC request management.
 * 
 * User Flow:
 * 1. User checks status with getStatus()
 * 2. If NOT_SUBMITTED, user submits KYC with submitKYC()
 * 3. Status changes to PENDING
 * 4. Admin reviews and approves/rejects
 * 5. User sees APPROVED or REJECTED status
 */
export const kycService = {
  /**
   * Get current user's KYC status
   * Backend: GET /api/kyc/status
   * Returns: Current KYC status, submission dates, rejection reason if applicable
   */
  async getStatus(): Promise<KYCStatusResponse> {
    try {
      const response = await fetch(`${API_URL}/api/kyc/status`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If 404, user hasn't submitted KYC yet
        if (response.status === 404) {
          return {
            status: 'NOT_SUBMITTED',
          };
        }
        
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to fetch KYC status'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Failed to fetch KYC status:', error.message);
      throw error;
    }
  },

  /**
   * Submit KYC verification for current user
   * Backend: POST /api/kyc/status
   * Converts image file to base64 and sends to backend
   * Returns: New KYC status set to PENDING
   */
  async submitKYC(data: Omit<KYCRequest, 'idDocumentBase64'>, idFile: File): Promise<KYCStatusResponse> {
    try {
      // Convert file to base64
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data:image/...;base64, prefix
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(idFile);
      });

      const response = await fetch(`${API_URL}/api/kyc/status`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...data,
          idDocumentBase64: fileContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to submit KYC. Please check your information and try again.'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Failed to submit KYC:', error.message);
      throw error;
    }
  },

  /**
   * Get all pending KYC requests (ADMIN ONLY)
   * Backend: GET /api/admin/kyc-requests?page=1&limit=10
   * Only accessible by TENANT_ADMIN and SUPER_ADMIN
   */
  async listKYCRequests(page: number = 1, limit: number = 10): Promise<KYCListResponse> {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/kyc-requests?page=${page}&limit=${limit}`,
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
          'Failed to fetch KYC requests'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Failed to fetch KYC requests:', error.message);
      throw error;
    }
  },

  /**
   * Approve a KYC request (ADMIN ONLY)
   * Backend: POST /api/admin/kyc-requests/:id/approve
   * Sets user's KYC status to APPROVED and updates timestamp
   */
  async approveKYC(kycRequestId: string): Promise<KYCRequestItem> {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/kyc-requests/${kycRequestId}/approve`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            approvedAt: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to approve KYC'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Failed to approve KYC:', error.message);
      throw error;
    }
  },

  /**
   * Reject a KYC request (ADMIN ONLY)
   * Backend: POST /api/admin/kyc-requests/:id/reject
   * Sets user's KYC status to REJECTED with reason
   */
  async rejectKYC(kycRequestId: string, rejectionReason: string): Promise<KYCRequestItem> {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/kyc-requests/${kycRequestId}/reject`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            rejectionReason,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to reject KYC'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Failed to reject KYC:', error.message);
      throw error;
    }
  },
};
