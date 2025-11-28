import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getDashboardAnalytics = async (period = 'all') => {
  try {
    const response = await axios.get(`${API_URL}/api/dashboard/analytics`, {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    throw error;
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/dashboard/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};
