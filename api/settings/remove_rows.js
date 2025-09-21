import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Remove the last row from a shelf by reducing the total row count.
 * @param {number} shelfId - The ID of the shelf.
 * @param {number} newRowCount - The new total number of rows.
 * @returns {Promise<Object>} - The response from the server.
 */
export const removeRows = async (shelfId, newRowCount) => {
  try {
    const response = await axios.post(`${API_URL}/api/settings/shelf/${shelfId}/remove-row`, {
      new_row_count: newRowCount,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to remove row: ${response.status} ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error removing rows:', error);
    throw error;
  }
};
