import { getRegistrations } from './get_registrations';

/**
 * Generate and download CSV report for registrations using current filters.
 * @param {Object} options - { search, filter, filterStatus }
 */
export const generateRegistrationsCSV = async ({ search = '', filter = '', filterStatus = '' } = {}) => {
  try {
    // Request a very large limit to get all matching records (backend supports pagination)
    const { users } = await getRegistrations(1, 1000000, search, filter, filterStatus);

    if (!users || users.length === 0) {
      throw new Error('No registrations found for the current filters');
    }

    // CSV headers
    const headers = [
      'User ID',
      'First Name',
      'Middle Name',
      'Last Name',
      'Email',
      'Student ID',
      'Faculty ID',
      'Department',
      'Position',
      'Librarian Approval',
      'Semester Verified',
      'Semester Verified At',
      'Created At'
    ];

    const rows = users.map((u) => [
      u.user_id,
      u.first_name,
      u.middle_name || '',
      u.last_name,
      u.email,
      u.student_id || '',
      u.faculty_id || '',
      u.department_name || '',
      u.position || '',
      u.librarian_approval === 1 ? 'Approved' : 'Pending',
      u.semester_verified === 1 ? 'Verified' : 'Not Verified',
      u.semester_verified_at ? new Date(u.semester_verified_at).toLocaleString() : '',
      u.created_at ? new Date(u.created_at).toLocaleString() : ''
    ]);

    // Build CSV string
    const escapeCell = (cell) => {
      if (cell === null || cell === undefined) return '';
      const str = String(cell);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [headers.join(','), ...rows.map(r => r.map(escapeCell).join(','))].join('\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
    link.setAttribute('href', url);
    link.setAttribute('download', `registrations-report-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, count: users.length };
  } catch (error) {
    console.error('Error generating registrations report:', error);
    throw error;
  }
};
