/**
 * Activity Notifications Utility
 * Manages unread activity logs and notifications
 */

const STORAGE_KEY = 'unread_activity_logs';

export const activityNotifications = {
  /**
   * Get all unread activity IDs
   * @returns {string[]} Array of unread activity IDs
   */
  getUnread() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  },

  /**
   * Get count of unread activities
   * @returns {number} Count of unread activities
   */
  getUnreadCount() {
    return this.getUnread().length;
  },

  /**
   * Add a new unread activity
   * @param {string} activityId - ID of the activity
   */
  addUnread(activityId) {
    const unread = this.getUnread();
    if (!unread.includes(activityId)) {
      unread.push(activityId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unread));
      this.notifyChange();
    }
  },

  /**
   * Mark a specific activity as read
   * @param {string} activityId - ID of the activity to mark as read
   */
  markAsRead(activityId) {
    const unread = this.getUnread();
    const filtered = unread.filter(id => id !== activityId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    this.notifyChange();
  },

  /**
   * Mark all activities as read
   */
  markAllAsRead() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    this.notifyChange();
  },

  /**
   * Check if an activity is unread
   * @param {string} activityId - ID of the activity
   * @returns {boolean} True if unread
   */
  isUnread(activityId) {
    return this.getUnread().includes(activityId);
  },

  /**
   * Notify all components of a change
   */
  notifyChange() {
    window.dispatchEvent(new CustomEvent('activityLogsUpdated', {
      detail: { count: this.getUnreadCount() }
    }));
  },

  /**
   * Create notification message from WebSocket data
   * @param {object} data - WebSocket event data
   * @returns {string} Formatted notification message
   */
  formatNotification(data) {
    switch (data.type) {
      case 'BOOK_BORROWED':
        return `${data.data.user_name} borrowed ${data.data.total_items} item(s)`;
      case 'BOOK_RETURNED':
        return `${data.data.user_name} returned ${data.data.total_returned} item(s)`;
      case 'PENALTY_PAID':
        return `${data.data.user_name} paid ₱${data.data.fine_amount} penalty`;
      default:
        return 'New activity recorded';
    }
  }
};

export default activityNotifications;
