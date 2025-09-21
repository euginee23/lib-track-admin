import React, { useState } from "react";
import { FaTimes, FaBook, FaCopy, FaPrint } from "react-icons/fa";
import ViewBookBookDetails from "./sub_content/ViewBook_BookDetails";
import ViewBookCopies from "./sub_content/ViewBook_Copies";
import ViewBookPrintQR from "./sub_content/ViewBook_PrintQR";

function ViewBookModal({ show, onClose, book, batchRegistrationKey }) {
  const [activeTab, setActiveTab] = useState("details");

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
          {/* Compact Header */}

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
                <FaBook className="me-2" size={15} />
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
                  {book?.book_title || "Book Details"}
                  <span
                    style={{
                      opacity: 0.8,
                      fontWeight: 400,
                      fontSize: "0.85em",
                      marginLeft: 10,
                    }}
                  >
                    — {book?.author || "Unknown Author"}
                  </span>
                </span>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white ms-2"
                onClick={onClose}
                style={{ filter: "brightness(0) invert(1)", marginLeft: 10 }}
              ></button>
            </div>
          </div>

          {/* Compact Tab Navigation */}
          <div className="px-3 pt-2" style={{ backgroundColor: "#fff5f5" }}>
            <ul
              className="nav nav-pills"
              style={{ borderBottom: "none", gap: "5px", display: "flex" }}
            >
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "details" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("details")}
                  style={{
                    borderRadius: "8px 8px 0 0",
                    fontWeight: "500",
                    fontSize: "0.875rem",
                    padding: "8px 16px",
                    backgroundColor:
                      activeTab === "details" ? "#6c757d" : "#e9ecef",
                    color: activeTab === "details" ? "#fff" : "#495057",
                    border: "none",
                  }}
                >
                  <FaBook className="me-1" size={14} />
                  Book Details
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "copies" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("copies")}
                  style={{
                    borderRadius: "8px 8px 0 0",
                    fontWeight: "500",
                    fontSize: "0.875rem",
                    padding: "8px 16px",
                    backgroundColor:
                      activeTab === "copies" ? "#6c757d" : "#e9ecef",
                    color: activeTab === "copies" ? "#fff" : "#495057",
                    border: "none",
                  }}
                >
                  <FaCopy className="me-1" size={14} />
                  Copies
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "printqr" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("printqr")}
                  style={{
                    borderRadius: "8px 8px 0 0",
                    fontWeight: "500",
                    fontSize: "0.875rem",
                    padding: "8px 16px",
                    backgroundColor:
                      activeTab === "printqr" ? "#6c757d" : "#e9ecef",
                    color: activeTab === "printqr" ? "#fff" : "#495057",
                    border: "none",
                  }}
                >
                  <FaPrint className="me-1" size={14} />
                  Print QR
                </button>
              </li>
            </ul>
          </div>

          <div
            className="modal-body"
            style={{ padding: "20px", minHeight: "350px" }}
          >
            {activeTab === "details" && (
              <ViewBookBookDetails
                batchRegistrationKey={batchRegistrationKey}
              />
            )}

            {activeTab === "copies" && (
              <ViewBookCopies batchRegistrationKey={batchRegistrationKey} />
            )}

            {activeTab === "printqr" && (
              <ViewBookPrintQR batchRegistrationKey={batchRegistrationKey} />
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
            <small className="text-muted">Lib-Track</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewBookModal;
