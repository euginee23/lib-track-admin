import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const createAdmin = async (adminData) => {
  try {
    const response = await axios.post(`${API_URL}/api/admins`, adminData);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create admin');
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error.response?.data?.message || error.message || 'Network error';
  }
};
