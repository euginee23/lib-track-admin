import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const getResearchCopyDetails = async (researchPaperId) => {
  try {
    const response = await axios.get(`${API_URL}/api/research-papers/copy/${researchPaperId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching research copy details:", error);
    throw error;
  }
};
