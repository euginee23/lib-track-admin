import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Add a single row to a shelf by creating locations for all existing columns.
 * @param {number} shelfId - The ID of the shelf.
 * @param {number} newRowCount - The new total number of rows.
 * @returns {Promise<Object>} - The response from the server.
 */
export const addRows = async (shelfId, newRowCount) => {
  try {
    const response = await axios.post(`${API_URL}/api/settings/shelf/${shelfId}/add-row`, {
      new_row_count: newRowCount,
    });

    if (response.status !== 201) {
      throw new Error(`Failed to add row: ${response.status} ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error adding rows:', error);
    throw error;
  }
};
