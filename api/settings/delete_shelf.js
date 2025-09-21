import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Delete a shelf from the database.
 * @param {number} shelfNumber - The shelf number to delete (all locations with this shelf number).
 * @returns {Promise<Object>} - The response from the server.
 */
export const deleteShelf = async (shelfNumber) => {
  try {
    const response = await axios.delete(`${API_URL}/api/settings/delete-shelf/${shelfNumber}`);

    if (response.status !== 200) {
      throw new Error(`Failed to delete shelf: ${response.status} ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error deleting shelf:', error);
    throw error;
  }
};