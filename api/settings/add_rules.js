import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Add new rules under a heading (creates header if needed).
 * @param {string} heading - The heading/category name for the rules.
 * @param {Array<Object>} rules - Array of rules with title and content.
 * @returns {Promise<Object>} - The response from the server.
 */
export const addRules = async (heading, rules) => {
  try {
    const response = await axios.post(`${API_URL}/api/rules`, {
      heading,
      rules,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to add rules: ${response.status} ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error adding rules:', error);
    throw error;
  }
};
