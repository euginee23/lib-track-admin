import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Delete books by batch registration key.
 * @param {string} batchRegistrationKey - The batch registration key of the books to delete.
 * @returns {Promise<Object>} - The response from the server.
 */
export const deleteBooks = async (batchRegistrationKey) => {
  try {
    const response = await axios.delete(`${API_URL}/api/books/${batchRegistrationKey}`);

    if (response.status !== 200) {
      throw new Error(`Failed to delete books: ${response.status} ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error deleting books:', error);

    if (error.response) {
      throw new Error(error.response.data.message || `Server error: ${error.response.status}`);
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};