import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Update a single rule.
 * @param {number} ruleId - The ID of the rule to update.
 * @param {Object} data - Object containing title, content, and optionally heading.
 * @returns {Promise<Object>} - The response from the server.
 */
export const updateRule = async (ruleId, data) => {
  try {
    const response = await axios.put(`${API_URL}/api/rules/${ruleId}`, data);

    if (response.status !== 200) {
      throw new Error(`Failed to update rule: ${response.status} ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error updating rule:', error);
    throw error;
  }
};

/**
 * Reorder a rule (move up or down).
 * @param {number} ruleId - The ID of the rule to reorder.
 * @param {string} direction - Direction to move: "up" or "down".
 * @returns {Promise<Object>} - The response from the server.
 */
export const reorderRule = async (ruleId, direction) => {
  try {
    const response = await axios.put(`${API_URL}/api/rules/${ruleId}/reorder`, {
      direction,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to reorder rule: ${response.status} ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error reordering rule:', error);
    throw error;
  }
};
