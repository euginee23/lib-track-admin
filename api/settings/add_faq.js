import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const addFaq = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/api/faqs`, payload);
    if (![200,201].includes(response.status)) throw new Error('Failed to create FAQ');
    return response.data.data;
  } catch (err) {
    console.error('addFaq error:', err);
    throw err;
  }
};
