import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL + "/api/transactions";

export const getAllTransactions = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/`, { params });
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch transactions");
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};

export const getTransactionHistory = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/history`, { params });
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch transaction history");
    }
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};

export const getNotifications = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications`, { params });
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch notifications");
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};

export const getTransactionById = async (transactionId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${transactionId}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch transaction details");
    }
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};
