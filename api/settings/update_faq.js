import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const updateFaq = async (id, payload) => {
  try {
    const response = await axios.put(`${API_URL}/api/faqs/${id}`, payload);
    if (response.status !== 200) throw new Error('Failed to update FAQ');
    return response.data.data;
  } catch (err) {
    console.error('updateFaq error:', err);
    throw err;
  }
};
