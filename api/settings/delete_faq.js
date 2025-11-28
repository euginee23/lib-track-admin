import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const deleteFaq = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/api/faqs/${id}`);
    if (response.status !== 200) throw new Error('Failed to delete FAQ');
    return response.data;
  } catch (err) {
    console.error('deleteFaq error:', err);
    throw err;
  }
};
