import React, { useState } from "react";

function AddBookModal({
  show,
  onClose,
  onSave,
  newBook,
  handleChange,
  handleFileChange,
}) {
  const [touched, setTouched] = useState({});

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
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    // Allow empty string, numbers, and decimal points
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      handleChange(e);
    }
  };

  const handlePriceBlur = (e) => {
    const value = e.target.value;
    if (value === "" || value === "0" || value === "0.") {
      handleChange({
        target: {
          name: 'price',
          value: '0'
        }
      });
    }
    handleBlur(e);
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-sm-down" style={{ maxWidth: "70%" }}>
        <div className="modal-content shadow border-0" style={{ minHeight: "75vh" }}>
          {/* Header */}
          <div className="modal-header py-1 wmsu-bg-primary text-white">
            <h6 className="modal-title fw-semibold mb-0">
              <i className="bi bi-book me-1"></i>
              Add Book
            </h6>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body small p-3">
            {/* Introduction text */}
            <p className="text-muted mb-2 small">
              Fill in the book details below. <span className="text-danger">*</span> indicates required fields.
            </p>
            
            <div className="row g-0">
              {/* Left side - Cover image upload (30%) */}
              <div className="col-md-4 col-lg-3 mb-2 pe-3">
                <div className="form-group h-100 d-flex flex-column">
                  <label className="form-label fw-semibold small mb-1">Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control form-control-sm mb-2"
                    onChange={handleFileChange}
                  />
                  <div 
                    className="border rounded p-3 bg-light flex-grow-1 d-flex align-items-center justify-content-center"
                    style={{ minHeight: "350px" }}
                  >
                    {newBook.cover ? (
                      <img
                        src={URL.createObjectURL(newBook.cover)}
                        alt="Book cover preview"
                        className="img-fluid rounded"
                        style={{ maxHeight: "320px", maxWidth: "100%" }}
                      />
                    ) : (
                      <div className="text-center text-muted">
                        <i className="bi bi-image fs-1 d-block mb-3 opacity-50"></i>
                        <span className="small">Book cover preview</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Vertical separator */}
              <div className="col-md-auto">
                <div className="vr h-100"></div>
              </div>
              
              {/* Right side - Form inputs (70%) */}
              <div className="col-md ps-3">
                <div className="row g-2">
                  {/* Title */}
                  <div className="col-md-12">
                    <div className="form-group mb-2">
                      <label className="form-label fw-semibold small mb-1">
                        Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        className={`form-control form-control-sm ${isFieldEmpty("title") ? "is-invalid" : ""}`}
                        placeholder="Enter book title"
                        value={newBook.title || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      />
                      {isFieldEmpty("title") && <div className="invalid-feedback small">Required</div>}
                    </div>
                  </div>
                  
                  {/* Author, Genre in second row */}
                  <div className="col-md-6">
                    <div className="form-group mb-2">
                      <label className="form-label fw-semibold small mb-1">
                        Author <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="author"
                        className={`form-control form-control-sm ${isFieldEmpty("author") ? "is-invalid" : ""}`}
                        placeholder="Enter author name"
                        value={newBook.author || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      />
                      {isFieldEmpty("author") && <div className="invalid-feedback small">Required</div>}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group mb-2">
                      <label className="form-label fw-semibold small mb-1">Genre</label>
                      <input
                        type="text"
                        name="genre"
                        className="form-control form-control-sm"
                        placeholder="Fiction, Non-fiction, etc."
                        value={newBook.genre || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  {/* Publisher in third row */}
                  <div className="col-md-6">
                    <div className="form-group mb-2">
                      <label className="form-label fw-semibold small mb-1">Publisher</label>
                      <input
                        type="text"
                        name="publisher"
                        className="form-control form-control-sm"
                        placeholder="Publisher name"
                        value={newBook.publisher || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  {/* Edition and Year in third row */}
                  <div className="col-md-3">
                    <div className="form-group mb-2">
                      <label className="form-label fw-semibold small mb-1">Edition</label>
                      <input
                        type="text"
                        name="edition"
                        className="form-control form-control-sm"
                        placeholder="1st, 2nd, etc."
                        value={newBook.edition || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-3">
                    <div className="form-group mb-2">
                      <label className="form-label fw-semibold small mb-1">Year</label>
                      <input
                        type="number"
                        name="year"
                        className="form-control form-control-sm"
                        placeholder="Year"
                        value={newBook.year || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  {/* Fourth row - Qty, Shelf, Price */}
                  <div className="col-md-4">
                    <div className="form-group mb-2">
                      <label className="form-label fw-semibold small mb-1">
                        Qty <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        className={`form-control form-control-sm ${isFieldEmpty("quantity") ? "is-invalid" : ""}`}
                        placeholder="Copies"
                        value={newBook.quantity || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      />
                      {isFieldEmpty("quantity") && <div className="invalid-feedback small">Required</div>}
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="form-group mb-2">
                      <label className="form-label fw-semibold small mb-1">Shelf</label>
                      <input
                        type="text"
                        name="shelf"
                        className="form-control form-control-sm"
                        placeholder="Location"
                        value={newBook.shelf || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="form-group mb-2">
                      <label className="form-label fw-semibold small mb-1">Price</label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text">₱</span>
                        <input
                          type="text"
                          name="price"
                          className="form-control form-control-sm"
                          placeholder="0.00"
                          value={newBook.price || ""}
                          onChange={handlePriceChange}
                          onBlur={handlePriceBlur}
                        />
                      </div>
                      <small className="text-muted">
                        Display: {formatPrice(newBook.price)}
                      </small>
                    </div>
                  </div>
                  
                  {/* Fifth row - Donor */}
                  <div className="col-md-12">
                    <div className="form-group mb-2">
                      <label className="form-label fw-semibold small mb-1">Donor <small className="text-muted">(Optional)</small></label>
                      <input
                        type="text"
                        name="donor"
                        className="form-control form-control-sm"
                        placeholder="Donated by (Person or organization who donated this book) - Leave empty if purchased"
                        value={newBook.donor || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer py-2">
            <button className="btn btn-sm btn-light" onClick={onClose}>
              <i className="bi bi-x-circle me-1"></i> Cancel
            </button>
            <button className="btn btn-sm wmsu-btn-primary" onClick={onSave}>
              <i className="bi bi-save me-1"></i> Save Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddBookModal;
