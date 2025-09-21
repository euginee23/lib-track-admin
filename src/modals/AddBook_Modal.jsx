import React, { useState } from "react";
import SelectShelfLocation from "../components/SelectShelfLocation";
import { addBook } from "../../api/manage_books/add_books";
import ToastNotification from "../components/ToastNotification";

function AddBookModal({
  show,
  onClose,
  onSave,
  newBook,
  handleChange,
  handleFileChange,
}) {
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showShelfSelector, setShowShelfSelector] = useState(false);
  const [selectedShelfLocation, setSelectedShelfLocation] = useState(null);

  if (!show) return null;

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const isFieldEmpty = (name) => {
    return touched[name] && (!newBook[name] || newBook[name] === "");
  };

  const formatPrice = (value) => {
    if (!value || value === "") return "₱ 0.00";
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "₱ 0.00";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      handleChange(e);
    }
  };

  const handlePriceBlur = (e) => {
    const value = e.target.value;
    if (value === "" || value === "0" || value === "0.") {
      handleChange({
        target: {
          name: "price",
          value: "0",
        },
      });
    }
    handleBlur(e);
  };

  const handleShelfLocationSelect = (locationData) => {
    setSelectedShelfLocation(locationData);
    handleChange({ target: { name: "shelfLocationId", value: locationData.book_shelf_loc_id } });
    setShowShelfSelector(false);
  };

  const resetModal = () => {
    setTouched({});
    setSelectedShelfLocation(null);
    handleChange({ target: { name: "reset", value: {} } });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    // Validate required fields
    const requiredFields = [
      "title",
      "author",
      "genre",
      "publisher",
      "shelfLocationId",
    ];
    const missingFields = requiredFields.filter(
      (field) => !newBook[field] || (typeof newBook[field] === "string" && newBook[field].trim() === "")
    );

    // Validate book cover
    if (!newBook.cover) {
      ToastNotification.error("Book cover is required.");
      setLoading(false);
      return;
    }

    if (
      !["image/jpeg", "image/png", "image/gif"].includes(newBook.cover.type)
    ) {
      ToastNotification.error(
        "Invalid book cover format. Only JPEG, PNG, and GIF are allowed."
      );
      setLoading(false);
      return;
    }

    if (newBook.cover.size > 5 * 1024 * 1024) {
      ToastNotification.error("Book cover size exceeds the 5MB limit.");
      setLoading(false);
      return;
    }

    if (missingFields.length > 0) {
      ToastNotification.error(
        `Missing required fields: ${missingFields.join(", ")}`
      );
      setLoading(false);
      return;
    }

    const processedBook = {
      ...newBook,
      genre: newBook.genre || "General",
      publisher: newBook.publisher || "Unknown Publisher",
      author: newBook.author || "Unknown Author",
    };

    try {
      console.log("Saving book with data:", processedBook);

      // Call the addBook API
      await addBook(processedBook);

      // Notify parent component
      if (onSave) {
        onSave(processedBook);
      }

      ToastNotification.success("Book saved successfully!");
      resetModal();
      setLoading(false);
      onClose();
    } catch (err) {
      console.error("Error in handleSave:", err);
      ToastNotification.error(
        `Failed to insert book: ${err.message || "Unknown error"}`
      );
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    resetModal();
    onClose();
  };

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div
          className="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-sm-down"
          style={{ maxWidth: "70%" }}
        >
          <div
            className="modal-content shadow border-0"
            style={{ minHeight: "75vh" }}
          >
            {/* Header */}
            <div className="modal-header py-1 wmsu-bg-primary text-white">
              <h6
                className="modal-title fw-semibold mb-0"
                style={{ fontSize: "0.9rem" }}
              >
                <i
                  className="bi bi-book me-1"
                  style={{ fontSize: "0.8rem" }}
                ></i>
                Add Book
              </h6>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={handleModalClose}
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body small p-3">
              <p className="text-muted mb-3" style={{ fontSize: "0.75rem" }}>
                Fill in the book details below.{" "}
                <span className="text-danger">*</span> indicates required
                fields.
              </p>

              <div className="row g-3">
                {/* Book Cover Card */}
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-light py-2">
                      <h6
                        className="card-title mb-0 fw-semibold"
                        style={{ fontSize: "0.8rem" }}
                      >
                        <i
                          className="bi bi-image me-2"
                          style={{ fontSize: "0.75rem" }}
                        ></i>
                        Book Cover
                      </h6>
                    </div>
                    <div className="card-body p-3">
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control form-control-sm mb-3"
                        style={{ fontSize: "0.75rem" }}
                        onChange={handleFileChange}
                      />
                      <div
                        className="border rounded p-3 bg-light d-flex align-items-center justify-content-center"
                        style={{ minHeight: "300px" }}
                      >
                        {newBook.cover ? (
                          <img
                            src={URL.createObjectURL(newBook.cover)}
                            alt="Book cover preview"
                            className="img-fluid rounded"
                            style={{ maxHeight: "280px", maxWidth: "100%" }}
                          />
                        ) : (
                          <div className="text-center text-muted">
                            <i className="bi bi-image fs-1 d-block mb-3 opacity-50"></i>
                            <span style={{ fontSize: "0.75rem" }}>
                              Book cover preview
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Form inputs */}
                <div className="col-md-8">
                  <div className="row g-3">
                    {/* Title Card */}
                    <div className="col-12">
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-light py-2">
                          <h6
                            className="card-title mb-0 fw-semibold"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <i
                              className="bi bi-book me-2"
                              style={{ fontSize: "0.75rem" }}
                            ></i>
                            Title <span className="text-danger">*</span>
                          </h6>
                        </div>
                        <div className="card-body p-3">
                          <input
                            type="text"
                            name="title"
                            className={`form-control form-control-sm ${
                              isFieldEmpty("title") ? "is-invalid" : ""
                            }`}
                            placeholder="Enter book title"
                            value={newBook.title || ""}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            style={{ fontSize: "0.8rem" }}
                          />
                          {isFieldEmpty("title") && (
                            <div
                              className="invalid-feedback"
                              style={{ fontSize: "0.7rem" }}
                            >
                              Title is required
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Author and Genre Cards */}
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-light py-2">
                          <h6
                            className="card-title mb-0 fw-semibold"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <i
                              className="bi bi-person me-2"
                              style={{ fontSize: "0.75rem" }}
                            ></i>
                            Author <span className="text-danger">*</span>
                          </h6>
                        </div>
                        <div className="card-body p-3">
                          <input
                            type="text"
                            name="author"
                            className={`form-control form-control-sm ${
                              isFieldEmpty("author") ? "is-invalid" : ""
                            }`}
                            placeholder="Enter author name"
                            value={newBook.author || ""}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            style={{ fontSize: "0.8rem" }}
                          />
                          {isFieldEmpty("author") && (
                            <div
                              className="invalid-feedback"
                              style={{ fontSize: "0.7rem" }}
                            >
                              Author is required
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-light py-2">
                          <h6
                            className="card-title mb-0 fw-semibold"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <i
                              className="bi bi-tags me-2"
                              style={{ fontSize: "0.75rem" }}
                            ></i>
                            Genre <span className="text-danger">*</span>
                          </h6>
                        </div>
                        <div className="card-body p-3">
                          <input
                            type="text"
                            name="genre"
                            className={`form-control form-control-sm ${
                              isFieldEmpty("genre") ? "is-invalid" : ""
                            }`}
                            placeholder="Fiction, Non-fiction, etc."
                            value={newBook.genre || ""}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            style={{ fontSize: "0.8rem" }}
                          />
                          {isFieldEmpty("genre") && (
                            <div
                              className="invalid-feedback"
                              style={{ fontSize: "0.7rem" }}
                            >
                              Genre is required
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Publisher and Edition Cards */}
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-light py-2">
                          <h6
                            className="card-title mb-0 fw-semibold"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <i
                              className="bi bi-building me-2"
                              style={{ fontSize: "0.75rem" }}
                            ></i>
                            Publisher <span className="text-danger">*</span>
                          </h6>
                        </div>
                        <div className="card-body p-3">
                          <input
                            type="text"
                            name="publisher"
                            className={`form-control form-control-sm ${
                              isFieldEmpty("publisher") ? "is-invalid" : ""
                            }`}
                            placeholder="Publisher name"
                            value={newBook.publisher || ""}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            style={{ fontSize: "0.8rem" }}
                          />
                          {isFieldEmpty("publisher") && (
                            <div
                              className="invalid-feedback"
                              style={{ fontSize: "0.7rem" }}
                            >
                              Publisher is required
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-light py-2">
                          <h6
                            className="card-title mb-0 fw-semibold"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <i
                              className="bi bi-journal me-2"
                              style={{ fontSize: "0.75rem" }}
                            ></i>
                            Edition & Year
                          </h6>
                        </div>
                        <div className="card-body p-3">
                          <div className="row g-2">
                            <div className="col-6">
                              <input
                                type="text"
                                name="edition"
                                className="form-control form-control-sm"
                                placeholder="1st, 2nd, etc."
                                value={newBook.edition || ""}
                                onChange={handleChange}
                                style={{ fontSize: "0.8rem" }}
                              />
                              <small
                                className="form-text text-muted"
                                style={{ fontSize: "0.7rem" }}
                              >
                                Edition
                              </small>
                            </div>
                            <div className="col-6">
                              <input
                                type="number"
                                name="year"
                                className="form-control form-control-sm"
                                placeholder="Year"
                                value={newBook.year || ""}
                                onChange={handleChange}
                                style={{ fontSize: "0.8rem" }}
                              />
                              <small
                                className="form-text text-muted"
                                style={{ fontSize: "0.7rem" }}
                              >
                                Year
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quantity and Price Cards */}
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-light py-2">
                          <h6
                            className="card-title mb-0 fw-semibold"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <i
                              className="bi bi-stack me-2"
                              style={{ fontSize: "0.75rem" }}
                            ></i>
                            Quantity <span className="text-danger">*</span>
                          </h6>
                        </div>
                        <div className="card-body p-3">
                          <input
                            type="number"
                            name="quantity"
                            className={`form-control form-control-sm ${
                              isFieldEmpty("quantity") ? "is-invalid" : ""
                            }`}
                            placeholder="Number of copies"
                            value={newBook.quantity || ""}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            min="1"
                            style={{ fontSize: "0.8rem" }}
                          />
                          {isFieldEmpty("quantity") && (
                            <div
                              className="invalid-feedback"
                              style={{ fontSize: "0.7rem" }}
                            >
                              Quantity is required
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-light py-2">
                          <h6
                            className="card-title mb-0 fw-semibold"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <i
                              className="bi bi-currency-dollar me-2"
                              style={{ fontSize: "0.75rem" }}
                            ></i>
                            Price
                          </h6>
                        </div>
                        <div className="card-body p-3">
                          <div className="input-group input-group-sm">
                            <span
                              className="input-group-text"
                              style={{ fontSize: "0.8rem" }}
                            >
                              ₱
                            </span>
                            <input
                              type="text"
                              name="price"
                              className="form-control form-control-sm"
                              placeholder="0.00"
                              value={newBook.price || ""}
                              onChange={handlePriceChange}
                              onBlur={handlePriceBlur}
                              style={{ fontSize: "0.8rem" }}
                            />
                          </div>
                          <small
                            className="text-muted"
                            style={{ fontSize: "0.7rem" }}
                          >
                            Display: {formatPrice(newBook.price)}
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Shelf Location Card */}
                    <div className="col-12">
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-light py-2">
                          <h6
                            className="card-title mb-0 fw-semibold"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <i
                              className="bi bi-geo-alt me-2"
                              style={{ fontSize: "0.75rem" }}
                            ></i>
                            Shelf Location{" "}
                            <span className="text-danger">*</span>
                          </h6>
                        </div>
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2">
                                <span
                                  className="text-muted"
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  Selected Shelf Location:
                                </span>
                                <div className="d-flex gap-2">
                                  {selectedShelfLocation ? (
                                    <>
                                      <span
                                        className="badge bg-primary px-3 py-2"
                                        style={{ fontSize: "0.8rem" }}
                                      >
                                        Shelf: {selectedShelfLocation.shelf_number}
                                      </span>
                                      <span
                                        className="badge bg-success px-3 py-2"
                                        style={{ fontSize: "0.8rem" }}
                                      >
                                        Column: {selectedShelfLocation.shelf_column}
                                      </span>
                                      <span
                                        className="badge bg-warning px-3 py-2"
                                        style={{ fontSize: "0.8rem" }}
                                      >
                                        Row: {selectedShelfLocation.shelf_row}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="badge bg-secondary px-3 py-2" style={{ fontSize: "0.8rem" }}>
                                      None
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => setShowShelfSelector(true)}
                              style={{ fontSize: "0.75rem" }}
                            >
                              <i
                                className="bi bi-grid-3x3-gap me-1"
                                style={{ fontSize: "0.7rem" }}
                              ></i>
                              Select Location
                            </button>
                          </div>
                          {(isFieldEmpty("shelfLocationId")) && (
                            <div
                              className="text-danger mt-2"
                              style={{ fontSize: "0.7rem" }}
                            >
                              Shelf location is required
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Donor Card */}
                    <div className="col-12">
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-light py-2">
                          <h6
                            className="card-title mb-0 fw-semibold"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <i
                              className="bi bi-heart me-2"
                              style={{ fontSize: "0.75rem" }}
                            ></i>
                            Donor{" "}
                            <small
                              className="text-muted"
                              style={{ fontSize: "0.7rem" }}
                            >
                              (Optional)
                            </small>
                          </h6>
                        </div>
                        <div className="card-body p-3">
                          <input
                            type="text"
                            name="donor"
                            className="form-control form-control-sm"
                            placeholder="Donated by (Person or organization who donated this book) - Leave empty if purchased"
                            value={newBook.donor || ""}
                            onChange={handleChange}
                            style={{ fontSize: "0.8rem" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer py-2">
              <button
                className="btn btn-sm btn-light"
                onClick={onClose}
                disabled={loading}
              >
                <i className="bi bi-x-circle me-1"></i> Cancel
              </button>
              <button
                className="btn btn-sm wmsu-btn-primary"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-1"></span>
                ) : (
                  <i className="bi bi-save me-1"></i>
                )}
                Save Book
              </button>
              {error && <div className="text-danger small ms-2">{error}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Shelf Location Modal */}
      {showShelfSelector && (
        <SelectShelfLocation
          onLocationSelect={handleShelfLocationSelect}
          showModal={showShelfSelector}
          onCloseModal={() => setShowShelfSelector(false)}
        />
      )}
    </>
  );
}

export default AddBookModal;
