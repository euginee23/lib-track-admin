import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch research QR codes by their IDs.
 * @param {Array<string>} researchIds
 * @returns {Promise<Array>}
 */
export const getResearchQR = async (researchIds) => {
  try {
    const response = await axios.get(`${API_URL}/api/research-papers`, {
      params: { ids: researchIds.join(',') },
    });

    const researchPapers = response.data.data;

    const formattedResearchPapers = researchPapers.map((paper) => ({
      id: paper.research_paper_id,
      title: paper.research_title,
      year: paper.year_publication,
      authors: paper.authors,
      department: paper.department_name,
      shelfLocation: `${paper.shelf_column}-${paper.shelf_row}`,
      qrCode: paper.research_paper_qr,
    }));

    return formattedResearchPapers;
  } catch (error) {
    console.error('Error fetching research QR codes:', error);
    throw error;
  }
};