import React, { useState } from "react";
import { FaTrash, FaTimesCircle, FaLock } from "react-icons/fa";
import { ClipLoader } from "react-spinners";

function DeleteAdminModal({ show, onClose, onDelete, admin }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete();
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
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">
              <FaTrash className="me-2" />
              Confirm Deletion
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            <div className="text-center py-3">
              <FaTimesCircle className="text-danger mb-3" style={{ fontSize: "4rem" }} />
              <h5>Are you sure you want to delete this administrator?</h5>
              <p className="text-muted mb-0">
                Administrator: <strong>{admin.firstName} {admin.lastName}</strong>
                <br />
                Email: <strong>{admin.email}</strong>
              </p>
              <div className="alert alert-warning mt-3">
                <FaLock className="me-2" />
                This action cannot be undone!
              </div>
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
              className="btn btn-danger d-flex align-items-center gap-2"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ClipLoader color="#ffffff" size={16} />
                  Deleting...
                </>
              ) : (
                <>
                  <FaTrash />
                  Delete Administrator
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteAdminModal;
