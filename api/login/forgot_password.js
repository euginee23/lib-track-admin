import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/**
 * Send forgot password request
 * @param {string} email - Admin email address
 * @returns {Promise<Object>} Response data
 */
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/api/admin/forgot-password`, {
      email
    });

    if (response.data.success) {
      return response.data;
    } else {
      const errorMessage = response.data.message || 'Failed to send reset code';
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Forgot password API error:', error);
    
    if (error.response) {
      // Server responded with an error status
      const errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An error occurred while sending reset code');
    }
  }
};

/**
 * Reset password with verification code
 * @param {string} email - Admin email address
 * @param {string} code - Verification code
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Response data
 */
export const resetPassword = async (email, code, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/api/admin/reset-password`, {
      email,
      code,
      newPassword
    });

    if (response.data.success) {
      return response.data;
    } else {
      const errorMessage = response.data.message || 'Failed to reset password';
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Reset password API error:', error);
    
    if (error.response) {
      // Server responded with an error status
      const errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An error occurred while resetting password');
    }
  }
};