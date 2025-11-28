import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const createSemester = async (semesterData) => {
  try {
    const response = await axios.post(`${API_URL}/api/semesters`, semesterData);
    if (response.data && response.data.success) return response.data;
    throw new Error(response.data?.message || "Failed to create semester");
  } catch (error) {
    console.error("Error creating semester:", error);
    throw error.response?.data?.message || error.message || "Network error";
  }
};

export const updateSemester = async (semesterId, semesterData) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/semesters/${semesterId}`,
      semesterData
    );
    if (response.data && response.data.success) return response.data;
    throw new Error(response.data?.message || "Failed to update semester");
  } catch (error) {
    console.error("Error updating semester:", error);
    throw error.response?.data?.message || error.message || "Network error";
  }
};

export const activateSemester = async (semesterId) => {
  try {
    const response = await axios.put(`${API_URL}/api/semesters/${semesterId}/activate`);
    if (response.data && response.data.success) return response.data;
    throw new Error(response.data?.message || "Failed to activate semester");
  } catch (error) {
    console.error("Error activating semester:", error);
    throw error.response?.data?.message || error.message || "Network error";
  }
};

export const deleteSemester = async (semesterId) => {
  try {
    const response = await axios.delete(`${API_URL}/api/semesters/${semesterId}`);
    if (response.data && response.data.success) return response.data;
    throw new Error(response.data?.message || "Failed to delete semester");
  } catch (error) {
    console.error("Error deleting semester:", error);
    throw error.response?.data?.message || error.message || "Network error";
  }
};

export const resetSemesterVerification = async (semesterId) => {
  try {
    const response = await axios.post(`${API_URL}/api/semesters/${semesterId}/reset-verification`);
    if (response.data && response.data.success) return response.data;
    throw new Error(response.data?.message || "Failed to reset semester verification");
  } catch (error) {
    console.error("Error resetting semester verification:", error);
    throw error.response?.data?.message || error.message || "Network error";
  }
};
