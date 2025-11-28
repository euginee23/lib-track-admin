import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const adminLogin = async (email, password) => {
  try {
    console.log('Making login request to:', `${API_URL}/api/admin/login`);
    const response = await axios.post(`${API_URL}/api/admin/login`, {
      email,
      password
    });

    console.log('Login API response:', response);

    if (response.data.success) {
      return response.data;
    } else {
      const errorMessage = response.data.message || 'Login failed';
      console.error('Login failed with message:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Login API error:', error);
    
    if (error.response) {
      // Server responded with an error status
      const errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      console.error('Server error response:', error.response.data);
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error - no response:', error.request);
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      console.error('Unexpected error:', error.message);
      throw new Error(error.message || 'An error occurred during login');
    }
  }
};
