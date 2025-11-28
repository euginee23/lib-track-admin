import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch FAQs from server
 * @param {Object} params - optional query params { q, active }
 */
export const getFaqs = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/faqs`, { params });
    if (response.status !== 200) throw new Error('Failed to fetch FAQs');
    return response.data.data;
  } catch (err) {
    console.error('getFaqs error:', err);
    throw err;
  }
};

export const getFaq = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/faqs/${id}`);
    if (response.status !== 200) throw new Error('Failed to fetch FAQ');
    return response.data.data;
  } catch (err) {
    console.error('getFaq error:', err);
    throw err;
  }
};
