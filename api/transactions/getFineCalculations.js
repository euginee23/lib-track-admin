import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL + "/api/fines";

export const getUserFines = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch user fines");
    }
  } catch (error) {
    console.error("Error fetching user fines:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};

export const getTransactionFine = async (transactionId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/transaction/${transactionId}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch transaction fine");
    }
  } catch (error) {
    console.error("Error fetching transaction fine:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};

export const getOverdueFines = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/overdue`, { params });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch overdue fines");
    }
  } catch (error) {
    console.error("Error fetching overdue fines:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};

export const updateFineSettings = async (settings) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/settings`, settings);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to update fine settings");
    }
  } catch (error) {
    console.error("Error updating fine settings:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};
