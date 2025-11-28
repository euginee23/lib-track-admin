import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const getBookCopyDetails = async (bookId, bookNumber) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/books/copy/${bookId}/${bookNumber}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch book copy details" };
  }
};
