import React from "react";
import PropTypes from "prop-types";

function DeleteConfirmationModal({ show, onClose, onConfirm, message }) {
  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}>
        <div
          className="modal-content"
          style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
        >
          {/* Compact Header */}
          <div
            className="modal-header"
            style={{
              background: "linear-gradient(135deg, #800000 0%, #b71c1c 100%)",
              color: "white",
              padding: "8px 16px",
              border: "none",
              minHeight: "unset",
              height: "38px",
              alignItems: "center",
            }}
          >
            <span
              className="modal-title mb-0"
              style={{ fontWeight: 600, fontSize: "1rem", lineHeight: 1 }}
            >
              Confirm Deletion
            </span>
            <button
              type="button"
              className="btn-close btn-close-white ms-2"
              onClick={onClose}
              style={{ filter: "brightness(0) invert(1)", marginLeft: 10 }}
            ></button>
          </div>

          {/* Compact Body */}
          <div className="modal-body" style={{ padding: "18px 20px", fontSize: "0.98rem" }}>
            <p className="mb-0" style={{ color: "#800000", fontWeight: 500 }}>
              {message || "Are you sure you want to delete this item?"}
            </p>
          </div>

          {/* Compact Footer */}
          <div
            className="modal-footer"
            style={{
              backgroundColor: "#fff5f5",
              border: "none",
              padding: "10px 20px",
              borderTop: "1px solid #e9ecef",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={onClose}
              style={{ borderRadius: "6px", minWidth: 80 }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={onConfirm}
              style={{ borderRadius: "6px", minWidth: 80 }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


DeleteConfirmationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  message: PropTypes.string,
};

export default DeleteConfirmationModal;