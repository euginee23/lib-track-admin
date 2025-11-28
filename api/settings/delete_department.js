import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const deleteDepartment = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/api/settings/departments/${id}`);

    if (response.status === 200 && response.data.success) {
      return true;
    }

    throw new Error(response.data.message || 'Failed to delete department');
  } catch (err) {
    console.error('Error deleting department:', err);
    throw err.response?.data?.message || err.message || 'Network error';
  }
};
