import React from "react";
import { FaBook, FaFileAlt } from "react-icons/fa";


function FilterByTypeModal({ show, onClose, onSelectType, selectedType }) {
  if (!show) return null;

  const handleTypeSelection = (type) => {
    onSelectType(type);
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content shadow border-0">
          {/* Header */}
          <div className="modal-header py-2 wmsu-bg-primary text-white">
            <h6 className="modal-title fw-semibold mb-0">
              <i className="bi bi-filter me-1"></i>
              Filter by Type
            </h6>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            <p className="text-muted mb-4 small text-center">
              Select which type to show in the library.
            </p>
            <div className="d-grid gap-3">
              {/* Book Option */}
              <button
                className={`btn d-flex align-items-center justify-content-start p-3 ${selectedType === "Book" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => handleTypeSelection("Book")}
                style={{
                  border: selectedType === "Book" ? "2px solid #0d6efd" : "2px solid #0d6efd",
                  borderRadius: "8px",
                  transition: "all 0.2s ease"
                }}
              >
                <FaBook size={24} className="me-3" />
                <div className="text-start">
                  <div className="fw-semibold">Book</div>
                </div>
              </button>

              {/* Research Paper Option */}
              <button
                className={`btn d-flex align-items-center justify-content-start p-3 ${selectedType === "Research Paper" ? "btn-success" : "btn-outline-success"}`}
                onClick={() => handleTypeSelection("Research Paper")}
                style={{
                  border: selectedType === "Research Paper" ? "2px solid #198754" : "2px solid #198754",
                  borderRadius: "8px",
                  transition: "all 0.2s ease"
                }}
              >
                <FaFileAlt size={24} className="me-3" />
                <div className="text-start">
                  <div className="fw-semibold">Research Paper</div>
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer py-2">
            <button className="btn btn-sm btn-light" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i> Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterByTypeModal;
