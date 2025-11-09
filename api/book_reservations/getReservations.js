import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Admin reservations API helpers
 * Mirrors the user-facing reservation getters but tailored for admin use.
 */

/**
 * Fetch all reservations with optional filters
 * @param {Object} filters - Optional filters (user_id, status)
 * @returns {Promise<Object>} API response
 */
export const fetchAllReservations = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `${API_BASE_URL}/api/reservations?${queryString}` : `${API_BASE_URL}/api/reservations`;

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Admin: Error fetching all reservations:', error);
    throw new Error(`Failed to fetch reservations: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Get a single reservation by ID
 * @param {string|number} reservationId
 * @returns {Promise<Object>} API response
 */
export const getReservationById = async (reservationId) => {
  try {
    if (!reservationId) throw new Error('Reservation ID is required');
    const response = await axios.get(`${API_BASE_URL}/api/reservations/${reservationId}`);
    return response.data;
  } catch (error) {
    console.error(`Admin: Error fetching reservation ${reservationId}:`, error);
    throw new Error(`Failed to fetch reservation: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Convenience helpers for common admin queries
 */
export const getReservationsByStatus = async (status) => {
  try {
    const resp = await fetchAllReservations({ status });
    return resp.data || [];
  } catch (err) {
    console.error('Admin: Error getting reservations by status:', err);
    throw err;
  }
};

export const getAllPendingReservations = async () => getReservationsByStatus('Pending');
export const getAllApprovedReservations = async () => getReservationsByStatus('Approved');
export const getAllRejectedReservations = async () => getReservationsByStatus('Rejected');

export default {
  fetchAllReservations,
  getReservationById,
  getReservationsByStatus,
  getAllPendingReservations,
  getAllApprovedReservations,
  getAllRejectedReservations
};
