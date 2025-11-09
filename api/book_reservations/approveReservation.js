import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Admin reservation actions: approve, reject, cancel
 */

/**
 * Approve a reservation
 * @param {string|number} reservationId
 * @param {string|null} reason
 * @returns {Promise<Object>} API response
 */
export const approveReservation = async (reservationId, reason = null) => {
  try {
    if (!reservationId) throw new Error('Reservation ID is required');
    const response = await axios.put(`${API_BASE_URL}/api/reservations/${reservationId}`, {
      status: 'Approved',
      reason: reason || null
    });
    return response.data;
  } catch (error) {
    console.error(`Admin: Error approving reservation ${reservationId}:`, error);
    throw new Error(`Failed to approve reservation: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Reject a reservation
 * @param {string|number} reservationId
 * @param {string} reason - required
 * @returns {Promise<Object>} API response
 */
export const rejectReservation = async (reservationId, reason) => {
  try {
    if (!reservationId) throw new Error('Reservation ID is required');
    if (!reason) throw new Error('Reason is required when rejecting a reservation');
    const response = await axios.put(`${API_BASE_URL}/api/reservations/${reservationId}`, {
      status: 'Rejected',
      reason
    });
    return response.data;
  } catch (error) {
    console.error(`Admin: Error rejecting reservation ${reservationId}:`, error);
    throw new Error(`Failed to reject reservation: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Cancel / Delete a reservation
 * @param {string|number} reservationId
 * @returns {Promise<Object>} API response
 */
export const cancelReservation = async (reservationId) => {
  try {
    if (!reservationId) throw new Error('Reservation ID is required');
    const response = await axios.delete(`${API_BASE_URL}/api/reservations/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error(`Admin: Error cancelling reservation ${reservationId}:`, error);
    throw new Error(`Failed to cancel reservation: ${error.response?.data?.message || error.message}`);
  }
};

export default {
  approveReservation,
  rejectReservation,
  cancelReservation
};
