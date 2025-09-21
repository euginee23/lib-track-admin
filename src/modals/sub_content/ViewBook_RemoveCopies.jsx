import React, { useState, useEffect } from "react";
import { FaTrash, FaExclamationTriangle, FaCheck, FaBook } from "react-icons/fa";
import { getBookDetails } from "../../../api/manage_books/get_bookDetails";

function ViewBookRemoveCopies({ batchRegistrationKey, onClose, onRemove }) {
  const [selectedCopies, setSelectedCopies] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [copies, setCopies] = useState([]);
  const [removedCopiesList, setRemovedCopiesList] = useState([]);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const details = await getBookDetails();
        const matchedBook = details.find(
          (b) => b.batch_registration_key === batchRegistrationKey
        );
        if (matchedBook) {
          // Only show available copies that can be removed
          const availableCopies = matchedBook.copies
            ? matchedBook.copies.filter(copy => copy.status === "Available")
            : [];

          const removedCopies = matchedBook.copies
            ? matchedBook.copies.filter(copy => copy.status === "Removed")
            : [];

          setCopies(availableCopies);
          setRemovedCopiesList(removedCopies);
          setBook({
            book_title: matchedBook.book_title,
            totalCopies: matchedBook.quantity || matchedBook.copies?.length || 0,
            availableCopies: availableCopies.length,
            borrowedCopies: matchedBook.copies 
              ? matchedBook.copies.filter(copy => copy.status === "Borrowed").length 
              : 0,
            removedCopies: removedCopies.length
          });
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [batchRegistrationKey]);

  const handleCopySelection = (copyId) => {
    setSelectedCopies((prev) => {
      const updatedSelection = prev.includes(copyId)
        ? prev.filter((id) => id !== copyId)
        : [...prev, copyId];

      // Update selectAll state based on manual selection
      setSelectAll(updatedSelection.length === copies.length);

      return updatedSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCopies([]);
    } else {
      setSelectedCopies(copies.map((copy) => copy.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectForRemoval = async () => {
    if (selectedCopies.length === 0) {
      alert("Please select at least one copy to select for removal.");
      return;
    }

    try {
      setRemoving(true);
      // Log the book_ids being passed for removal
      console.log("Book IDs selected for removal:", selectedCopies);
      // Call the onRemove callback with selected copy IDs (book_ids)
      await onRemove(selectedCopies);
      onClose(); // Close the modal after successful selection
    } catch (error) {
      console.error("Error selecting copies for removal:", error);
      alert("Error selecting copies for removal. Please try again.");
    } finally {
      setRemoving(false);
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

  if (copies.length === 0) {
    return (
      <div className="text-center py-5">
        <FaExclamationTriangle size={48} className="text-warning mb-3" />
        <h5 className="text-muted mb-2">No Available Copies to Select</h5>
        <p className="text-muted" style={{ fontSize: "0.875rem" }}>
          All copies of this book are currently borrowed and cannot be selected for removal.
        </p>
        <button className="btn btn-secondary btn-sm mt-3" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0" style={{ fontSize: "1rem" }}>
          <FaCheck className="me-2 text-primary" size={16} />
          Select Copies for Removal
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
        </div>
      </div>

      {/* Warning Alert */}
      <div className="alert alert-info d-flex align-items-center mb-3" style={{ fontSize: "0.875rem" }}>
        <FaExclamationTriangle className="me-2" size={16} />
        <div>
          <strong>Note:</strong> Select the copies you want to mark for removal. Only available copies can be selected. 
          Borrowed copies must be returned before they can be removed.
        </div>
      </div>

      {/* Book Summary */}
      <div className="card mb-3" style={{ backgroundColor: "#f8f9fa", border: "none" }}>
        <div className="card-body p-3">
          <h6 className="card-title mb-2" style={{ fontSize: "0.9rem" }}>
            <FaBook className="me-2 text-primary" size={14} />
            {book.book_title}
          </h6>
          <div className="row text-center">
            <div className="col-3">
              <div className="border-end pe-3">
                <div className="fw-bold text-primary" style={{ fontSize: "1.2rem" }}>
                  {book.totalCopies}
                </div>
                <small className="text-muted">Total Copies</small>
              </div>
            </div>
            <div className="col-3">
              <div className="border-end pe-3">
                <div className="fw-bold text-success" style={{ fontSize: "1.2rem" }}>
                  {book.availableCopies}
                </div>
                <small className="text-muted">Available</small>
              </div>
            </div>
            <div className="col-3">
              <div className="border-end pe-3">
                <div className="fw-bold text-warning" style={{ fontSize: "1.2rem" }}>
                  {book.borrowedCopies}
                </div>
                <small className="text-muted">Borrowed</small>
              </div>
            </div>
            <div className="col-3">
              <div>
                <div className="fw-bold text-danger" style={{ fontSize: "1.2rem" }}>
                  {book.removedCopies}
                </div>
                <small className="text-muted">Removed</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* Available copies (selectable) */}
        {copies.map((copy) => (
          <div key={copy.id} className="col-lg-3 col-md-6">
            <div
              className={`card ${selectedCopies.includes(copy.id) ? "border-danger" : ""}`}
              style={{
                border: selectedCopies.includes(copy.id)
                  ? "2px solid #dc3545"
                  : "none",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                transition: "all 0.2s ease",
                cursor: "pointer",
                backgroundColor: selectedCopies.includes(copy.id)
                  ? "#fff5f5"
                  : "white",
              }}
              onClick={() => handleCopySelection(copy.id)}
            >
              <div
                className="card-body text-center p-3"
                style={{ minHeight: 200 }}
              >
                <div className="text-center mb-3">
                  <h6
                    className="fw-bold"
                    style={{ fontSize: "1rem", marginBottom: "0.5rem" }}
                  >
                    Copy #{copy.book_number}
                  </h6>
                  <span
                    className="badge bg-success"
                    style={{ fontSize: "0.75rem" }}
                  >
                    Available
                  </span>
                </div>
                
                <div className="mb-3">
                  <div
                    className="mx-auto d-flex align-items-center justify-content-center"
                    style={{
                      width: "100px",
                      height: "100px",
                      border: selectedCopies.includes(copy.id) 
                        ? "3px solid #dc3545" 
                        : "2px solid #e9ecef",
                      borderRadius: "50%",
                      backgroundColor: selectedCopies.includes(copy.id) 
                        ? "#fff5f5" 
                        : "#f8f9fa",
                      color: selectedCopies.includes(copy.id) 
                        ? "#dc3545" 
                        : "#6c757d",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {selectedCopies.includes(copy.id) ? (
                      <FaCheck size={32} />
                    ) : (
                      <FaBook size={32} />
                    )}
                  </div>
                </div>
                
                <div className="d-flex justify-content-center">
                  <small
                    className={selectedCopies.includes(copy.id) 
                      ? "text-danger fw-medium" 
                      : "text-primary fw-medium"
                    }
                    style={{ fontSize: "0.75rem" }}
                  >
                    {selectedCopies.includes(copy.id)
                      ? "Selected for Removal"
                      : "Click to Select"}
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* Removed copies (not selectable) */}
        {removedCopiesList.map((copy) => (
          <div key={copy.id} className="col-lg-3 col-md-6">
            <div
              className="card border-danger"
              style={{
                border: "2px solid #dc3545",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                backgroundColor: "#fff5f5",
                color: "#dc3545",
                cursor: "not-allowed",
                opacity: 0.7,
              }}
            >
              <div className="card-body text-center p-3" style={{ minHeight: 200 }}>
                <div className="text-center mb-3">
                  <h6 className="fw-bold" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
                    Copy #{copy.book_number}
                  </h6>
                  <span className="badge bg-danger" style={{ fontSize: "0.75rem" }}>
                    Removed
                  </span>
                </div>
                <div className="mb-3">
                  <div
                    className="mx-auto d-flex align-items-center justify-content-center"
                    style={{
                      width: "100px",
                      height: "100px",
                      border: "3px solid #dc3545",
                      borderRadius: "50%",
                      backgroundColor: "#fff5f5",
                      color: "#dc3545",
                    }}
                  >
                    <FaTrash size={32} />
                  </div>
                </div>
                <div className="d-flex justify-content-center">
                  <small className="text-danger fw-medium" style={{ fontSize: "0.75rem" }}>
                    Already Removed
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCopies.length > 0 && (
        <div
          className="mt-3 p-3 bg-light rounded border border-primary"
          style={{ borderRadius: "12px", backgroundColor: "#f0f8ff !important" }}
        >
          <h6 className="mb-2 text-primary" style={{ fontSize: "0.875rem" }}>
            <FaCheck className="me-2" size={14} />
            Selection Preview
          </h6>
          <p className="mb-2" style={{ fontSize: "0.8rem" }}>
            You are about to select {selectedCopies.length} out of {copies.length} available copies for removal:
          </p>
          <div className="d-flex flex-wrap gap-1 mb-2">
            {selectedCopies
              .map(copyId => copies.find(c => c.id === copyId))
              .filter(copy => copy)
              .sort((a, b) => a.book_number - b.book_number)
              .map((copy) => (
                <span
                  key={copy.id}
                  className="badge bg-primary"
                  style={{ fontSize: "0.7rem" }}
                >
                  Copy #{copy.book_number}
                </span>
              ))}
          </div>
          <small className="text-muted" style={{ fontSize: "0.75rem" }}>
            These copies will be marked for removal and can be processed later.
          </small>
        </div>
      )}

      {/* Action Buttons */}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          className="btn btn-secondary btn-sm"
          onClick={onClose}
          disabled={removing}
          style={{ fontSize: "0.875rem", padding: "8px 16px" }}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSelectForRemoval}
          disabled={selectedCopies.length === 0 || removing}
          style={{ fontSize: "0.875rem", padding: "8px 16px" }}
        >
          {removing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" style={{ width: "1rem", height: "1rem" }} />
              Selecting Copies...
            </>
          ) : (
            <>
              <FaCheck className="me-2" size={14} />
              Select {selectedCopies.length} {selectedCopies.length === 1 ? 'Copy' : 'Copies'} for Removal
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ViewBookRemoveCopies;
