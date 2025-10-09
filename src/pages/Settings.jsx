import React, { useState } from 'react';
import { FaUserShield, FaClock, FaDollarSign, FaBook, FaGraduationCap, FaChalkboardTeacher, FaUsers, FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import ManageShelfLocation from "../components/ManageShelfLocation";

function Settings() {
  const [activeTab, setActiveTab] = useState("roles");
  const [programs, setPrograms] = useState([
    "Computer Science",
    "Information Technology", 
    "Business Administration",
    "Education",
    "Engineering"
  ]);
  const [newProgram, setNewProgram] = useState("");

  // Role-based permissions state
  const [rolePermissions, setRolePermissions] = useState({
    student: {
      canBorrowBooks: true,
      canRenewBooks: true,
      canReserveBooks: false,
      canAccessDigitalResources: true,
      canViewCatalog: true,
      canRequestBooks: false
    },
    faculty: {
      canBorrowBooks: true,
      canRenewBooks: true,  
      canReserveBooks: true,
      canAccessDigitalResources: true,
      canViewCatalog: true,
      canRequestBooks: true
    },
    staff: {
      canBorrowBooks: true,
      canRenewBooks: true,
      canReserveBooks: true,
      canAccessDigitalResources: true,
      canViewCatalog: true,
      canRequestBooks: false
    }
  });

  // Borrowing limits state
  const [borrowingLimits, setBorrowingLimits] = useState({
    student: { maxBooks: 3, borrowPeriod: 3 },
    faculty: { maxBooks: 10, borrowPeriod: 90 },
    staff: { maxBooks: 5, borrowPeriod: 14 }
  });

  // Fine structure state
  const [fineStructure, setFineStructure] = useState({
    student: { dailyFine: 5.00, maxFine: 500.00 },
    faculty: { dailyFine: 10.00, maxFine: 1000.00 },
    staff: { dailyFine: 7.50, maxFine: 750.00 }
  });

  const handlePermissionChange = (role, permission) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: !prev[role][permission]
      }
    }));
  };

  const handleLimitChange = (role, field, value) => {
    setBorrowingLimits(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: parseInt(value) || 0
      }
    }));
  };

  const handleFineChange = (role, field, value) => {
    setFineStructure(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  const addProgram = () => {
    if (newProgram.trim() && !programs.includes(newProgram.trim())) {
      setPrograms([...programs, newProgram.trim()]);
      setNewProgram("");
    }
  };

  const removeProgram = (program) => {
    setPrograms(programs.filter(p => p !== program));
  };

  return (
    <div className="container py-4">
      {/* Tab Navigation */}
      <div className="card shadow-sm mb-4">
        <div className="card-header p-0">
          <div className="d-flex">
            <button
              className={`btn ${activeTab === "roles" ? "btn-primary" : "btn-outline-secondary"} flex-grow-1`}
              onClick={() => setActiveTab("roles")}
              style={{ 
                borderRadius: 0,
                borderTopLeftRadius: "0.375rem"
              }}
            >
              <FaUserShield className="me-2" />
              Role Permissions
            </button>
            <button
              className={`btn ${activeTab === "borrowing" ? "btn-primary" : "btn-outline-secondary"} flex-grow-1`}
              onClick={() => setActiveTab("borrowing")}
              style={{ borderRadius: 0 }}
            >
              <FaClock className="me-2" />
              Borrowing Policies
            </button>
            <button
              className={`btn ${activeTab === "fines" ? "btn-primary" : "btn-outline-secondary"} flex-grow-1`}
              onClick={() => setActiveTab("fines")}
              style={{ borderRadius: 0 }}
            >
              <FaDollarSign className="me-2" />
              Fine Structure
            </button>
            <button
              className={`btn ${activeTab === "programs" ? "btn-primary" : "btn-outline-secondary"} flex-grow-1`}
              onClick={() => setActiveTab("programs")}
              style={{ 
                borderRadius: 0,
                borderTopRightRadius: "0.375rem"
              }}
            >
              <FaGraduationCap className="me-2" />
              Programs/Courses
            </button>
          </div>
        </div>
        <div className="card-body">
          {/* Role Permissions Tab */}
          {activeTab === "roles" && (
            <div className="row g-4">
              {Object.entries(rolePermissions).map(([role, permissions]) => (
                <div key={role} className="col-lg-4">
                  <div className="card h-100">
                    <div className="card-header d-flex align-items-center">
                      {role === "student" && <FaGraduationCap className="me-2 text-primary" />}
                      {role === "faculty" && <FaChalkboardTeacher className="me-2 text-success" />}
                      {role === "staff" && <FaUsers className="me-2 text-warning" />}
                      <h6 className="mb-0 text-capitalize fw-bold">{role} Permissions</h6>
                    </div>
                    <div className="card-body">
                      {Object.entries(permissions).map(([permission, enabled]) => (
                        <div key={permission} className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={enabled}
                            onChange={() => handlePermissionChange(role, permission)}
                            id={`${role}-${permission}`}
                          />
                          <label className="form-check-label" htmlFor={`${role}-${permission}`}>
                            {permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Borrowing Policies Tab */}
          {activeTab === "borrowing" && (
            <div className="row g-4">
              {Object.entries(borrowingLimits).map(([role, limits]) => (
                <div key={role} className="col-lg-4">
                  <div className="card h-100">
                    <div className="card-header d-flex align-items-center">
                      {role === "student" && <FaGraduationCap className="me-2 text-primary" />}
                      {role === "faculty" && <FaChalkboardTeacher className="me-2 text-success" />}
                      {role === "staff" && <FaUsers className="me-2 text-warning" />}
                      <h6 className="mb-0 text-capitalize fw-bold">{role} Limits</h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Maximum Books</label>
                        <input
                          type="number"
                          className="form-control"
                          value={limits.maxBooks}
                          onChange={(e) => handleLimitChange(role, 'maxBooks', e.target.value)}
                          min="1"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          Borrow Period ({role === 'faculty' ? 'days (semester = 90)' : 'days'})
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={limits.borrowPeriod}
                          onChange={(e) => handleLimitChange(role, 'borrowPeriod', e.target.value)}
                          min="1"
                        />
                        <small className="text-muted">
                          {role === 'faculty' && 'Faculty can borrow for a semester (90 days)'}
                          {role === 'student' && 'Students can borrow for 3 days by default'}
                          {role === 'staff' && 'Staff borrowing period in days'}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fine Structure Tab */}
          {activeTab === "fines" && (
            <div className="row g-4">
              {Object.entries(fineStructure).map(([role, fines]) => (
                <div key={role} className="col-lg-4">
                  <div className="card h-100">
                    <div className="card-header d-flex align-items-center">
                      {role === "student" && <FaGraduationCap className="me-2 text-primary" />}
                      {role === "faculty" && <FaChalkboardTeacher className="me-2 text-success" />}
                      {role === "staff" && <FaUsers className="me-2 text-warning" />}
                      <h6 className="mb-0 text-capitalize fw-bold">{role} Fines</h6>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Daily Fine (₱)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={fines.dailyFine}
                          onChange={(e) => handleFineChange(role, 'dailyFine', e.target.value)}
                          min="0"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Maximum Fine (₱)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={fines.maxFine}
                          onChange={(e) => handleFineChange(role, 'maxFine', e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Programs/Courses Tab */}
          {activeTab === "programs" && (
            <div>
              <div className="row mb-4">
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter new program/course name"
                    value={newProgram}
                    onChange={(e) => setNewProgram(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addProgram()}
                  />
                </div>
                <div className="col-md-4">
                  <button className="btn btn-primary w-100" onClick={addProgram}>
                    <FaPlus className="me-2" />
                    Add Program
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0 fw-bold">Available Programs/Courses</h6>
                </div>
                <div className="card-body">
                  {programs.length === 0 ? (
                    <p className="text-muted text-center">No programs added yet.</p>
                  ) : (
                    <div className="row g-2">
                      {programs.map((program, index) => (
                        <div key={index} className="col-md-6 col-lg-4">
                          <div className="d-flex align-items-center justify-content-between p-2 border rounded">
                            <span>{program}</span>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removeProgram(program)}
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manage Shelves Section */}
      <div className="card shadow-sm">
        <div className="card-header">
          <h6 className="mb-0 fw-bold">Manage Shelves</h6>
        </div>
        <div className="card-body">
          <ManageShelfLocation />
        </div>
      </div>
    </div>
  );
}

export default Settings;