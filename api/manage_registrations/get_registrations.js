import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch registration details with pagination support.
 * @param {number} page - The page number (1-based)
 * @param {number} limit - The number of items per page
 * @returns {Promise<Object>} - The registrations and pagination info
 */
export const getRegistrations = async (page = 1, limit = 20) => {
  try {
    const response = await axios.get(`${API_URL}/api/users/registrations`, {
      params: { page, limit }
    });

    // Ensure the response structure is valid
    if (!response.data || !response.data.users) {
      console.error('Invalid API response structure:', response);
      return { data: [], pagination: { total: 0, page: 1, limit, totalPages: 1 } };
    }

    const registrations = response.data.users;
    const pagination = response.data.pagination || { 
      total: registrations.length, 
      page: 1, 
      limit: registrations.length,
      totalPages: 1
    };

    const formattedRegistrations = registrations.map((registration) => {
      return {
        ...registration,
        fullName: `${registration.firstName} ${registration.lastName}`,
        formattedDate: new Date(registration.submittedAt).toLocaleDateString(),
      };
    });

    return formattedRegistrations;
  } catch (error) {
    console.error('Error fetching registration details:', error);
    throw error;
  }
};