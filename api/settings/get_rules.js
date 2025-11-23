import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch all rules grouped by headers from the database.
 * @returns {Promise<Array>} - The list of rules grouped by headers.
 */
export const getRules = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/rules`);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch rules: ${response.status} ${response.statusText}`);
    }

    return response.data.data;
  } catch (error) {
    console.error('Error fetching rules:', error);
    throw error;
  }
};
