import React, { useState, useEffect } from "react";
import ToastNotification from "../components/ToastNotification";
import SelectShelfLocation from "../components/SelectShelfLocation";
import { getDepartments } from "../../api/settings/get_departments";

function AddResearchModal({
  show,
  onClose,
  onSave,
  newResearch,
  handleChange,
}) {
  const [touched, setTouched] = useState({});
  const [currentAuthor, setCurrentAuthor] = useState("");
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showShelfSelector, setShowShelfSelector] = useState(false);
  const [selectedShelfLocation, setSelectedShelfLocation] = useState(null);
  const [departments, setDepartments] = useState([]);

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
    return (
      touched[name] &&
      (!newResearch[name] || String(newResearch[name]).trim() === "")
    );
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

  const handleShelfLocationSelect = (locationData) => {
    setSelectedShelfLocation(locationData);
    handleChange({
      target: {
        name: "shelfLocationId",
        value: locationData.book_shelf_loc_id,
      },
    });
    setShowShelfSelector(false);
  };

  const resetModal = () => {
    setTouched({});
    setSelectedShelfLocation(null);
    setAuthors([]);
    setCurrentAuthor("");
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    // VALIDATE REQUIRED FIELDS
    const requiredFields = [
      "title",
      "department",
      "shelfLocationId",
      "abstract",
      "year",
    ];
    const missingFields = requiredFields.filter(
      (field) => !newResearch[field] || String(newResearch[field]).trim() === ""
    );

    if (missingFields.length === requiredFields.length && authors.length === 0) {
      ToastNotification.error("Please fill in all required fields.");
      setLoading(false);
      return;
    } else if (authors.length === 0) {
      ToastNotification.error("At least one author is required.");
      setLoading(false);
      return;
    } else if (!newResearch.shelfLocationId) {
      ToastNotification.error("Please select a shelf location.");
      setLoading(false);
      return;
    } else if (missingFields.length > 0) {
      ToastNotification.error(
        `Missing required fields: ${missingFields.join(", ")}`
      );
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...newResearch,
        authors: [...authors],
      };
      delete payload.author;
      await onSave(payload);
      setLoading(false);
      resetModal();
      ToastNotification.success("Research paper added successfully!");
      onClose();
    } catch (err) {
      ToastNotification.error(err.message || "Failed to save research paper.");
      setLoading(false);
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAuthor();
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
            className="modal-content shadow border-0 d-flex flex-column"
            style={{ minHeight: "75vh" }}
          >
            {/* Header */}
            <div className="modal-header py-1 wmsu-bg-primary text-white">
              <h6
                className="modal-title fw-semibold mb-0"
                style={{ fontSize: "0.9rem" }}
              >
                <i
                  className="bi bi-file-text me-1"
                  style={{ fontSize: "0.8rem" }}
                ></i>
                Add Research Paper
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
                Fill in the research paper details below.{" "}
                <span className="text-danger">*</span> indicates required
                fields.
              </p>

              <div className="row g-3">
                {/* Left side - Basic Information */}
                <div className="col-md-5">
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
                              className="bi bi-file-text me-2"
                              style={{ fontSize: "0.75rem" }}
                            ></i>
                            Title <span className="text-danger">*</span>
                          </h6>
                        </div>
                        <div className="card-body p-3">
                          <textarea
                            name="title"
                            className={`form-control form-control-sm ${
                              isFieldEmpty("title") ? "is-invalid" : ""
                            }`}
                            placeholder="Enter research paper title"
                            value={newResearch.title || ""}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            rows="3"
                            style={{ resize: "none", fontSize: "0.8rem" }}
                            required
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

                    {/* Author Card */}
                    <div className="col-12">
                      <div className="card border-0 shadow-sm">
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

                    {/* Year and Price Cards */}
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-light py-2">
                          <h6
                            className="card-title mb-0 fw-semibold"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <i
                              className="bi bi-calendar me-2"
                              style={{ fontSize: "0.75rem" }}
                            ></i>
                            Year
                          </h6>
                        </div>
                        <div className="card-body p-3">
                          <input
                            type="number"
                            name="year"
                            className={`form-control form-control-sm ${
                              isFieldEmpty("year") ? "is-invalid" : ""
                            }`}
                            placeholder="Year of publication"
                            value={newResearch.year || ""}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            style={{ fontSize: "0.8rem" }}
                            required
                          />
                          {isFieldEmpty("year") && (
                            <div
                              className="invalid-feedback"
                              style={{ fontSize: "0.7rem" }}
                            >
                              Year of publication is required
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
                              value={newResearch.price || ""}
                              onChange={handlePriceChange}
                              onBlur={handlePriceBlur}
                              style={{ fontSize: "0.8rem" }}
                            />
                          </div>
                          <small
                            className="text-muted"
                            style={{ fontSize: "0.7rem" }}
                          >
                            Display: {formatPrice(newResearch.price)}
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Department Card */}
                    <div className="col-12">
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-light py-2">
                          <h6
                            className="card-title mb-0 fw-semibold"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <i
                              className="bi bi-building me-2"
                              style={{ fontSize: "0.75rem" }}
                            ></i>
                            Department <span className="text-danger">*</span>
                          </h6>
                        </div>
                        <div className="card-body p-3">
                          <select
                            name="department"
                            className={`form-select form-select-sm ${
                              isFieldEmpty("department") ? "is-invalid" : ""
                            }`}
                            value={newResearch.department || ""}
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
                                        Shelf:{" "}
                                        {selectedShelfLocation.shelf_number}
                                      </span>
                                      <span
                                        className="badge bg-success px-3 py-2"
                                        style={{ fontSize: "0.8rem" }}
                                      >
                                        Column:{" "}
                                        {selectedShelfLocation.shelf_column}
                                      </span>
                                      <span
                                        className="badge bg-warning px-3 py-2"
                                        style={{ fontSize: "0.8rem" }}
                                      >
                                        Row: {selectedShelfLocation.shelf_row}
                                      </span>
                                    </>
                                  ) : (
                                    <span
                                      className="badge bg-secondary px-3 py-2"
                                      style={{ fontSize: "0.8rem" }}
                                    >
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
                          <div
                            className="text-danger mt-2"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {isFieldEmpty("shelfLocationId") &&
                              "Shelf location is required"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Abstract */}
                <div className="col-md-7">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-light py-2">
                      <h6
                        className="card-title mb-0 fw-semibold"
                        style={{ fontSize: "0.8rem" }}
                      >
                        <i
                          className="bi bi-file-text me-2"
                          style={{ fontSize: "0.75rem" }}
                        ></i>
                        Abstract
                      </h6>
                    </div>
                    <div className="card-body p-3 d-flex flex-column">
                      <textarea
                        name="abstract"
                        className={`form-control form-control-sm flex-grow-1 ${
                          isFieldEmpty("abstract") ? "is-invalid" : ""
                        }`}
                        placeholder="Brief summary of the research paper. Include the main objectives, methodology, key findings, and conclusions."
                        value={newResearch.abstract || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        style={{
                          resize: "none",
                          minHeight: "520px",
                          fontSize: "0.8rem",
                        }}
                        required
                      />
                      {isFieldEmpty("abstract") && (
                        <div
                          className="invalid-feedback"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Abstract is required
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer py-2">
              <button
                className="btn btn-sm btn-light"
                onClick={handleModalClose}
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
                Save Research Paper
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

export default AddResearchModal;
