import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Enroll users for the active semester
 * @param {number[]} userIds - Array of user IDs to enroll
 * @returns {Promise<Object>} Response with enrollment status
 */
export const enrollUsersForSemester = async (userIds) => {
  try {
    const response = await axios.post(`${API_URL}/api/semesters/enroll`, {
      user_ids: userIds,
    });
    return response.data;
  } catch (error) {
    console.error('Error enrolling users for semester:', error);
    throw error.response?.data || error;
  }
};
