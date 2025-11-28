import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaEdit, FaTrash, FaCheck, FaCalendar, FaUsers, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { getSemesters, getSemesterStats } from "../../api/semesters/get_semesters";
import { createSemester, updateSemester, activateSemester, deleteSemester, resetSemesterVerification } from "../../api/semesters/manage_semesters";
import ToastNotification from "../components/ToastNotification";

function SemesterManagementModal({ show, onClose }) {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [stats, setStats] = useState({});

  const [formData, setFormData] = useState({
    semester_name: "",
    school_year: "",
    start_date: "",
    end_date: "",
    is_active: false,
  });

  useEffect(() => {
    if (show) {
      fetchSemesters();
    }
  }, [show]);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const data = await getSemesters();
      setSemesters(data);

      // Fetch stats for each semester
      const statsPromises = data.map(semester => 
        getSemesterStats(semester.semester_id)
          .then(stats => ({ [semester.semester_id]: stats }))
          .catch(() => ({ [semester.semester_id]: null }))
      );
      const statsArray = await Promise.all(statsPromises);
      const statsObj = Object.assign({}, ...statsArray);
      setStats(statsObj);
    } catch (error) {
      console.error("Error fetching semesters:", error);
      ToastNotification.error("Failed to fetch semesters");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.semester_name || !formData.school_year || !formData.start_date || !formData.end_date) {
      ToastNotification.error("Please fill all required fields");
      return;
    }

    try {
      if (editingSemester) {
        await updateSemester(editingSemester.semester_id, formData);
        ToastNotification.success("Semester updated successfully");
      } else {
        await createSemester(formData);
        ToastNotification.success("Semester created successfully");
      }
      
      resetForm();
      fetchSemesters();
    } catch (error) {
      console.error("Error saving semester:", error);
      ToastNotification.error(error.response?.data?.message || "Failed to save semester");
    }
  };

  const handleEdit = (semester) => {
    setEditingSemester(semester);
    setFormData({
      semester_name: semester.semester_name,
      school_year: semester.school_year,
      start_date: new Date(semester.start_date).toISOString().split('T')[0],
      end_date: new Date(semester.end_date).toISOString().split('T')[0],
      is_active: semester.is_active === 1,
    });
    setShowAddForm(true);
  };

  const handleActivate = async (semesterId) => {
    if (window.confirm("Activate this semester? All users will need to update their info for the new semester.")) {
      try {
        await activateSemester(semesterId);
        ToastNotification.success("Semester activated successfully");
        fetchSemesters();
      } catch (error) {
        console.error("Error activating semester:", error);
        ToastNotification.error("Failed to activate semester");
      }
    }
  };

  const handleDelete = async (semesterId) => {
    if (window.confirm("Delete this semester? This action cannot be undone.")) {
      try {
        await deleteSemester(semesterId);
        ToastNotification.success("Semester deleted successfully");
        fetchSemesters();
      } catch (error) {
        console.error("Error deleting semester:", error);
        ToastNotification.error(error.response?.data?.message || "Failed to delete semester");
      }
    }
  };

  const handleResetVerification = async (semesterId) => {
    if (window.confirm("Reset verification for all users? They will need to update their information.")) {
      try {
        await resetSemesterVerification(semesterId);
        ToastNotification.success("Verification reset successfully");
        fetchSemesters();
      } catch (error) {
        console.error("Error resetting verification:", error);
        ToastNotification.error("Failed to reset verification");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      semester_name: "",
      school_year: "",
      start_date: "",
      end_date: "",
      is_active: false,
    });
    setEditingSemester(null);
    setShowAddForm(false);
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <FaCalendar className="me-2" />
              Semester Management
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Add/Edit Form */}
            {showAddForm ? (
              <div className="card mb-3">
                <div className="card-header bg-light">
                  <h6 className="mb-0">{editingSemester ? 'Edit Semester' : 'Add New Semester'}</h6>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small">Semester Name *</label>
                        <select
                          className="form-select form-select-sm"
                          name="semester_name"
                          value={formData.semester_name}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Semester</option>
                          <option value="1st Semester">1st Semester</option>
                          <option value="2nd Semester">2nd Semester</option>
                          <option value="Summer">Summer</option>
                          <option value="Mid-Year">Mid-Year</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">School Year *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          name="school_year"
                          placeholder="e.g., 2024-2025"
                          value={formData.school_year}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">Start Date *</label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          name="start_date"
                          value={formData.start_date}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small">End Date *</label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="is_active"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label small" htmlFor="is_active">
                            Set as Active Semester
                          </label>
                        </div>
                        <small className="text-muted">Only one semester can be active at a time</small>
                      </div>
                    </div>
                    <div className="mt-3 d-flex gap-2">
                      <button type="submit" className="btn btn-sm btn-primary">
                        <FaCheck className="me-1" />
                        {editingSemester ? 'Update' : 'Create'} Semester
                      </button>
                      <button type="button" className="btn btn-sm btn-secondary" onClick={resetForm}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <button className="btn btn-sm btn-success mb-3" onClick={() => setShowAddForm(true)}>
                <FaPlus className="me-1" />
                Add New Semester
              </button>
            )}

            {/* Semesters List */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : semesters.length === 0 ? (
              <div className="text-center text-muted py-5">
                <FaCalendar size={48} className="mb-3 opacity-50" />
                <p>No semesters found. Create one to get started.</p>
              </div>
            ) : (
              <div className="row g-3">
                {semesters.map((semester) => {
                  const semesterStats = stats[semester.semester_id] || {};
                  const isActive = semester.is_active === 1;
                  const verificationRate = semesterStats.total_users > 0
                    ? Math.round((semesterStats.verified_users / semesterStats.total_users) * 100)
                    : 0;

                  return (
                    <div key={semester.semester_id} className="col-md-6">
                      <div className={`card ${isActive ? 'border-success' : ''}`}>
                        <div className={`card-header ${isActive ? 'bg-success bg-opacity-10' : 'bg-light'}`}>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-0">{semester.semester_name}</h6>
                              <small className="text-muted">{semester.school_year}</small>
                            </div>
                            {isActive && (
                              <span className="badge bg-success">
                                <FaCheck className="me-1" />
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="card-body small">
                          <div className="row mb-2">
                            <div className="col-6">
                              <FaCalendar className="me-1 text-muted" />
                              <strong>Start:</strong> {new Date(semester.start_date).toLocaleDateString()}
                            </div>
                            <div className="col-6">
                              <FaCalendar className="me-1 text-muted" />
                              <strong>End:</strong> {new Date(semester.end_date).toLocaleDateString()}
                            </div>
                          </div>

                          {semesterStats.total_users > 0 && (
                            <div className="mt-3 pt-3 border-top">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span><FaUsers className="me-1" /> Total Users:</span>
                                <strong>{semesterStats.total_users}</strong>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-success"><FaCheckCircle className="me-1" /> Verified:</span>
                                <strong>{semesterStats.verified_users}</strong>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-warning"><FaExclamationCircle className="me-1" /> Unverified:</span>
                                <strong>{semesterStats.unverified_users}</strong>
                              </div>
                              <div className="progress" style={{ height: '6px' }}>
                                <div
                                  className="progress-bar bg-success"
                                  style={{ width: `${verificationRate}%` }}
                                ></div>
                              </div>
                              <small className="text-muted">{verificationRate}% verified</small>
                            </div>
                          )}
                        </div>
                        <div className="card-footer bg-transparent">
                          <div className="d-flex gap-2 flex-wrap">
                            {!isActive && (
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handleActivate(semester.semester_id)}
                              >
                                <FaCheck className="me-1" />
                                Activate
                              </button>
                            )}
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(semester)}
                            >
                              <FaEdit className="me-1" />
                              Edit
                            </button>
                            {!isActive && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(semester.semester_id)}
                              >
                                <FaTrash className="me-1" />
                                Delete
                              </button>
                            )}
                            {isActive && semesterStats.verified_users > 0 && (
                              <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => handleResetVerification(semester.semester_id)}
                              >
                                Reset Verification
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <FaTimes className="me-1" />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SemesterManagementModal;
