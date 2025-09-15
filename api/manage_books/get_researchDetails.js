import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch research details.
 * @returns {Promise<Array>}
 */
export const getResearchDetails = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/research_papers`);
    const researchPapers = response.data.data;

    const formattedResearchPapers = researchPapers.map((paper) => ({
      ...paper,
      qr_codes: [paper.research_paper_qr],
    }));

    return formattedResearchPapers;
  } catch (error) {
    console.error('Error fetching research details:', error);
    throw error;
  }
};