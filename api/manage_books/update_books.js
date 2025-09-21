import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Update book details by batch registration key.
 * Only updates the provided fields.
 * @param {string} batchRegistrationKey - The batch registration key of the books to update.
 * @param {Object} updatedFields - The fields to update.
 * @returns {Promise<Object>} - The response from the server.
 */
export const updateBooks = async (batchRegistrationKey, updatedFields) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/books/${batchRegistrationKey}`,
      updatedFields
    );

    if (!response.status === 200) {
      throw new Error(`Failed to update books: ${response.status} ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error updating books:', error);
    throw error;
  }
};