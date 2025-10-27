const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Delete multiple registrations
 * @param {Array} userIds - Array of user IDs to delete
 * @returns {Promise} API response
 */
export const deleteRegistrations = async (userIds) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete registrations');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting registrations:', error);
    throw error;
  }
};

/**
 * Delete a single registration
 * @param {number} userId - User ID to delete
 * @returns {Promise} API response
 */
export const deleteRegistration = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/delete/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete registration');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting registration:', error);
    throw error;
  }
};