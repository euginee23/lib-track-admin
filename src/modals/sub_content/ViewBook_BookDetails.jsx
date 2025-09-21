import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  FaBook,
  FaUser,
  FaBuilding,
  FaCalendar,
  FaLayerGroup,
  FaMapMarkerAlt,
  FaDollarSign,
  FaHeart,
  FaImage,
} from "react-icons/fa";
import { getBookDetails } from "../../../api/manage_books/get_bookDetails";
import { updateBooks } from "../../../api/manage_books/update_books";
import ToastNotification from "../../components/ToastNotification";

function ViewBookBookDetails({ batchRegistrationKey }) {
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedBook, setEditedBook] = useState({});
  const [showQuantityInput, setShowQuantityInput] = useState(false);
  const [quantityToAdd, setQuantityToAdd] = useState(0);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        setError(null); 
        const details = await getBookDetails();
        const book = details.find(
          (b) => b.batch_registration_key === batchRegistrationKey
        );
        if (book && book.book_cover && book.book_cover.data) {
          const uint8Array = new Uint8Array(book.book_cover.data);
          let binaryString = '';
          const chunkSize = 0x8000; 
          
          for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.subarray(i, i + chunkSize);
            binaryString += String.fromCharCode.apply(null, chunk);
          }
          
          const base64String = `data:image/jpeg;base64,${btoa(binaryString)}`;
          book.cover = base64String;
        }
        setBookDetails(book);
        setEditedBook(book || {});
      } catch (err) {
        console.error("Error fetching book details:", err);
        setError("Failed to load book details.");
      } finally {
        setLoading(false);
      }
    };

    if (batchRegistrationKey) {
      fetchBookDetails();
    }
  }, [batchRegistrationKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedBook((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Get only the fields that have actually changed
      const changedFields = {};
      Object.keys(editedBook).forEach((key) => {
        if (editedBook[key] !== bookDetails[key]) {
          changedFields[key] = editedBook[key];
        }
      });

      // Check if there are any changes
      if (Object.keys(changedFields).length === 0) {
        ToastNotification.info("No changes have been made.");
        setLoading(false);
        return;
      }

      await updateBooks(batchRegistrationKey, changedFields);
      ToastNotification.success("Changes saved successfully.");
      
      // Update the bookDetails with the new values
      setBookDetails(prev => ({ ...prev, ...changedFields }));
      setEditMode(false);
    } catch (err) {
      ToastNotification.error("Failed to save changes.");
      setError(err.message || "An error occurred while saving changes.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedBook(bookDetails || {});
    setEditMode(false);
  };

  const handleAddQuantity = async () => {
    try {
      setLoading(true);
      const updatedFields = { quantity: bookDetails.quantity + quantityToAdd };
      await updateBooks(batchRegistrationKey, updatedFields);
      setBookDetails((prev) => ({ ...prev, quantity: prev.quantity + quantityToAdd }));
      setShowQuantityInput(false);
    } catch (err) {
      setError(err.message || "An error occurred while adding quantity.");
    } finally {
      setLoading(false);
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
  if (error) return <div>{error}</div>;
  if (!bookDetails) return <div>No book details found.</div>;

  if (!bookDetails || (!bookDetails.copies && !bookDetails.quantity)) {
    console.error("bookDetails or copies/quantity is undefined:", bookDetails);
    return <div>No book details or copies/quantity found.</div>;
  }

  return (
    <div className="row g-3">
      {/* Book Cover Card */}
      <div className="col-md-3">
        <div
          className="card h-100"
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
              <FaImage className="me-1" size={14} />
              Book Cover
            </h6>
            <div className="d-flex justify-content-center mb-3">
              {bookDetails?.cover ? (
                <img
                  src={bookDetails.cover}
                  alt={`Cover of ${bookDetails?.title || "Book"}`}
                  style={{
                    width: "180px",
                    height: "240px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "2px solid #dee2e6",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                style={{
                  width: "200px",
                  height: "400px",
                  backgroundColor: "#e9ecef",
                  borderRadius: "8px",
                  border: "2px solid #dee2e6",
                  display: bookDetails?.cover ? "none" : "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#6c757d",
                  padding: "10px",
                }}
              >
                <FaBook size={30} className="mb-2" />
                <span
                  style={{
                    fontSize: "0.7rem",
                    textAlign: "center",
                    lineHeight: "1.2",
                  }}
                >
                  No Cover Available
                </span>
              </div>
            </div>
            {editMode && (
              <div className="mt-2">
                <button
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: "0.75rem", width: "100%" }}
                  onClick={() => {
                    const fileInput = document.createElement("input");
                    fileInput.type = "file";
                    fileInput.accept = "image/*";
                    fileInput.onchange = (event) => {
                      const file = event.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setEditedBook((prev) => ({
                            ...prev,
                            cover: e.target.result,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    fileInput.click();
                  }}
                >
                  Change
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side information cards */}
      <div className="col-md-9">
        <div className="row g-3">
          {/* Basic Information Card */}
          <div className="col-md-6">
            <div
              className="card h-100"
              style={{
                border: "none",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6
                    className="card-title text-muted mb-0"
                    style={{ fontSize: "0.875rem" }}
                  >
                    <FaBook className="me-1" size={14} />
                    Basic Information
                  </h6>
                </div>
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
                      <span
                        className="text-muted"
                        style={{ minWidth: "120px" }}
                      >
                        Title:
                      </span>
                      {editMode ? (
                        <input
                          name="book_title"
                          className="form-control form-control-sm"
                          style={{ flex: "1", marginLeft: "10px" }}
                          value={editedBook?.book_title || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="fw-medium">
                          {bookDetails?.book_title || "N/A"}
                        </span>
                      )}
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
                      <span
                        className="text-muted"
                        style={{ minWidth: "120px" }}
                      >
                        <FaUser className="me-1" size={12} />
                        Author:
                      </span>
                      {editMode ? (
                        <input
                          name="author"
                          className="form-control form-control-sm"
                          style={{ flex: "1", marginLeft: "10px" }}
                          value={editedBook?.author || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="fw-medium">
                          {bookDetails?.author || "N/A"}
                        </span>
                      )}
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
                      <span
                        className="text-muted"
                        style={{ minWidth: "120px" }}
                      >
                        <FaLayerGroup className="me-1" size={12} />
                        Genre:
                      </span>
                      {editMode ? (
                        <input
                          name="genre"
                          className="form-control form-control-sm"
                          style={{ flex: "1", marginLeft: "10px" }}
                          value={editedBook?.genre || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="fw-medium">
                          {bookDetails?.genre || "N/A"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Publication Details Card */}
          <div className="col-md-6">
            <div
              className="card h-100"
              style={{
                border: "none",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
              }}
            >
              <div className="card-body p-3">
                <h6
                  className="card-title text-muted mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  <FaBuilding className="me-1" size={14} />
                  Publication Details
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
                      <span
                        className="text-muted"
                        style={{ minWidth: "120px" }}
                      >
                        Publisher:
                      </span>
                      {editMode ? (
                        <input
                          name="publisher"
                          className="form-control form-control-sm"
                          style={{ flex: "1", marginLeft: "10px" }}
                          value={editedBook?.publisher || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="fw-medium">
                          {bookDetails?.publisher || "N/A"}
                        </span>
                      )}
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
                      <span
                        className="text-muted"
                        style={{ minWidth: "120px" }}
                      >
                        Edition:
                      </span>
                      {editMode ? (
                        <input
                          name="book_edition"
                          className="form-control form-control-sm"
                          style={{ flex: "1", marginLeft: "10px" }}
                          value={editedBook?.book_edition || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="fw-medium">
                          {bookDetails?.book_edition || "N/A"}
                        </span>
                      )}
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
                      <span
                        className="text-muted"
                        style={{ minWidth: "120px" }}
                      >
                        <FaCalendar className="me-1" size={12} />
                        Year:
                      </span>
                      {editMode ? (
                        <input
                          name="book_year"
                          className="form-control form-control-sm"
                          style={{ flex: "1", marginLeft: "10px" }}
                          value={editedBook?.book_year || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="fw-medium">
                          {bookDetails?.book_year || "N/A"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Library Information Card */}
          <div className="col-md-6">
            <div
              className="card h-100"
              style={{
                border: "none",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
              }}
            >
              <div className="card-body p-3">
                <h6
                  className="card-title text-muted mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  <FaMapMarkerAlt className="me-1" size={14} />
                  Library Information
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
                      <span
                        className="text-muted"
                        style={{ minWidth: "120px" }}
                      >
                        Shelf Location:
                      </span>
                      {editMode ? (
                        <div className="d-flex gap-2">
                          <input
                            name="shelf_column"
                            className="form-control form-control-sm"
                            style={{ flex: "1", marginLeft: "10px" }}
                            value={editedBook?.shelf_column || ""}
                            onChange={handleChange}
                          />
                          <input
                            name="shelf_row"
                            className="form-control form-control-sm"
                            style={{ flex: "1", marginLeft: "10px" }}
                            value={editedBook?.shelf_row || ""}
                            onChange={handleChange}
                          />
                        </div>
                      ) : (
                        <span className="fw-medium">
                          {bookDetails?.shelf_number
                            ? `Shelf ${bookDetails.shelf_number} (${bookDetails.shelf_column || "N/A"}-${bookDetails.shelf_row || "N/A"})`
                            : "TBA"}
                        </span>
                      )}
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
                      <span className="text-muted">Total Copies:</span>
                      {editMode ? (
                        <div className="d-flex align-items-center gap-2">
                          <button
                            className="btn btn-sm btn-secondary"
                            style={{ width: "32px" }}
                            onClick={() => {
                              const currentQuantity =
                                editedBook?.quantity || bookDetails.quantity;
                              if (currentQuantity > 1) {
                                setEditedBook((prev) => ({
                                  ...prev,
                                  quantity: currentQuantity - 1,
                                }));
                              }
                            }}
                            disabled={
                              editedBook?.quantity <= 1 || bookDetails.quantity <= 1
                            }
                          >
                            -
                          </button>
                          <span className="badge bg-info">
                            {editedBook?.quantity || bookDetails.quantity}
                          </span>
                          {showQuantityInput ? (
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                style={{ width: "80px" }}
                                value={quantityToAdd}
                                onChange={(e) =>
                                  setQuantityToAdd(
                                    parseInt(e.target.value, 10) || 0
                                  )
                                }
                              />
                              <button
                                className="btn btn-sm btn-success"
                                onClick={handleAddQuantity}
                              >
                                Add
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => setShowQuantityInput(false)}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn btn-sm btn-success"
                              style={{ width: "32px" }}
                              onClick={() => setShowQuantityInput(true)}
                            >
                              +
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="badge bg-info">
                          {bookDetails?.quantity || bookDetails.quantity}
                        </span>
                      )}
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
                      <span
                        className="text-muted"
                        style={{ minWidth: "120px" }}
                      >
                        <FaHeart className="me-1" size={12} />
                        Donor:
                      </span>
                      {editMode ? (
                        <input
                          name="book_donor"
                          className="form-control form-control-sm"
                          style={{ flex: "1", marginLeft: "10px" }}
                          value={editedBook?.book_donor || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="fw-medium">
                          {bookDetails?.book_donor || "Anonymous"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information Card */}
          <div className="col-md-6">
            <div
              className="card h-100"
              style={{
                border: "none",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
              }}
            >
              <div className="card-body p-3">
                <h6
                  className="card-title text-muted mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  <FaDollarSign className="me-1" size={14} />
                  Financial Information
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
                      <span
                        className="text-muted"
                        style={{ minWidth: "120px" }}
                      >
                        Price:
                      </span>
                      {editMode ? (
                        <input
                          name="book_price"
                          className="form-control form-control-sm"
                          style={{ flex: "1", marginLeft: "10px" }}
                          value={editedBook?.book_price || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="fw-bold text-success">
                          {new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                          }).format(bookDetails?.book_price || 0)}
                        </span>
                      )}
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
                      <span className="text-muted">Available:</span>
                      <span className="badge bg-success">
                        {bookDetails.copies
                          ? bookDetails.copies.filter((c) => c.status === "Available")
                              .length
                          : bookDetails.quantity}
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
                      <span className="text-muted">Borrowed:</span>
                      <span className="badge bg-warning">
                        {bookDetails.copies
                          ? bookDetails.copies.filter((c) => c.status === "Borrowed")
                              .length
                          : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Mode Action Buttons */}
      <div className="col-12 mt-3 d-flex gap-2 justify-content-end">
        {editMode ? (
          <>
            <button
              className="btn btn-sm btn-success"
              style={{ width: "100px" }}
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="btn btn-sm btn-secondary"
              style={{ width: "100px" }}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            className="btn btn-sm btn-primary"
            style={{ width: "100px" }}
            onClick={() => setEditMode(true)}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}

ViewBookBookDetails.propTypes = {
  batchRegistrationKey: PropTypes.string.isRequired,
};

export default ViewBookBookDetails;
