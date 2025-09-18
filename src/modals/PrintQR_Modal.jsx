import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaPrint, FaTimes, FaQrcode } from "react-icons/fa";
import { getResearchQR } from "../../api/manage_books/get_researchQR";
import { exportResearchQRCodes } from "../utils/exportResearchQRCodes";

function PrintQRModal({ show, onClose, selectedResearchIds = [] }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResearchQR = async () => {
      if (show && selectedResearchIds.length > 0) {
        setLoading(true);
        try {
          const qrData = await getResearchQR(selectedResearchIds);
          const formattedQRData = qrData.map((item, index) => ({
            id: index + 1,
            qr: `data:image/png;base64,${item.qrCode}`,
            title: item.title,
          }));
          setQrCodes(formattedQRData);
        } catch (error) {
          console.error("Error fetching QR codes:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchResearchQR();
  }, [show, selectedResearchIds]);

  const handleItemSelection = (id) => {
    setSelectedItems((prev) => {
      const updatedSelection = prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id];

      setSelectAll(updatedSelection.length === qrCodes.length);

      return updatedSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(qrCodes.map((qr) => qr.id));
    }
    setSelectAll(!selectAll);
  };

  const handlePrint = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one QR code to print.");
      return;
    }

    try {
      const selectedData = qrCodes.filter((item) =>
        selectedItems.includes(item.id)
      );
      await exportResearchQRCodes(
        { title: "Selected Research Papers" },
        selectedData
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(error.message || "Error generating PDF. Please try again.");
    }
  };

  const resetModal = () => {
    setSelectedItems([]);
    setSelectAll(false);
    setQrCodes([]);
    setLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div
          className="modal-content"
          style={{
            borderRadius: "15px",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          }}
        >
          <div
            className="modal-header"
            style={{
              background: "linear-gradient(135deg, #800000 0%, #b71c1c 100%)",
              color: "white",
              padding: "6px 14px",
              border: "none",
              minHeight: "unset",
              height: "38px",
              alignItems: "center",
            }}
          >
            <div
              className="d-flex align-items-center w-100 justify-content-between"
              style={{ minHeight: 0 }}
            >
              <div
                className="d-flex align-items-center"
                style={{ minHeight: 0 }}
              >
                <FaQrcode className="me-2" size={15} />
                <span
                  className="modal-title mb-0"
                  style={{
                    fontWeight: 600,
                    fontSize: "0.98rem",
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  Print QR Codes
                  <span
                    style={{
                      opacity: 0.8,
                      fontWeight: 400,
                      fontSize: "0.85em",
                      marginLeft: 10,
                    }}
                  >
                    — Select Research Papers for QR Code Generation
                  </span>
                </span>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white ms-2"
                onClick={handleClose}
                style={{ filter: "brightness(0) invert(1)", marginLeft: 10 }}
              ></button>
            </div>
          </div>

          <div
            className="modal-body"
            style={{ padding: "20px", minHeight: "350px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0" style={{ fontSize: "1rem" }}>
                <FaQrcode className="me-2 text-primary" size={16} />
                Select QR Codes to Print
              </h6>
              <div className="d-flex gap-2 align-items-center">
                <span className="text-muted" style={{ fontSize: "0.875rem" }}>
                  Selected: {selectedItems.length}/{qrCodes.length}
                </span>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleSelectAll}
                  style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                >
                  {selectAll ? "Deselect All" : "Select All"}
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handlePrint}
                  disabled={selectedItems.length === 0}
                  style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                >
                  <FaPrint className="me-1" size={12} />
                  Export to PDF
                </button>
              </div>
            </div>

            {loading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "200px" }}
              >
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="row g-3">
                {qrCodes.map((qr) => (
                  <div key={qr.id} className="col-lg-3 col-md-6">
                    <div
                      className={`card ${selectedItems.includes(qr.id) ? "border-primary" : ""}`}
                      style={{
                        border: selectedItems.includes(qr.id)
                          ? "2px solid #0d6efd"
                          : "none",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                        backgroundColor: selectedItems.includes(qr.id)
                          ? "#f8f9ff"
                          : "white",
                      }}
                      onClick={() => handleItemSelection(qr.id)}
                    >
                      <div
                        className="card-body text-center p-3"
                        style={{ minHeight: 270 }}
                      >
                        <div className="text-center mb-2">
                          <h6
                            className="fw-bold"
                            style={{ fontSize: "1rem", marginBottom: "0.5rem" }}
                          >
                            {qr.title || "N/A"}
                          </h6>
                        </div>
                        <div className="mb-2">
                          {qr.qr ? (
                            <img
                              src={qr.qr}
                              alt={`QR for ${qr.title}`}
                              style={{
                                width: "150px",
                                height: "150px",
                                border: "2px solid #333",
                                borderRadius: "8px",
                                padding: "4px",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "150px",
                                height: "150px",
                                border: "2px solid #e9ecef",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#f8f9fa",
                                color: "#6c757d",
                                fontSize: "0.75rem",
                              }}
                            >
                              No QR Code
                            </div>
                          )}
                        </div>
                        <div className="d-flex justify-content-center">
                          <small
                            className="text-primary fw-medium"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {selectedItems.includes(qr.id)
                              ? "Selected for Print"
                              : "Click to Select"}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedItems.length > 0 && (
              <div
                className="mt-3 p-3 bg-light rounded"
                style={{ borderRadius: "12px" }}
              >
                <h6 className="mb-2" style={{ fontSize: "0.875rem" }}>
                  Print Preview
                </h6>
                <p className="mb-2" style={{ fontSize: "0.8rem" }}>
                  Selected {selectedItems.length} out of {qrCodes.length} QR codes for
                  printing:
                </p>
                <div className="d-flex flex-wrap gap-1 mb-2">
                  {selectedItems
                    .sort((a, b) => a - b)
                    .map((itemId) => (
                      <span
                        key={itemId}
                        className="badge bg-primary"
                        style={{ fontSize: "0.7rem" }}
                      >
                        QR #{itemId}
                      </span>
                    ))}
                </div>
                <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                  QR codes will be printed in a grid layout with research paper information.
                </small>
              </div>
            )}
          </div>

          <div
            className="modal-footer"
            style={{
              backgroundColor: "#fff5f5",
              border: "none",
              padding: "10px 20px",
              borderTop: "1px solid #e9ecef",
            }}
          >
            <small className="text-muted">Library Management System</small>
          </div>
        </div>
      </div>
    </div>
  );
}

PrintQRModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedResearchIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default PrintQRModal;