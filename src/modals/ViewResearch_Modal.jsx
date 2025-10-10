import React, { useState } from "react";
import { FaTimes, FaFileAlt, FaInfoCircle } from "react-icons/fa";
import ViewResearchResearchDetails from "./sub_content/ViewResearch_ResearchDetails";
import ViewResearchQuickInfo from "./sub_content/ViewResearch_QuickInfo";

function ViewResearchModal({ show, onClose, research }) {
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
                <FaFileAlt className="me-2" size={15} />
                <span
                  className="modal-title mb-0"
                  style={{
                    fontWeight: 600,
                    fontSize: "0.98rem",
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    maxWidth: "90%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {(() => {
                    const title = research?.research_title || research?.title || "Research Paper Details";
                    const authors = Array.isArray(research?.authors) 
                        ? research.authors.join(", ") 
                        : research?.authors || research?.author || "Unknown Author";
                    const fullText = `${title} — ${authors}`;
                    return fullText.length > 100 ? fullText.substring(0, 100) + "..." : fullText;
                  })()}
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
                  <FaFileAlt className="me-1" size={14} />
                  Research Details
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "quickinfo" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("quickinfo")}
                  style={{
                    borderRadius: "8px 8px 0 0",
                    fontWeight: "500",
                    fontSize: "0.875rem",
                    padding: "8px 16px",
                    backgroundColor:
                      activeTab === "quickinfo" ? "#6c757d" : "#e9ecef",
                    color: activeTab === "quickinfo" ? "#fff" : "#495057",
                    border: "none",
                  }}
                >
                  <FaInfoCircle className="me-1" size={14} />
                  Quick Info
                </button>
              </li>
            </ul>
          </div>

          {/* Modal Body */}
          <div
            className="modal-body"
            style={{ padding: "20px", minHeight: "450px", maxHeight: "550px", overflowY: "auto" }}
          >
            {activeTab === "details" && (
              <ViewResearchResearchDetails research={research} />
            )}
            {activeTab === "quickinfo" && (
              <ViewResearchQuickInfo research={research} />
            )}
          </div>

          {/* Footer */}
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

export default ViewResearchModal;