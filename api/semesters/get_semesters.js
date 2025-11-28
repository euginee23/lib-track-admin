import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getSemesters = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/semesters`);
    if (response.data && response.data.success) return response.data.data;
    throw new Error(response.data?.message || "Failed to fetch semesters");
  } catch (error) {
    console.error("Error fetching semesters:", error);
    throw error.response?.data?.message || error.message || "Network error";
  }
};

export const getActiveSemester = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/semesters/active`);
    if (response.data && response.data.success) return response.data.data;
    throw new Error(response.data?.message || "Failed to fetch active semester");
  } catch (error) {
    console.error("Error fetching active semester:", error);
    throw error.response?.data?.message || error.message || "Network error";
  }
};

export const getSemesterStats = async (semesterId) => {
  try {
    const response = await axios.get(`${API_URL}/api/semesters/${semesterId}/stats`);
    if (response.data && response.data.success) return response.data.data;
    throw new Error(response.data?.message || "Failed to fetch semester stats");
  } catch (error) {
    console.error("Error fetching semester stats:", error);
    throw error.response?.data?.message || error.message || "Network error";
  }
};

export const getSemesterUsers = async (semesterId, verificationStatus = "all") => {
  try {
    const response = await axios.get(
      `${API_URL}/api/semesters/${semesterId}/users`,
      { params: { verification_status: verificationStatus } }
    );
    if (response.data && response.data.success) return response.data.data;
    throw new Error(response.data?.message || "Failed to fetch semester users");
  } catch (error) {
    console.error("Error fetching semester users:", error);
    throw error.response?.data?.message || error.message || "Network error";
  }
};
