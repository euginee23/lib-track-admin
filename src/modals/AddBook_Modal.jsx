import React, { useState, useEffect } from "react";
import SelectShelfLocation from "../components/SelectShelfLocation";
import { addBook } from "../../api/manage_books/add_books";
import ToastNotification from "../components/ToastNotification";
import { getDepartments } from "../../api/settings/get_departments";

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
  const [currentAuthor, setCurrentAuthor] = useState("");
  const [authors, setAuthors] = useState([]);
  const [currentPublisher, setCurrentPublisher] = useState("");
  const [publishers, setPublishers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [useDepartmentInstead, setUseDepartmentInstead] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      if (show) {
        try {
          const data = await getDepartments();
          setDepartments(data);
        } catch (error) {
          console.error("Error fetching departments:", error);
          ToastNotification.error("Failed to load departments");
        }
      }
    };

    fetchDepartments();
  }, [show]);

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

  const addAuthor = () => {
    if (currentAuthor.trim() && !authors.includes(currentAuthor.trim())) {
      const updatedAuthors = [...authors, currentAuthor.trim()];
      setAuthors(updatedAuthors);
      setCurrentAuthor("");
      handleChange({
        target: {
          name: "author",
          value: updatedAuthors.join(", "),
        },
      });
      handleChange({
        target: {
          name: "authors",
          value: updatedAuthors,
        },
      });
    }
  };

  const removeAuthor = (indexToRemove) => {
    const updatedAuthors = authors.filter(
      (_, index) => index !== indexToRemove
    );
    setAuthors(updatedAuthors);
    handleChange({
      target: {
        name: "author",
        value: updatedAuthors.join(", "),
      },
    });
    handleChange({
      target: {
        name: "authors",
        value: updatedAuthors,
      },
    });
  };

  const addPublisher = () => {
    if (currentPublisher.trim() && !publishers.includes(currentPublisher.trim())) {
      const updatedPublishers = [...publishers, currentPublisher.trim()];
      setPublishers(updatedPublishers);
      setCurrentPublisher("");
      handleChange({
        target: {
          name: "publisher",
          value: updatedPublishers.join(", "),
        },
      });
      handleChange({
        target: {
          name: "publishers",
          value: updatedPublishers,
        },
      });
    }
  };

  const removePublisher = (indexToRemove) => {
    const updatedPublishers = publishers.filter(
      (_, index) => index !== indexToRemove
    );
    setPublishers(updatedPublishers);
    handleChange({
      target: {
        name: "publisher",
        value: updatedPublishers.join(", "),
      },
    });
    handleChange({
      target: {
        name: "publishers",
        value: updatedPublishers,
      },
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAuthor();
    }
  };

  const handlePublisherKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPublisher();
    }
  };

  const resetModal = () => {
    setTouched({});
    setSelectedShelfLocation(null);
    setAuthors([]);
    setCurrentAuthor("");
    setPublishers([]);
    setCurrentPublisher("");
    setUseDepartmentInstead(false);
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"][accept="image/*"]');
    if (fileInput) {
      fileInput.value = "";
    }
    
    handleChange({ target: { name: "reset", value: {} } });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    // Validate required fields
    const requiredFields = [
      "title",
      "shelfLocationId",
    ];
    
    // Add genre or department validation
    if (useDepartmentInstead) {
      requiredFields.push("department");
    } else {
      requiredFields.push("genre");
    }
    const missingFields = requiredFields.filter(
      (field) => !newBook[field] || (typeof newBook[field] === "string" && newBook[field].trim() === "")
    );

    // Check if at least one author is added
    if (authors.length === 0) {
      ToastNotification.error("At least one author is required.");
      setLoading(false);
      return;
    }

    // Check if at least one publisher is added
    if (publishers.length === 0) {
      ToastNotification.error("At least one publisher is required.");
      setLoading(false);
      return;
    }

    // Validate book cover
    if (!newBook.cover) {
      ToastNotification.error("Book cover is required.");
      setLoading(false);
      return;
    }

    if (
      !["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"].includes(newBook.cover.type)
    ) {
      ToastNotification.error(
        "Invalid book cover format. Only JPEG, PNG, GIF, and WEBP are allowed."
      );
      setLoading(false);
      return;
    }

    if (newBook.cover.size > 30 * 1024 * 1024) {
      ToastNotification.error("Book cover size exceeds the 30MB limit.");
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
      genre: useDepartmentInstead ? "" : (newBook.genre || "General"),
      department: useDepartmentInstead ? newBook.department : "",
      useDepartmentInstead: useDepartmentInstead,
      publisher: publishers.join(", "),
      publishers: [...publishers],
      author: authors.join(", "),
      authors: [...authors],
    };

    try {
      console.log("Saving book with data:", {
        ...processedBook,
        cover: processedBook.cover ? {
          name: processedBook.cover.name,
          size: processedBook.cover.size,
          type: processedBook.cover.type
        } : null
      });

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
      console.error("Full error details:", {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      let errorMessage = "Unknown error occurred";
      if (err.message) {
        if (err.message.includes("Failed to add book:")) {
          errorMessage = err.message;
        } else if (err.message.includes("Load Failed")) {
          errorMessage = "Network error or server timeout. Please check your connection and try again.";
        } else if (err.message.includes("413") || err.message.includes("Payload Too Large")) {
          errorMessage = "Image file is too large. Please use a smaller image (max 30MB).";
        } else if (err.message.includes("timeout")) {
          errorMessage = "Request timed out. Please try again with a smaller image.";
        } else {
          errorMessage = err.message;
        }
      }
      
      ToastNotification.error(`Failed to add book: ${errorMessage}`);
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
                      <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                        All image formats supported up to 30MB
                      </small>
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
                            Author(s) <span className="text-danger">*</span>
                          </h6>
                        </div>
                        <div className="card-body p-3">
                          <div className="input-group input-group-sm">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Enter author name"
                              value={currentAuthor}
                              onChange={(e) => setCurrentAuthor(e.target.value)}
                              onKeyPress={handleKeyPress}
                              style={{ fontSize: "0.8rem" }}
                            />
                            <button
                              className="btn btn-success"
                              type="button"
                              onClick={addAuthor}
                              disabled={!currentAuthor.trim()}
                            >
                              Add
                            </button>
                          </div>
                          {authors.length === 0 && touched.author && (
                            <div
                              className="text-danger small mt-1"
                              style={{ fontSize: "0.7rem" }}
                            >
                              At least one author is required
                            </div>
                          )}

                          {/* Authors List */}
                          {authors.length > 0 && (
                            <div className="mt-2">
                              <small
                                className="text-muted"
                                style={{ fontSize: "0.7rem" }}
                              >
                                Added Authors:
                              </small>
                              <div className="d-flex flex-wrap gap-1 mt-1">
                                {authors.map((author, index) => (
                                  <span
                                    key={index}
                                    className="badge bg-light text-dark border d-flex align-items-center"
                                    style={{ fontSize: "0.7rem" }}
                                  >
                                    {author}
                                    <button
                                      type="button"
                                      className="btn-close btn-close-sm ms-2"
                                      style={{ fontSize: "0.6rem" }}
                                      onClick={() => removeAuthor(index)}
                                    ></button>
                                  </span>
                                ))}
                              </div>
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
                              className={`${useDepartmentInstead ? "bi bi-building" : "bi bi-tags"} me-2`}
                              style={{ fontSize: "0.75rem" }}
                            ></i>
                            {useDepartmentInstead ? "Department" : "Genre"} <span className="text-danger">*</span>
                          </h6>
                        </div>
                        <div className="card-body p-3">
                          {/* Checkbox to toggle between genre and department */}
                          <div className="form-check mb-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="useDepartmentCheck"
                              checked={useDepartmentInstead}
                              onChange={(e) => {
                                setUseDepartmentInstead(e.target.checked);
                                // Clear the other field when switching
                                if (e.target.checked) {
                                  handleChange({ target: { name: "genre", value: "" } });
                                } else {
                                  handleChange({ target: { name: "department", value: "" } });
                                }
                              }}
                            />
                            <label 
                              className="form-check-label" 
                              htmlFor="useDepartmentCheck"
                              style={{ fontSize: "0.75rem" }}
                            >
                              Use department instead
                            </label>
                          </div>
                          
                          {/* Conditional rendering based on checkbox */}
                          {useDepartmentInstead ? (
                            <>
                              <select
                                name="department"
                                className={`form-select form-select-sm ${
                                  isFieldEmpty("department") ? "is-invalid" : ""
                                }`}
                                value={newBook.department || ""}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                style={{ fontSize: "0.8rem" }}
                                required
                              >
                                <option value="">Select Department</option>
                                {departments.map((department) => (
                                  <option 
                                    key={department.department_id} 
                                    value={department.department_id}
                                  >
                                    {department.department_name}
                                  </option>
                                ))}
                              </select>
                              {isFieldEmpty("department") && (
                                <div
                                  className="invalid-feedback"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  Department is required
                                </div>
                              )}
                            </>
                          ) : (
                            <>
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
                            </>
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
                            Publisher(s) <span className="text-danger">*</span>
                          </h6>
                        </div>
                        <div className="card-body p-3">
                          <div className="input-group input-group-sm">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Enter publisher name"
                              value={currentPublisher}
                              onChange={(e) => setCurrentPublisher(e.target.value)}
                              onKeyPress={handlePublisherKeyPress}
                              style={{ fontSize: "0.8rem" }}
                            />
                            <button
                              className="btn btn-success"
                              type="button"
                              onClick={addPublisher}
                              disabled={!currentPublisher.trim()}
                            >
                              Add
                            </button>
                          </div>
                          {publishers.length === 0 && touched.publisher && (
                            <div
                              className="text-danger small mt-1"
                              style={{ fontSize: "0.7rem" }}
                            >
                              At least one publisher is required
                            </div>
                          )}

                          {/* Publishers List */}
                          {publishers.length > 0 && (
                            <div className="mt-2">
                              <small
                                className="text-muted"
                                style={{ fontSize: "0.7rem" }}
                              >
                                Added Publishers:
                              </small>
                              <div className="d-flex flex-wrap gap-1 mt-1">
                                {publishers.map((publisher, index) => (
                                  <span
                                    key={index}
                                    className="badge bg-light text-dark border d-flex align-items-center"
                                    style={{ fontSize: "0.7rem" }}
                                  >
                                    {publisher}
                                    <button
                                      type="button"
                                      className="btn-close btn-close-sm ms-2"
                                      style={{ fontSize: "0.6rem" }}
                                      onClick={() => removePublisher(index)}
                                    ></button>
                                  </span>
                                ))}
                              </div>
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
