import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const createDepartment = async ({ department_name, department_acronym = '' }) => {
  try {
    const response = await axios.post(`${API_URL}/api/settings/departments`, {
      department_name,
      department_acronym
    });

    if (response.status === 201 && response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to create department');
  } catch (err) {
    console.error('Error creating department:', err);
    throw err.response?.data?.message || err.message || 'Network error';
  }
};
