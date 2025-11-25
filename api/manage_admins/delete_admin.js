import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const deleteAdmin = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/api/admins/${id}`);
    if (response.data && response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || 'Failed to delete admin');
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error.response?.data?.message || error.message || 'Network error';
  }
};
