import React, { useState, useEffect } from "react";
import { FaPrint, FaCheck, FaQrcode } from "react-icons/fa";
import { exportBookQRCodes } from "../../utils/exportBookQRCodes";
import { getBookDetails } from "../../../api/manage_books/get_bookDetails";

function ViewBookPrintQR({ batchRegistrationKey }) {
  const [selectedCopies, setSelectedCopies] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [copies, setCopies] = useState([]);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  function bufferObjToBase64(buf) {
    if (buf && buf.data) {
      const byteArray = new Uint8Array(buf.data);
      let binary = "";
      for (let i = 0; i < byteArray.length; i++) {
        binary += String.fromCharCode(byteArray[i]);
      }
      return window.btoa(binary);
    }
    return null;
  }

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const details = await getBookDetails();
        console.log("Fetched book details:", details);
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

            if (qrCode && typeof qrCode === "object" && qrCode.data) {
              qrCode = bufferObjToBase64(qrCode);
            }

            const qrDataUrl = qrCode ? `data:image/png;base64,${qrCode}` : null;

            return {
              number: copy.number,
              qr: qrDataUrl,
            };
          });
          setCopies(formattedCopies);
          setBook({ book_title: matchedBook.book_title });
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [batchRegistrationKey]);

  const handleCopySelection = (copyNumber) => {
    setSelectedCopies((prev) => {
      if (prev.includes(copyNumber)) {
        return prev.filter((num) => num !== copyNumber);
      } else {
        return [...prev, copyNumber];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCopies([]);
    } else {
      setSelectedCopies(copies.map((copy) => copy.number));
    }
    setSelectAll(!selectAll);
  };

  const handlePrint = async () => {
    if (selectedCopies.length === 0) {
      alert("Please select at least one copy to print.");
      return;
    }

    try {
      const selectedCopiesData = copies.filter((copy) =>
        selectedCopies.includes(copy.number)
      );
      await exportBookQRCodes(book, selectedCopiesData);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(error.message || "Error generating PDF. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!book) return <div>Loading book details...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0" style={{ fontSize: "1rem" }}>
          <FaQrcode className="me-2 text-primary" size={16} />
          Select Copies to Print QR Codes
        </h6>
        <div className="d-flex gap-2 align-items-center">
          <span className="text-muted" style={{ fontSize: "0.875rem" }}>
            Selected: {selectedCopies.length}/{copies.length}
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
            disabled={selectedCopies.length === 0}
            style={{ fontSize: "0.75rem", padding: "4px 8px" }}
          >
            <FaPrint className="me-1" size={12} />
            Export to PDF
          </button>
        </div>
      </div>

      <div className="row g-3">
        {copies.map((copy) => (
          <div key={copy.number} className="col-lg-3 col-md-6">
            <div
              className={`card ${selectedCopies.includes(copy.number) ? "border-primary" : ""}`}
              style={{
                border: selectedCopies.includes(copy.number)
                  ? "2px solid #0d6efd"
                  : "none",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                transition: "all 0.2s ease",
                cursor: "pointer",
                backgroundColor: selectedCopies.includes(copy.number)
                  ? "#f8f9ff"
                  : "white",
              }}
              onClick={() => handleCopySelection(copy.number)}
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
                    {book?.book_title || "N / A"}
                  </h6>
                  <p
                    className="text-muted"
                    style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}
                  >
                    Book Number: #{copy.number}
                  </p>
                </div>
                <div className="mb-2">
                  {copy.qr ? (
                    <img
                      src={copy.qr}
                      alt={`QR for copy ${copy.number}`}
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
                    {selectedCopies.includes(copy.number)
                      ? "Selected for Print"
                      : "Click to Select"}
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCopies.length > 0 && (
        <div
          className="mt-3 p-3 bg-light rounded"
          style={{ borderRadius: "12px" }}
        >
          <h6 className="mb-2" style={{ fontSize: "0.875rem" }}>
            Print Preview
          </h6>
          <p className="mb-2" style={{ fontSize: "0.8rem" }}>
            Selected {selectedCopies.length} out of {copies.length} copies for
            printing:
          </p>
          <div className="d-flex flex-wrap gap-1 mb-2">
            {selectedCopies
              .sort((a, b) => a - b)
              .map((copyNum) => (
                <span
                  key={copyNum}
                  className="badge bg-primary"
                  style={{ fontSize: "0.7rem" }}
                >
                  Copy #{copyNum}
                </span>
              ))}
          </div>
          <small className="text-muted" style={{ fontSize: "0.75rem" }}>
            QR codes will be printed in a grid layout with book information and
            copy details.
          </small>
        </div>
      )}
    </div>
  );
}

export default ViewBookPrintQR;
