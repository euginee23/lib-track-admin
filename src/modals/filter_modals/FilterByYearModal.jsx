import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

function FilterByYearModal({ show, onClose, onSelectYear, selectedYearRange }) {
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");

  useEffect(() => {
  setStartYear(selectedYearRange?.start || "");
  setEndYear(selectedYearRange?.end || "");
  }, [show, selectedYearRange]);

  const handleApply = () => {
    const yearRegex = /^\d{4}$/;
    if (
      startYear && endYear &&
      yearRegex.test(startYear) &&
      yearRegex.test(endYear) &&
      Number(startYear) <= Number(endYear)
    ) {
      onSelectYear({ start: startYear, end: endYear });
    } else {
      alert("Please enter a valid 4-digit year range.");
    }
  };

  const handleClose = () => {
    setStartYear("");
    setEndYear("");
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content shadow border-0">
          <div className="modal-header py-2 wmsu-bg-primary text-white">
            <h6 className="modal-title fw-semibold mb-0">
              <i className="bi bi-calendar-range me-1"></i>
              Filter by Year
            </h6>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body p-4">
            <p className="text-muted mb-4 small text-center">
              Enter a start and end year to filter items.
            </p>
            <div className="d-flex gap-2 align-items-end mb-2">
              <div style={{ width: "100px" }}>
                <label className="form-label small mb-1">Start Year</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={startYear}
                  maxLength={4}
                  pattern="\\d{4}"
                  inputMode="numeric"
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setStartYear(val.slice(0, 4));
                  }}
                  onBlur={e => {
                    if (e.target.value && e.target.value.length > 0 && !/^\d{4}$/.test(e.target.value)) {
                      setStartYear("");
                    }
                  }}
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="e.g. 2000"
                  autoComplete="off"
                />
              </div>
              <span className="mx-1">-</span>
              <div style={{ width: "100px" }}>
                <label className="form-label small mb-1">End Year</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={endYear}
                  maxLength={4}
                  pattern="\\d{4}"
                  inputMode="numeric"
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setEndYear(val.slice(0, 4));
                  }}
                  onBlur={e => {
                    if (e.target.value && e.target.value.length > 0 && !/^\d{4}$/.test(e.target.value)) {
                      setEndYear("");
                    }
                  }}
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder={`e.g. ${new Date().getFullYear()}`}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
          <div className="modal-footer py-2">
            <button className="btn btn-sm btn-light" onClick={handleClose}>
              <i className="bi bi-x-circle me-1"></i> Cancel
            </button>
            <button className="btn btn-sm btn-primary" onClick={handleApply}>
              <i className="bi bi-check-circle me-1"></i> Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

FilterByYearModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectYear: PropTypes.func.isRequired,
  selectedYearRange: PropTypes.shape({
    start: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    end: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

export default FilterByYearModal;
