import React, { useState, useEffect } from "react";
import { FaTimes, FaUser, FaInfoCircle, FaFileAlt } from "react-icons/fa";

function ViewRegistrationModal({ show, onClose, registration }) {
  const [activeTab, setActiveTab] = useState("details");
  const [corImage, setCorImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [showCorModal, setShowCorModal] = useState(false);

  useEffect(() => {
    if (registration) {
      // Set initial tab to details if non-student position
      if (registration.position !== "Student") {
        setActiveTab("details");
      }

      console.log("registration.cor:", registration.cor);
      console.log("registration.profile_photo:", registration.profile_photo);

      if (registration.cor && registration.cor.type === "Buffer") {
        try {
          const uint8Array = new Uint8Array(registration.cor.data);
          let binaryString = "";
          const chunkSize = 8192; // Process in chunks to avoid stack overflow
          for (let i = 0; i < uint8Array.length; i += chunkSize) {
            binaryString += String.fromCharCode.apply(
              null,
              uint8Array.slice(i, i + chunkSize)
            );
          }
          const base64String = btoa(binaryString);
          setCorImage(`data:image/jpeg;base64,${base64String}`);
        } catch (error) {
          console.error("Error processing COR image:", error);
          setCorImage(null);
        }
      } else {
        setCorImage(null);
      }

      if (
        registration.profile_photo &&
        registration.profile_photo.type === "Buffer"
      ) {
        try {
          const uint8Array = new Uint8Array(registration.profile_photo.data);
          let binaryString = "";
          const chunkSize = 8192; // Process in chunks to avoid stack overflow
          for (let i = 0; i < uint8Array.length; i += chunkSize) {
            binaryString += String.fromCharCode.apply(
              null,
              uint8Array.slice(i, i + chunkSize)
            );
          }
          const base64String = btoa(binaryString);
          setProfileImage(`data:image/jpeg;base64,${base64String}`);
        } catch (error) {
          console.error("Error processing Profile image:", error);
          setProfileImage(null);
        }
      } else {
        setProfileImage(null);
      }
    }
  }, [registration]);

  const handleCorClick = () => {
    setShowCorModal(true);
  };

  const handleCloseCorModal = () => {
    setShowCorModal(false);
  };

  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return "N/A";
    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length === 11 && cleaned.startsWith("0")) {
      return `(+63) ${cleaned.slice(1, 4)} ${cleaned.slice(
        4,
        7
      )} ${cleaned.slice(7)}`;
    }
    return phoneNumber;
  };

  if (!show || !registration) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
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
                <FaUser className="me-2" size={15} />
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
                  {registration.name || "Registration Details"}
                  <span
                    style={{
                      opacity: 0.8,
                      fontWeight: 400,
                      fontSize: "0.85em",
                      marginLeft: 10,
                    }}
                  >
                    — {registration.department || "Unknown Department"}
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
                  <FaInfoCircle className="me-1" size={14} />
                  Personal Details
                </button>
              </li>
              {registration.position === "Student" && (
                <li className="nav-item">
                  <button
                    className={`nav-link ${
                      activeTab === "documents" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("documents")}
                    style={{
                      borderRadius: "8px 8px 0 0",
                      fontWeight: "500",
                      fontSize: "0.875rem",
                      padding: "8px 16px",
                      backgroundColor:
                        activeTab === "documents" ? "#6c757d" : "#e9ecef",
                      color: activeTab === "documents" ? "#fff" : "#495057",
                      border: "none",
                    }}
                  >
                    <FaFileAlt className="me-1" size={14} />
                    Documents
                  </button>
                </li>
              )}
            </ul>
          </div>

          <div
            className="modal-body"
            style={{ padding: "20px", minHeight: "350px" }}
          >
            {activeTab === "details" && (
              <div>
                <h6
                  className="mb-3"
                  style={{ color: "#800000", fontWeight: "600" }}
                >
                  Personal Information
                </h6>
                <div className="form-control-plaintext bg-light p-2 rounded">
                  {/* Adjust the gray background to match the size of the card */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                      backgroundColor: "#f8f9fa",
                      padding: "15px",
                      borderRadius: "10px",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      width: "100%", // Full width of the card
                      maxWidth: "300px", // Limit the width to card size
                      margin: "0 auto", // Centered horizontally
                    }}
                  >
                    {/* Profile Picture */}
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile Picture"
                        style={{
                          width: "auto",
                          height: "200px", // Fixed height to avoid compression
                          border: "2px solid #800000",
                          borderRadius: "8px", // Slightly rounded corners
                          padding: "4px",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "200px", // Adjusted height
                          backgroundColor: "#f8f9fa",
                          borderRadius: "10px",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          width: "100%", // Full width
                        }}
                      >
                        <span style={{ fontSize: "0.9rem", color: "#495057" }}>
                          No Profile Picture uploaded
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <hr style={{ border: "1px solid #800000", margin: "20px 0" }} />
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label small text-muted">
                      Full Name
                    </label>
                    <div className="form-control-plaintext bg-light p-2 rounded">
                      {`${registration.first_name} ${registration.middle_name} ${registration.last_name}` ||
                        "N/A"}
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small text-muted">
                      {registration.position === "Student"
                        ? "Student ID"
                        : "Faculty ID"}
                    </label>
                    <div className="form-control-plaintext bg-light p-2 rounded">
                      {registration.position === "Student"
                        ? registration.student_id || "N/A"
                        : registration.faculty_id || "N/A"}
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small text-muted">
                      Department
                    </label>
                    <div className="form-control-plaintext bg-light p-2 rounded">
                      {`${registration.department_name} (${registration.department_acronym})` ||
                        "N/A"}
                    </div>
                  </div>
                  {registration.position === "Student" && (
                    <div className="col-md-6 mb-3">
                      <label className="form-label small text-muted">
                        Year Level
                      </label>
                      <div className="form-control-plaintext bg-light p-2 rounded">
                        {registration.year_level || "N/A"}
                      </div>
                    </div>
                  )}

                  <div className="col-md-6 mb-3">
                    <label className="form-label small text-muted">Email</label>
                    <div className="form-control-plaintext bg-light p-2 rounded">
                      {registration.email || "N/A"}
                      {registration.email_verification === 1 ? (
                        <span className="badge bg-success ms-2">Verified</span>
                      ) : (
                        <span className="badge bg-danger ms-2">
                          Not Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small text-muted">
                      Contact Number
                    </label>
                    <div className="form-control-plaintext bg-light p-2 rounded">
                      {formatPhoneNumber(registration.contact_number)}
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small text-muted">
                      Registration Date
                    </label>
                    <div className="form-control-plaintext bg-light p-2 rounded">
                      {registration.created_at
                        ? new Date(registration.created_at).toLocaleString()
                        : "N/A"}
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small text-muted">
                      Registration Status
                    </label>
                    <div className="form-control-plaintext bg-light p-2 rounded">
                      <span
                        className={`badge ${
                          registration.librarian_approval === 1
                            ? "bg-success"
                            : registration.librarian_approval === 0
                            ? "bg-warning"
                            : "bg-danger"
                        }`}
                      >
                        {registration.librarian_approval === 1
                          ? "Approved"
                          : "Pending"}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-12 mb-3 text-center"></div>
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div>
                <h6
                  className="mb-3"
                  style={{ color: "#800000", fontWeight: "600" }}
                >
                  Uploaded Documents
                </h6>
                <div className="row">
                  {registration.position === "Student" && (
                    <>
                      <div className="col-12 mb-3">
                        <label className="form-label small text-muted">
                          Student ID
                        </label>
                        <div className="form-control-plaintext bg-light p-2 rounded">
                          {registration.student_id || "No Student ID uploaded"}
                        </div>
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label small text-muted">
                          Certificate of Registration
                        </label>
                        <div className="form-control-plaintext bg-light p-2 rounded">
                          {corImage ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "10px",
                                backgroundColor: "#f8f9fa",
                                padding: "15px",
                                borderRadius: "10px",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                              }}
                            >
                              <img
                                src={corImage}
                                alt="Certificate of Registration"
                                style={{
                                  width: "200px",
                                  height: "auto",
                                  border: "2px solid #800000",
                                  borderRadius: "8px",
                                  padding: "4px",
                                  cursor: "pointer",
                                }}
                                onClick={handleCorClick}
                              />
                              <span
                                style={{ fontSize: "0.9rem", color: "#495057" }}
                              >
                                Certificate of Registration
                              </span>
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "150px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "10px",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                              }}
                            >
                              <span
                                style={{ fontSize: "0.9rem", color: "#495057" }}
                              >
                                No Certificate of Registration uploaded
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
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
            <small className="text-muted">Lib-Track</small>
          </div>
        </div>
      </div>

      {showCorModal && (
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
                  background:
                    "linear-gradient(135deg, #800000 0%, #b71c1c 100%)",
                  color: "white",
                  padding: "6px 14px",
                  border: "none",
                  minHeight: "unset",
                  height: "38px",
                  alignItems: "center",
                }}
              >
                <span
                  className="modal-title mb-0"
                  style={{ fontWeight: 600, fontSize: "1.2rem" }}
                >
                  Certificate of Registration
                </span>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={handleCloseCorModal}
                  style={{
                    filter: "brightness(0) invert(1)",
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                  }}
                ></button>
              </div>
              <div
                className="modal-body"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "20px",
                }}
              >
                <img
                  src={corImage}
                  alt="Certificate of Registration"
                  style={{
                    width: "100%",
                    maxWidth: "1200px",
                    borderRadius: "8px",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewRegistrationModal;
