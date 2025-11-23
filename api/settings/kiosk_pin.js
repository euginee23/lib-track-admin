import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL + "/api/settings";

// Get kiosk PIN status
export const getKioskPin = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/kiosk-pin`);
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch kiosk PIN");
    }
  } catch (error) {
    console.error("Error fetching kiosk PIN:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};

// Create or update kiosk PIN
export const saveKioskPin = async (pin, currentPin = null) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/kiosk-pin`, {
      pin,
      currentPin
    });
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to save kiosk PIN");
    }
  } catch (error) {
    console.error("Error saving kiosk PIN:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};

// Delete kiosk PIN
export const deleteKioskPin = async (currentPin) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/kiosk-pin`, {
      data: { currentPin }
    });
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to delete kiosk PIN");
    }
  } catch (error) {
    console.error("Error deleting kiosk PIN:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};

// Verify kiosk PIN
export const verifyKioskPin = async (pin) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/kiosk-pin/verify`, {
      pin
    });
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to verify kiosk PIN");
    }
  } catch (error) {
    console.error("Error verifying kiosk PIN:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};
