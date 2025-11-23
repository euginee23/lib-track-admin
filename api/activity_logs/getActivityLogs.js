import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL + "/api/activity-logs";

export const getAllActivityLogs = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/`, { params });
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch activity logs");
    }
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};

export const getActivityLogsByUser = async (userId, params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}`, { params });
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch user activity logs");
    }
  } catch (error) {
    console.error("Error fetching user activity logs:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};

export const getActivityLogById = async (activityLogId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${activityLogId}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch activity log details");
    }
  } catch (error) {
    console.error("Error fetching activity log details:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};

export const getActivityLogStats = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats/summary`, { params });
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch activity log statistics");
    }
  } catch (error) {
    console.error("Error fetching activity log statistics:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};

export const createActivityLog = async (logData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/`, logData);
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to create activity log");
    }
  } catch (error) {
    console.error("Error creating activity log:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};

export const deleteActivityLog = async (activityLogId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${activityLogId}`);
    
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Failed to delete activity log");
    }
  } catch (error) {
    console.error("Error deleting activity log:", error);
    throw error.response?.data?.message || error.message || "Network error occurred";
  }
};
