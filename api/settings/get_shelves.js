import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch all shelves from the database.
 * @returns {Promise<Array>} - The list of shelves.
 */
export const getShelves = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/settings/shelves`);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch shelves: ${response.status} ${response.statusText}`);
    }

    return response.data.data;
  } catch (error) {
    console.error('Error fetching shelves:', error);
    throw error;
  }
};