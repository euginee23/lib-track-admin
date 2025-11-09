import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Post a user notification to the server-backed notifications table.
 * Uses the server route POST /api/notifications
 * @param {Object} payload
 * @param {number|string} payload.user_id - target user id (required)
 * @param {number|string|null} payload.notification_type - optional numeric type/category
 * @param {string} payload.notification_message - message body (required)
 * @returns {Promise<Object>} created notification object
 */
export const postUserNotification = async (payload = {}) => {
  try {
    const { user_id, notification_type = 'Reservation Notification', notification_message } = payload;
    if (!user_id) throw new Error('user_id is required');
    if (!notification_message) throw new Error('notification_message is required');

    const response = await axios.post(`${API_BASE_URL}/api/notifications`, {
      user_id,
      notification_type,
      notification_message
    });

    return response.data;
  } catch (error) {
    console.error('Admin: Error posting user notification:', error?.response?.data || error.message || error);
    throw new Error(`Failed to post user notification: ${error.response?.data?.message || error.message}`);
  }
};

export default {
  postUserNotification
};
