import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch all departments from the database.
 * @returns {Promise<Array>} - The list of departments.
 */
export const getDepartments = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/settings/departments`);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch departments: ${response.status} ${response.statusText}`);
    }

    return response.data.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};
