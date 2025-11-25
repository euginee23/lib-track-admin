import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const updateAdmin = async (id, adminData) => {
  try {
    const response = await axios.put(`${API_URL}/api/admins/${id}`, adminData);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update admin');
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error.response?.data?.message || error.message || 'Network error';
  }
};
