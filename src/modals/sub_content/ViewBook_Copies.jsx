import React, { useEffect, useState } from "react";
import { FaQrcode, FaHistory } from "react-icons/fa";
import { getBookDetails } from "../../../api/manage_books/get_bookDetails";

function ViewBookCopies({ batchRegistrationKey }) {
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

useEffect(() => {
  const fetchCopies = async () => {
    try {
      setLoading(true);
      const details = await getBookDetails();
      const matchedBook = details.find(
        (b) => b.batch_registration_key === batchRegistrationKey
      );
      if (matchedBook) {
        const sortedCopies = matchedBook.book_numbers
          .map((number, index) => ({
            number,
            qr: matchedBook.qr_codes[index],
          }))
          .sort((a, b) => a.number - b.number);

        const formattedCopies = sortedCopies.map((copy) => {
          let qrCode = copy.qr;

          if (qrCode && typeof qrCode === 'object' && qrCode.data) {
            qrCode = bufferObjToBase64(qrCode);
          }

          const qrDataUrl = qrCode ? `data:image/png;base64,${qrCode}` : null;

          return {
            number: copy.number,
            qr: qrDataUrl,
            status: "Available",
            lastBorrowed: null,
            borrower: null,
          };
        });
        setCopies(formattedCopies);
      } else {
        setCopies([]);
      }
    } catch (err) {
      console.error("Error fetching book copies:", err);
      setError("Failed to load book copies.");
    } finally {
      setLoading(false);
    }
  };

  fetchCopies();
}, [batchRegistrationKey]);

  const getStatusBadge = (status) => {
    const statusClass = status === "Available" ? "bg-success" : "bg-warning";
    return <span className={`badge ${statusClass}`}>{status}</span>;
  };

  const handleView = (copyNumber, qrUrl) => {
    alert("View feature is not implemented yet.");
  };

  const handleHistory = (qrUrl) => {
    alert("History feature is not implemented yet.");
  };

  if (loading) return <div>Loading copies...</div>;
  if (error) return <div>{error}</div>;
  if (!copies.length) return <div>No copies available.</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0" style={{ fontSize: "1rem" }}>
          <FaQrcode className="me-2 text-primary" size={16} />
          Book Copies & QR Codes
        </h6>
        <span className="text-muted" style={{ fontSize: "0.875rem" }}>
          Total: {copies.length} copies
        </span>
      </div>

      <div className="row g-3">
        {copies.map((copy) => (
          <div key={copy.number} className="col-lg-4 col-md-6">
            <div
              className="card"
              style={{
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                transition: "transform 0.2s",
              }}
            >
              <div
                className="card-body text-center p-3"
                style={{ minHeight: 270 }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0" style={{ fontSize: "0.875rem" }}>
                    Book Number #{copy.number}
                  </h6>
                  {getStatusBadge(copy.status)}
                </div>

                <div className="mb-2">
                  {copy.qr ? (
                    <img
                      src={copy.qr}
                      alt={`QR for copy ${copy.number}`}
                      style={{
                        width: "150px",
                        height: "150px", 
                        border: "2px solid #e9ecef",
                        borderRadius: "5px",
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

                <div
                  className="text-start mb-2"
                  style={{ fontSize: "0.8rem", minHeight: 68 }}
                >
                  <small className="text-muted d-block">Last Borrowed:</small>
                  <span className="fw-medium">
                    {copy.lastBorrowed || "Never"}
                  </span>
                  <small className="text-muted d-block mt-1">
                    Current Borrower:
                  </small>
                  <span
                    className={`fw-medium ${
                      copy.borrower ? "text-warning" : "text-success"
                    }`}
                  >
                    {copy.borrower || "None"}
                  </span>
                </div>

                <div className="d-flex gap-1">
                  <button
                    className="btn btn-sm btn-outline-primary flex-fill"
                    onClick={() => handleView(copy.number, copy.qr)}
                    style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                  >
                    <FaQrcode className="me-1" size={12} />
                    View
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary flex-fill"
                    onClick={() => handleHistory(copy.qr)}
                    style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                  >
                    <FaHistory className="me-1" size={12} />
                    History
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ViewBookCopies;
