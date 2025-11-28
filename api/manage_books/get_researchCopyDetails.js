import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export const getResearchCopyDetails = async (researchPaperId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/research-papers/copy/${researchPaperId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching research copy details:", error);
    throw error;
  }
};
