import React, { useState, useEffect } from "react";
import { FaUserCog, FaCheckCircle } from "react-icons/fa";
import { ClipLoader } from "react-spinners";

function PermissionsModal({ show, onClose, onUpdate, admin, permissionsList }) {
  const [permissionsData, setPermissionsData] = useState({
    dashboard: true,
    manageBooks: false,
    bookReservations: false,
    manageRegistrations: false,
    bookTransactions: false,
    managePenalties: false,
    activityLogs: false,
    settings: false,
    manageAdministrators: false
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (admin && admin.permissions) {
      setPermissionsData({ ...admin.permissions });
    }
  }, [admin]);

  const toggleAllPermissions = (value) => {
    const updatedPermissions = {};
    Object.keys(permissionsData).forEach(key => {
      updatedPermissions[key] = value;
    });
    setPermissionsData(updatedPermissions);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onUpdate(permissionsData);
    } finally {
      setLoading(false);
    }
  };

  if (!show || !admin) return null;

  return (
    <div
      className="modal show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(3px)",
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header bg-info text-white">
            <h5 className="modal-title">
              <FaUserCog className="me-2" />
              Manage Permissions - {admin.firstName} {admin.lastName}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <p className="mb-0 text-muted">
                Select which features this administrator can access
              </p>
              <div className="btn-group btn-group-sm">
                <button
                  className="btn btn-outline-success"
                  onClick={() => toggleAllPermissions(true)}
                  disabled={loading}
                >
                  Select All
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => toggleAllPermissions(false)}
                  disabled={loading}
                >
                  Deselect All
                </button>
              </div>
            </div>
            
            <div className="row g-3">
              {permissionsList.map((permission) => (
                <div key={permission.key} className="col-md-6">
                  <div className="card h-100 border">
                    <div className="card-body">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`perm-${permission.key}`}
                          checked={permissionsData[permission.key]}
                          onChange={(e) =>
                            setPermissionsData({
                              ...permissionsData,
                              [permission.key]: e.target.checked,
                            })
                          }
                          disabled={loading}
                        />
                        <label
                          className="form-check-label fw-semibold"
                          htmlFor={`perm-${permission.key}`}
                        >
                          <span className="me-2">{permission.icon}</span>
                          {permission.label}
                        </label>
                      </div>
                      <small className="text-muted d-block mt-1">
                        {permission.description}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-info d-flex align-items-center gap-2"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ClipLoader color="#ffffff" size={16} />
                  Updating...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Update Permissions
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PermissionsModal;
