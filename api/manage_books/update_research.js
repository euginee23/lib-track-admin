import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Update research paper details by research paper ID.
 * Only updates the provided fields.
 * @param {string|number} researchPaperId - The ID of the research paper to update.
 * @param {Object} updatedFields - The fields to update.
 * @returns {Promise<Object>} - The response from the server.
 */
export const updateResearch = async (researchPaperId, updatedFields) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/research-papers/${researchPaperId}`,
      updatedFields
    );

    if (response.status !== 200) {
      throw new Error(`Failed to update research paper: ${response.status} ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error updating research paper:', error);
    
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.message || `Server error: ${error.response.status}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};