import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Add a new shelf to the database.
 * @param {Object} shelf - The shelf details.
 * @param {number} shelf.shelf_number - The shelf number.
 * @param {string} shelf.shelf_column - The column of the shelf.
 * @param {number} shelf.shelf_row - The row of the shelf.
 * @returns {Promise<Object>} - The response from the server.
 */
export const addShelf = async (shelf) => {
  try {
    const response = await axios.post(`${API_URL}/api/settings/add-shelf`, shelf);

    if (!response.status === 201) {
      throw new Error(`Failed to add shelf: ${response.status} ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error adding shelf:', error);
    throw error;
  }
};