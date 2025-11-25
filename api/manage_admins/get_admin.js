import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getAdmins = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admins`);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch admins');
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error.response?.data?.message || error.message || 'Network error';
  }
};

export const getAdmin = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/admins/${id}`);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch admin');
  } catch (error) {
    console.error('Error fetching admin:', error);
    throw error.response?.data?.message || error.message || 'Network error';
  }
};
