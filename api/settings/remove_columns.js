import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Remove the last column from a shelf by reducing the total column count.
 * @param {number} shelfId - The ID of the shelf.
 * @param {number} newColumnCount - The new total number of columns.
 * @returns {Promise<Object>} - The response from the server.
 */
export const removeColumns = async (shelfId, newColumnCount) => {
  try {
    const response = await axios.post(`${API_URL}/api/settings/shelf/${shelfId}/remove-column`, {
      new_column_count: newColumnCount,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to remove column: ${response.status} ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error removing columns:', error);
    throw error;
  }
};
