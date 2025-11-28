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
      const errorMessage = response.data.message || 'Login failed';
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Login API error:', error);
    
    if (error.response) {
      // Server responded with an error status
      const errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An error occurred during login');
    }
  }
};
