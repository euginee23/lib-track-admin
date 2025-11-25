import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const adminLogin = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/admin/login`, {
      email,
      password
    });

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error(error.message || 'An error occurred during login');
    }
  }
};
