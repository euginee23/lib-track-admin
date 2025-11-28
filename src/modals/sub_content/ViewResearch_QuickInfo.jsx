import React, { useEffect, useState } from "react";
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
  FaQrcode
} from "react-icons/fa";
import { getResearchDetails } from "../../../api/manage_books/get_researchDetails";
import { getResearchCopyDetails } from "../../../api/manage_books/get_researchCopyDetails";
import ViewResearchCopyModal from "../../modals/ViewResearchCopyModal";
import ResearchCopyHistoryModal from "../../modals/ResearchCopyHistoryModal";
import ToastNotification from "../../components/ToastNotification";

function ViewResearchQuickInfo({ research }) {
  const [researchData, setResearchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [copyDetails, setCopyDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchResearchData = async () => {
      if (!research?.research_paper_id) {
        setLoading(false);
        return;
      }

      try {
        const details = await getResearchDetails();
        const matchedResearch = details.find(
          (r) => r.research_paper_id === research.research_paper_id
        );
        setResearchData(matchedResearch || research);
      } catch (error) {
        console.error("Error fetching research details:", error);
        setResearchData(research);
      } finally {
        setLoading(false);
      }
    };

    fetchResearchData();
  }, [research]);

  const handleViewDetails = async () => {
    if (!researchData?.research_paper_id) {
      ToastNotification.error("No research paper selected");
      return;
    }

    setLoadingDetails(true);
    try {
      const response = await getResearchCopyDetails(researchData.research_paper_id);
      if (response.success) {
        setCopyDetails(response.data);
        setShowViewModal(true);
      } else {
        ToastNotification.error(response.message || "Failed to fetch research details");
      }
    } catch (error) {
      console.error("Error fetching copy details:", error);
      ToastNotification.error("Failed to fetch research details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewHistory = async () => {
    if (!researchData?.research_paper_id) {
      ToastNotification.error("No research paper selected");
      return;
    }

    setLoadingDetails(true);
    try {
      const response = await getResearchCopyDetails(researchData.research_paper_id);
      if (response.success) {
        setCopyDetails(response.data);
        setShowHistoryModal(true);
      } else {
        ToastNotification.error(response.message || "Failed to fetch research history");
      }
    } catch (error) {
      console.error("Error fetching copy history:", error);
      ToastNotification.error("Failed to fetch research history");
    } finally {
      setLoadingDetails(false);
    }
  };

  function bufferObjToBase64(buf) {
    if (buf && buf.data) {
      const byteArray = new Uint8Array(buf.data);
      let binary = '';
      for (let i = 0; i < byteArray.length; i++) {
        binary += String.fromCharCode(byteArray[i]);
      }
      return window.btoa(binary);
    }
    return null;
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  if (!researchData) {
    return (
      <div className="text-center py-5">
        <FaFileAlt size={48} className="text-muted mb-3" />
        <h5 className="text-muted">No research data available</h5>
      </div>
    );
  }

  return (
    <>
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
                      {researchData.department_name || researchData.department || "N/A"}
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
                    <span className="d-flex gap-2">
                      <span className="badge bg-primary" style={{ fontSize: "0.75rem" }}>
                        Shelf: {researchData.shelf_number || "N/A"}
                      </span>
                      <span className="badge bg-success" style={{ fontSize: "0.75rem" }}>
                        Column: {researchData.shelf_column || "N/A"}
                      </span>
                      <span className="badge bg-warning" style={{ fontSize: "0.75rem" }}>
                        Row: {researchData.shelf_row || "N/A"}
                      </span>
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
                      {researchData.year_publication || researchData.year || "N/A"}
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
                      {Array.isArray(researchData.authors)
                        ? researchData.authors.length > 1 
                          ? `${researchData.authors[0]} +${researchData.authors.length - 1} more`
                          : researchData.authors[0]
                        : researchData.authors || researchData.author || "N/A"}
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
                Actions
              </h6>
              <div className="row g-2">
                <div className="col-6">
                  <button 
                    className="btn btn-outline-primary btn-sm w-100"
                    style={{ fontSize: "0.8rem" }}
                    onClick={handleViewDetails}
                    disabled={loadingDetails}
                  >
                    {loadingDetails ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Loading...
                      </>
                    ) : (
                      <>
                        <FaEye className="me-2" size={12} />
                        View Details
                      </>
                    )}
                  </button>
                </div>
                <div className="col-6">
                  <button 
                    className="btn btn-outline-secondary btn-sm w-100"
                    style={{ fontSize: "0.8rem" }}
                    onClick={handleViewHistory}
                    disabled={loadingDetails}
                  >
                    {loadingDetails ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Loading...
                      </>
                    ) : (
                      <>
                        <FaHistory className="me-2" size={12} />
                        View History
                      </>
                    )}
                  </button>
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
                      {researchData.last_borrowed 
                        ? new Date(researchData.last_borrowed).toLocaleDateString()
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
                      {researchData.current_borrower || "None"}
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
                  {researchData.research_title || researchData.title || "Research Paper"}
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
                  }}
                >
                  {researchData.research_paper_qr ? (
                    <img
                      src={`data:image/png;base64,${
                        typeof researchData.research_paper_qr === 'object' && researchData.research_paper_qr.data
                          ? bufferObjToBase64(researchData.research_paper_qr)
                          : researchData.research_paper_qr
                      }`}
                      alt="Research QR Code"
                      style={{
                        width: "140px",
                        height: "140px",
                        objectFit: "contain"
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{ 
                    display: researchData.research_paper_qr ? "none" : "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%"
                  }}>
                    <FaQrcode size={60} className="text-muted" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showViewModal && copyDetails && (
        <ViewResearchCopyModal
          show={showViewModal}
          onClose={() => setShowViewModal(false)}
          copyData={copyDetails}
        />
      )}

      {showHistoryModal && copyDetails && (
        <ResearchCopyHistoryModal
          show={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          copyData={copyDetails}
        />
      )}
    </>
  );
}

export default ViewResearchQuickInfo;