import { API_URL, getHeaders } from './apiService';

/**
 * Notification types
 */
export type NotificationType = 
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'INVESTMENT_CREATED'
  | 'INVESTMENT_COMPLETED'
  | 'ROI_CREDITED'
  | 'DEPOSIT_APPROVED'
  | 'DEPOSIT_REJECTED'
  | 'WITHDRAWAL_APPROVED'
  | 'WITHDRAWAL_REJECTED'
  | 'REFERRAL_EARNED'
  | 'PAYMENT_ADDRESS_CREATED'
  | 'PAYMENT_ADDRESS_DELETED'
  | 'PLAN_CREATED'
  | 'PLAN_UPDATED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface NotificationListResponse {
  items: Notification[];
  total: number;
  unreadCount: number;
}

export interface MarkReadResponse {
  markedRead: number;
}

/**
 * Notification service for managing user notifications.
 * 
 * Features:
 * - Fetch notifications (paginated, with read status)
 * - Mark individual notification as read
 * - Mark all notifications as read
 * - Get unread count
 * 
 * Used by notification center component and bell icon badge
 */
export const notificationService = {
  /**
   * Get user's notifications
   * Backend: GET /api/notifications?page=1&limit=10&unread=false
   * Returns: List of notifications with total count and unread count
   */
  async getNotifications(
    page: number = 1,
    limit: number = 10,
    unreadOnly: boolean = false
  ): Promise<NotificationListResponse> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        unread: unreadOnly.toString(),
      });

      const response = await fetch(
        `${API_URL}/api/notifications?${queryParams}`,
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
          'Failed to fetch notifications'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error.message);
      throw error;
    }
  },

  /**
   * Get only unread notifications
   * Convenience method using getNotifications with unreadOnly=true
   */
  async getUnreadNotifications(limit: number = 10): Promise<NotificationListResponse> {
    return this.getNotifications(1, limit, true);
  },

  /**
   * Mark a single notification as read
   * Backend: POST /api/notifications/:id/read
   * Returns: Updated notification with read=true
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {
          method: 'POST',
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to mark notification as read'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error.message);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   * Backend: POST /api/notifications/read-all
   * Returns: Count of notifications marked as read
   */
  async markAllAsRead(): Promise<MarkReadResponse> {
    try {
      const response = await fetch(
        `${API_URL}/api/notifications/read-all`,
        {
          method: 'POST',
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to mark all notifications as read'
        );
      }

      return response.json();
    } catch (error: any) {
      console.error('Failed to mark all notifications as read:', error.message);
      throw error;
    }
  },

  /**
   * Get unread notification count
   * Convenience method that calls getUnreadNotifications and returns count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const result = await this.getUnreadNotifications(1);
      return result.unreadCount;
    } catch (error: any) {
      console.error('Failed to get unread count:', error.message);
      // Return 0 if fetch fails
      return 0;
    }
  },
};
