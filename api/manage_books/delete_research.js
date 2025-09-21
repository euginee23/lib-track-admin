import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Delete a research paper by its ID.
 * @param {string|number} researchPaperId - The ID of the research paper to delete.
 * @returns {Promise<Object>} - The response from the server.
 */
export const deleteResearch = async (researchPaperId) => {
  try {
    const response = await axios.delete(`${API_URL}/api/research-papers/${researchPaperId}`);

    if (response.status !== 200) {
      throw new Error(`Failed to delete research paper: ${response.status} ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error deleting research paper:', error);

    if (error.response) {
      throw new Error(error.response.data.message || `Server error: ${error.response.status}`);
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};