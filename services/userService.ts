import { API_URL, getHeaders } from './apiService';

/**
 * User profile information
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  role: string;
  referralCode: string;
  totalReferrals: number;
  referralEarnings: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

/**
 * User service for managing user profile and settings.
 * 
 * Features:
 * - Get user profile information
 * - Update profile (name, email, address, etc.)
 * - Change password
 * - Get referral code and earnings
 * 
 * Used by:
 * - User profile page
 * - Settings/preferences
 * - Referral system
 */
export const userService = {
  /**
   * Get current user's profile
   * Backend: GET /api/user/profile
   * Returns: Complete user profile including referral info
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to fetch profile'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error.message);
      throw error;
    }
  },

  /**
   * Update user profile information
   * Backend: PATCH /api/user/profile
   * Only provided fields are updated (partial update)
   * Returns: Updated profile object
   */
  async updateProfile(data: ProfileUpdateRequest): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to update profile. Please check your information and try again.'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Failed to update profile:', error.message);
      throw error;
    }
  },

  /**
   * Change user password
   * Backend: POST /api/user/change-password
   * Requires current password for verification
   * Returns: Success response
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<ChangePasswordResponse> {
    try {
      const response = await fetch(`${API_URL}/api/user/change-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to change password. Please check your current password.'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Failed to change password:', error.message);
      throw error;
    }
  },

  /**
   * Get user's referral code
   * Convenience method to extract referral code from profile
   */
  async getReferralCode(): Promise<string> {
    try {
      const profile = await this.getProfile();
      return profile.referralCode;
    } catch (error) {
      console.error('Failed to get referral code:', error);
      throw error;
    }
  },

  /**
   * Get user's referral statistics
   * Convenience method to extract referral info from profile
   */
  async getReferralStats(): Promise<{
    totalReferrals: number;
    referralEarnings: number;
    referralCode: string;
  }> {
    try {
      const profile = await this.getProfile();
      return {
        totalReferrals: profile.totalReferrals,
        referralEarnings: profile.referralEarnings,
        referralCode: profile.referralCode,
      };
    } catch (error) {
      console.error('Failed to get referral stats:', error);
      throw error;
    }
  },

  /**
   * Copy referral code to clipboard
   * Utility method for UX convenience
   */
  async copyReferralCode(): Promise<string> {
    try {
      const code = await this.getReferralCode();
      await navigator.clipboard.writeText(code);
      return code;
    } catch (error) {
      console.error('Failed to copy referral code:', error);
      throw new Error('Failed to copy referral code to clipboard');
    }
  },
};
