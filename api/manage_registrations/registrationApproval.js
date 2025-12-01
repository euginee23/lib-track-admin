import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Update librarian approval status for a user.
 * @param {string} userId - The ID of the user to update.
 * @param {number} approvalStatus - The approval status (1 for approved, 0 for pending, 2 for disapproved).
 * @param {string|null} disapprovalReason - Optional reason for disapproval.
 * @returns {Promise<Object>}
 */
export const updateRegistrationApproval = async (userId, approvalStatus, disapprovalReason = null) => {
  try {
    const response = await axios.put(`${API_URL}/api/users/registrations/${userId}/approval`, {
      librarian_approval: approvalStatus,
      disapproval_reason: disapprovalReason,
    });

    if (!response.data) {
      console.error('Invalid API response structure:', response);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error('Error updating registration approval status:', error);
    throw error;
  }
};
