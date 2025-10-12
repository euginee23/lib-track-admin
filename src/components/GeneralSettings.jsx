import React, { useState, useEffect } from 'react';
import { FaClock, FaDollarSign, FaGraduationCap, FaChalkboardTeacher, FaUsers, FaPlus, FaTrash } from "react-icons/fa";
import ToastNotification from "./ToastNotification";

function GeneralSettings({
  borrowingLimits,
  handleLimitChange,
  fineStructure,
  handleFineChange,
  programs,
  newProgram,
  setNewProgram,
  addProgram,
  removeProgram,
  kioskSettings,
  setKioskSettings,
  onSaveSettings,
  isSaving
}) {
  const [isModified, setIsModified] = useState(false);
  const [initialSettings, setInitialSettings] = useState(null);

  // Store initial settings when component mounts
  useEffect(() => {
    if (!initialSettings) {
      setInitialSettings({
        borrowingLimits: JSON.parse(JSON.stringify(borrowingLimits)),
        fineStructure: JSON.parse(JSON.stringify(fineStructure)),
        kioskSettings: JSON.parse(JSON.stringify(kioskSettings))
      });
    }
  }, [borrowingLimits, fineStructure, kioskSettings, initialSettings]);

  // Check if settings have been modified
  useEffect(() => {
    if (initialSettings) {
      const hasChanges = 
        JSON.stringify(borrowingLimits) !== JSON.stringify(initialSettings.borrowingLimits) ||
        JSON.stringify(fineStructure) !== JSON.stringify(initialSettings.fineStructure) ||
        JSON.stringify(kioskSettings) !== JSON.stringify(initialSettings.kioskSettings);
      
      setIsModified(hasChanges);
    }
  }, [borrowingLimits, fineStructure, kioskSettings, initialSettings]);

  const handleSave = async () => {
    try {
      await onSaveSettings();
      ToastNotification.success("Settings saved successfully!");
    } catch (error) {
      ToastNotification.error("Failed to save settings. Please try again.");
    }
  };

  return (
    <div className="row g-4">
      {/* Borrowing Policies Section */}
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white d-flex align-items-center">
            <FaClock className="me-2" />
            <h5 className="mb-0 fw-bold">Borrowing Policies</h5>
          </div>
          <div className="card-body">
            <div className="row g-4">
              {Object.entries(borrowingLimits).filter(([role]) => role !== "staff").map(([role, limits]) => (
                <div key={role} className="col-md-6">
                  <div className="card h-100 border">
                    <div className="card-header bg-light d-flex align-items-center">
                      {role === "student" && <FaGraduationCap className="me-2 text-primary" />}
                      {role === "faculty" && <FaChalkboardTeacher className="me-2 text-primary" />}
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
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fine Structure Section */}
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-header bg-success text-white d-flex align-items-center">
            <FaDollarSign className="me-2" />
            <h5 className="mb-0 fw-bold">Fine Structure</h5>
          </div>
          <div className="card-body">
            <div className="row g-4">
              {Object.entries(fineStructure).filter(([role]) => role !== "staff").map(([role, fines]) => (
                <div key={role} className="col-md-6">
                  <div className="card h-100 border">
                    <div className="card-header bg-light d-flex align-items-center">
                      {role === "student" && <FaGraduationCap className="me-2 text-success" />}
                      {role === "faculty" && <FaChalkboardTeacher className="me-2 text-success" />}
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Programs/Courses Section */}
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-header bg-info text-white d-flex align-items-center">
            <FaGraduationCap className="me-2" />
            <h5 className="mb-0 fw-bold">Programs/Courses</h5>
          </div>
          <div className="card-body">
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
                <button className="btn btn-info w-100 text-white" onClick={addProgram}>
                  <FaPlus className="me-2" />
                  Add Program
                </button>
              </div>
            </div>
            <div className="border rounded p-3">
              <h6 className="fw-bold mb-3">Available Programs/Courses</h6>
              {programs.length === 0 ? (
                <p className="text-muted text-center">No programs added yet.</p>
              ) : (
                <div className="row g-2">
                  {programs.map((program, index) => (
                    <div key={index} className="col-md-6 col-lg-4">
                      <div className="d-flex align-items-center justify-content-between p-2 border rounded bg-light">
                        <span>{program.department_name || program}</span>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeProgram(program.department_name || program)}
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
      </div>

      {/* Kiosk Settings Section */}
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-header bg-warning text-white d-flex align-items-center">
            <FaUsers className="me-2" />
            <h5 className="mb-0 fw-bold">Kiosk Settings</h5>
          </div>
          <div className="card-body">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="lowQuantityRestriction"
                checked={kioskSettings.preventLowQuantityBorrowing}
                onChange={(e) => setKioskSettings(prev => ({
                  ...prev,
                  preventLowQuantityBorrowing: e.target.checked
                }))}
              />
              <label className="form-check-label" htmlFor="lowQuantityRestriction">
                Prevent borrowing if quantity is low (3 books or less)
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button Section */}
      <div className="col-12">
        <div className="text-end">
          <button
            className="btn btn-success btn-lg px-5"
            onClick={handleSave}
            disabled={isSaving || !isModified}
          >
            {isSaving ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Saving...
              </>
            ) : (
              <>
                <FaClock className="me-2" />
                Save All Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GeneralSettings;