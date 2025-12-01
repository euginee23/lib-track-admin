import React, { useState } from "react";
import { FaTimes, FaBan } from "react-icons/fa";

function DisapproveRegistrationModal({ show, onClose, onDisapprove, registrationName }) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!show) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onDisapprove(reason.trim() || null);
      setReason("");
      onClose();
    } catch (error) {
      console.error("Error submitting disapproval:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">
              <FaBan className="me-2" />
              Disapprove Registration
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={isSubmitting}
            ></button>
          </div>
          <div className="modal-body">
            <p className="mb-3">
              You are about to disapprove the registration for:
            </p>
            <div className="alert alert-warning mb-3">
              <strong>{registrationName}</strong>
            </div>
            <div className="mb-3">
              <label htmlFor="disapprovalReason" className="form-label">
                Reason for Disapproval <small className="text-muted">(Optional)</small>
              </label>
              <textarea
                id="disapprovalReason"
                className="form-control"
                rows="4"
                placeholder="Enter the reason for disapproving this registration. This will be sent to the user's email."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                disabled={isSubmitting}
              />
              <small className="text-muted">
                {reason.length}/500 characters
              </small>
            </div>
            <div className="alert alert-info small mb-0">
              <strong>Note:</strong> An email notification will be sent to the user's registered email address
              {reason.trim() ? " including the reason you provide." : "."}
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <FaTimes className="me-1" />
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Disapproving...
                </>
              ) : (
                <>
                  <FaBan className="me-1" />
                  Disapprove
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisapproveRegistrationModal;
