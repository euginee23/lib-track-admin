import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch distinct positions from all users
 * @returns {Promise<Array>} - Array of position objects with counts
 */
export const getPositions = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/users/registrations/positions`);
    
    if (!response.data || !response.data.positions) {
      console.error('Invalid API response structure:', response);
      return [];
    }

    return response.data.positions;
  } catch (error) {
    console.error('Error fetching positions:', error);
    throw error.response?.data?.message || error.message || 'Failed to fetch positions';
  }
};
