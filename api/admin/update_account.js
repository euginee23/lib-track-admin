import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const updateAccount = async (accountData) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/admin/account`,
      accountData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update account" };
  }
};
