import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Delete a single rule by ID.
 * @param {number} ruleId - The ID of the rule to delete.
 * @returns {Promise<Object>} - The response from the server.
 */
export const deleteRule = async (ruleId) => {
  try {
    const response = await axios.delete(`${API_URL}/api/rules/${ruleId}`);

    if (response.status !== 200) {
      throw new Error(`Failed to delete rule: ${response.status} ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error deleting rule:', error);
    throw error;
  }
};

/**
 * Delete a header and all its associated rules.
 * @param {number} headerId - The ID of the header to delete.
 * @returns {Promise<Object>} - The response from the server.
 */
export const deleteHeader = async (headerId) => {
  try {
    const response = await axios.delete(`${API_URL}/api/rules/header/${headerId}`);

    if (response.status !== 200) {
      throw new Error(`Failed to delete header: ${response.status} ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error deleting header:', error);
    throw error;
  }
};
