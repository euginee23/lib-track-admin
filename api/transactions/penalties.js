import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Mark transactions as lost - adds book price to user's penalty
 * @param {Array<number>} transaction_ids - Array of transaction IDs to mark as lost
 * @returns {Promise<Object>} Response with processed count and details
 */
export const markTransactionsAsLost = async (transaction_ids) => {
  try {
    const response = await axios.post(`${API_URL}/api/kiosk/penalties/mark-as-lost`, {
      transaction_ids
    });
    return response.data;
  } catch (error) {
    console.error('Error marking transactions as lost:', error);
    throw error.response?.data || error;
  }
};

/**
 * Process overdue transactions and create penalties
 * @returns {Promise<Object>} Response with processing details
 */
export const processOverduePenalties = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/kiosk/penalties/process-overdue`);
    return response.data;
  } catch (error) {
    console.error('Error processing overdue penalties:', error);
    throw error.response?.data || error;
  }
};

/**
 * Recalculate penalties based on current system settings
 * @returns {Promise<Object>} Response with recalculation details
 */
export const recalculatePenalties = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/kiosk/penalties/recalculate`);
    return response.data;
  } catch (error) {
    console.error('Error recalculating penalties:', error);
    throw error.response?.data || error;
  }
};

/**
 * Mark a penalty as paid
 * @param {number} penalty_id - ID of the penalty to mark as paid
 * @returns {Promise<Object>} Response with payment details
 */
export const markPenaltyAsPaid = async (penalty_id) => {
  try {
    const response = await axios.put(`${API_URL}/api/kiosk/penalties/${penalty_id}/pay`);
    return response.data;
  } catch (error) {
    console.error('Error marking penalty as paid:', error);
    throw error.response?.data || error;
  }
};
