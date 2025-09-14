import React from "react";
import { 
  FaFileAlt, 
  FaUser, 
  FaBuilding, 
  FaCalendar, 
  FaMapMarkerAlt, 
  FaEye, 
  FaHistory,
  FaIdCard,
  FaCheck,
  FaClock,
  FaUpload,
  FaQrcode
} from "react-icons/fa";

function ViewResearchQuickInfo({ research }) {
  if (!research) {
    return (
      <div className="text-center py-5">
        <FaFileAlt size={48} className="text-muted mb-3" />
        <h5 className="text-muted">No research data available</h5>
      </div>
    );
  }

  return (
    <div className="row g-3">
      {/* Left Column */}
      <div className="col-md-6">
        {/* Location & Details Card */}
        <div
          className="card mb-3"
          style={{
            border: "none",
            backgroundColor: "#f8f9fa",
            borderRadius: "10px",
          }}
        >
          <div className="card-body p-3">
            <h6
              className="card-title text-muted mb-3"
              style={{ fontSize: "0.875rem" }}
            >
              <FaMapMarkerAlt className="me-1" size={14} />
              Shelf Location & Other Info
            </h6>
            <div className="row g-2">
              <div className="col-12">
                <div
                  className="d-flex justify-content-between align-items-center p-2"
                  style={{
                    backgroundColor: "white",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                  }}
                >
                  <span className="text-muted" style={{ minWidth: "100px" }}>
                    <FaBuilding className="me-1" size={12} />
                    Department:
                  </span>
                  <span className="fw-medium">
                    {research.department_name || research.department || "N/A"}
                  </span>
                </div>
              </div>
              <div className="col-12">
                <div
                  className="d-flex justify-content-between align-items-center p-2"
                  style={{
                    backgroundColor: "white",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                  }}
                >
                  <span className="text-muted" style={{ minWidth: "100px" }}>
                    <FaMapMarkerAlt className="me-1" size={12} />
                    Shelf:
                  </span>
                  <span className="fw-medium">
                    {research.shelf_column && research.shelf_row
                      ? `${research.shelf_column}-${research.shelf_row}`
                      : "Not specified"}
                  </span>
                </div>
              </div>
              <div className="col-12">
                <div
                  className="d-flex justify-content-between align-items-center p-2"
                  style={{
                    backgroundColor: "white",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                  }}
                >
                  <span className="text-muted" style={{ minWidth: "100px" }}>
                    <FaCalendar className="me-1" size={12} />
                    Year:
                  </span>
                  <span className="fw-medium">
                    {research.year_publication || research.year || "N/A"}
                  </span>
                </div>
              </div>
              <div className="col-12">
                <div
                  className="d-flex justify-content-between align-items-center p-2"
                  style={{
                    backgroundColor: "white",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                  }}
                >
                  <span className="text-muted" style={{ minWidth: "100px" }}>
                    <FaUser className="me-1" size={12} />
                    Authors:
                  </span>
                  <span className="fw-medium" style={{ textAlign: "right", flex: 1 }}>
                    {Array.isArray(research.authors)
                      ? research.authors.length > 1 
                        ? `${research.authors[0]} +${research.authors.length - 1} more`
                        : research.authors[0]
                      : research.authors || research.author || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div
          className="card"
          style={{
            border: "none",
            backgroundColor: "#f8f9fa",
            borderRadius: "10px",
          }}
        >
          <div className="card-body p-3">
            <h6
              className="card-title text-muted mb-3"
              style={{ fontSize: "0.875rem" }}
            >
              <FaFileAlt className="me-1" size={14} />
              Available Actions
            </h6>
            <div className="row g-2">
              <div className="col-6">
                <button 
                  className="btn btn-outline-primary btn-sm w-100"
                  style={{ fontSize: "0.8rem" }}
                >
                  <FaEye className="me-2" size={12} />
                  View Full Details
                </button>
              </div>
              <div className="col-6">
                <button 
                  className="btn btn-outline-secondary btn-sm w-100"
                  style={{ fontSize: "0.8rem" }}
                >
                  <FaHistory className="me-2" size={12} />
                  View History
                </button>
              </div>
              <div className="col-12 mt-3">
                <div 
                  className="rounded p-3 text-center"
                  style={{ 
                    border: "2px dashed #dee2e6",
                    backgroundColor: "white",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = "#0d6efd";
                    e.target.style.backgroundColor = "#f8f9ff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = "#dee2e6";
                    e.target.style.backgroundColor = "white";
                  }}
                >
                  <FaUpload className="text-muted mb-2" size={20} />
                  <p className="mb-1 text-muted" style={{ fontSize: "0.8rem" }}>
                    <strong>Click to upload</strong> or drag and drop
                  </p>
                  <p className="mb-0 text-muted" style={{ fontSize: "0.7rem" }}>
                    Soft Copy for this Research (Max 10MB / Optional)
                  </p>
                  <input 
                    type="file" 
                    accept=".pdf"
                    style={{ display: "none" }}
                    onChange={() => {}} // Placeholder for future functionality
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="col-md-6">
        {/* Quick Summary Card */}
        <div
          className="card mb-3"
          style={{
            border: "none",
            backgroundColor: "#f8f9fa",
            borderRadius: "10px",
          }}
        >
          <div className="card-body p-3">
            <h6
              className="card-title text-muted mb-3"
              style={{ fontSize: "0.875rem" }}
            >
              <FaFileAlt className="me-1" size={14} />
              Summary
            </h6>
            <div className="row g-2">
              <div className="col-12">
                <div
                  className="d-flex justify-content-between align-items-center p-2"
                  style={{
                    backgroundColor: "white",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                  }}
                >
                  <span className="text-muted" style={{ minWidth: "80px" }}>
                    <FaCheck className="me-1" size={12} />
                    Status:
                  </span>
                  <span className="badge bg-success">Available</span>
                </div>
              </div>
              <div className="col-12">
                <div
                  className="d-flex justify-content-between align-items-center p-2"
                  style={{
                    backgroundColor: "white",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                  }}
                >
                  <span className="text-muted" style={{ minWidth: "80px" }}>
                    <FaClock className="me-1" size={12} />
                    Last Borrowed:
                  </span>
                  <span className="fw-medium">
                    {research.last_borrowed 
                      ? new Date(research.last_borrowed).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
              </div>
              <div className="col-12">
                <div
                  className="d-flex justify-content-between align-items-center p-2"
                  style={{
                    backgroundColor: "white",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                  }}
                >
                  <span className="text-muted" style={{ minWidth: "80px" }}>
                    <FaUser className="me-1" size={12} />
                    Current Borrower:
                  </span>
                  <span className="fw-medium">
                    {research.current_borrower || "None"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Card */}
        <div
          className="card"
          style={{
            border: "none",
            backgroundColor: "#f8f9fa",
            borderRadius: "10px",
          }}
        >
          <div className="card-body p-3 text-center">
            <h6
              className="card-title text-muted mb-3"
              style={{ fontSize: "0.875rem" }}
            >
              <FaQrcode className="me-1" size={14} />
              QR Code
            </h6>
            
            {/* QR Code Container */}
            <div className="d-flex flex-column align-items-center mb-3">
              {/* Research Title */}
              <div className="mb-2" style={{ fontSize: "0.85rem", fontWeight: "600", color: "#333", textAlign: "center", lineHeight: "1.2" }}>
                {research.research_title || research.title || "Research Paper"}
              </div>
              
              {/* QR Code */}
              <div
                style={{
                  width: "150px",
                  height: "150px",
                  backgroundColor: "white",
                  border: "2px solid #333",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundImage: `url("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(research.research_paper_id || 'RESEARCH_ID')}")`,
                  backgroundSize: "140px 140px",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center"
                }}
              >
                {/* Fallback content if QR code image doesn't load */}
                <div style={{ display: "none" }}>
                  <FaQrcode size={60} className="text-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewResearchQuickInfo;
