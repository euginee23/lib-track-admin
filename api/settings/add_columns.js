import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Add a single column to a shelf by creating locations for all existing rows.
 * @param {number} shelfId - The ID of the shelf.
 * @param {number} newColumnCount - The new total number of columns.
 * @returns {Promise<Object>} - The response from the server.
 */
export const addColumns = async (shelfId, newColumnCount) => {
  try {
    const response = await axios.post(`${API_URL}/api/settings/shelf/${shelfId}/add-column`, {
      new_column_count: newColumnCount,
    });

    if (response.status !== 201) {
      throw new Error(`Failed to add column: ${response.status} ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error adding columns:', error);
    throw error;
  }
};
