import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL + "/api/settings";;

export const updateSystemSettings = async (settingsData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/system-settings`, settingsData);
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to update system settings");
    }
  } catch (error) {
    console.error("Error updating system settings:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};

export const updateIndividualSetting = async (settingName, settingValue) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/system-setting/${settingName}`, {
      settingValue
    });
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to update setting");
    }
  } catch (error) {
    console.error("Error updating individual setting:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};
