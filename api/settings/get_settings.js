import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL + "/api/settings";;

export const getSystemSettings = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/system-settings`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch system settings");
    }
  } catch (error) {
    console.error("Error fetching system settings:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};
