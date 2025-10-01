import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch registration details by user ID.
 * @param {string} userId - The ID of the user to fetch.
 * @returns {Promise<Object>}
 */
export const getRegistrationDetails = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/api/users/registrations/${userId}`);

    if (!response.data || !response.data.user) {
      console.error('Invalid API response structure:', response);
      return null;
    }

    const user = response.data.user;

    return {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      formattedDate: new Date(user.submittedAt).toLocaleDateString(),
    };
  } catch (error) {
    console.error('Error fetching registration details by ID:', error);
    throw error;
  }
};