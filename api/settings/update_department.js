import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const updateDepartment = async (id, { department_name, department_acronym = '' }) => {
  try {
    const response = await axios.put(`${API_URL}/api/settings/departments/${id}`, {
      department_name,
      department_acronym
    });

    if (response.status === 200 && response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to update department');
  } catch (err) {
    console.error('Error updating department:', err);
    throw err.response?.data?.message || err.message || 'Network error';
  }
};
