import React, { useState } from "react";

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

  if (!show) return null;

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const isFieldEmpty = (name) => {
    return touched[name] && (!newResearch[name] || newResearch[name] === "");
  };

  const addAuthor = () => {
    if (currentAuthor.trim() && !authors.includes(currentAuthor.trim())) {
      const updatedAuthors = [...authors, currentAuthor.trim()];
      setAuthors(updatedAuthors);
      setCurrentAuthor("");
      // Update the main form data
      handleChange({
        target: {
          name: "author",
          value: updatedAuthors.join(", ")
        }
      });
    }
  };

  const removeAuthor = (indexToRemove) => {
    const updatedAuthors = authors.filter((_, index) => index !== indexToRemove);
    setAuthors(updatedAuthors);
    // Update the main form data
    handleChange({
      target: {
        name: "author",
        value: updatedAuthors.join(", ")
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAuthor();
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-sm-down" style={{ maxWidth: "70%" }}>
        <div className="modal-content shadow border-0 d-flex flex-column" style={{ minHeight: "75vh" }}>
          {/* Header */}
          <div className="modal-header py-1 wmsu-bg-primary text-white">
            <h6 className="modal-title fw-semibold mb-0">
              <i className="bi bi-file-text me-1"></i>
              Add Research Paper
            </h6>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body small p-3 flex-grow-1 d-flex flex-column">
            {/* Introduction text */}
            <p className="text-muted mb-3 small">
              Fill in the research paper details below. <span className="text-danger">*</span> indicates required fields.
            </p>
            
            <div className="row g-0 h-100">
              {/* Left side - Basic Information (40%) */}
              <div className="col-4 pe-3">
                <div className="row g-2">
                  {/* Title */}
                  <div className="col-12">
                    <div className="form-group mb-3">
                      <label className="form-label fw-semibold small mb-1">
                        Title <span className="text-danger">*</span>
                      </label>
                      <textarea
                        name="title"
                        className={`form-control form-control-sm ${isFieldEmpty("title") ? "is-invalid" : ""}`}
                        placeholder="Enter research paper title"
                        value={newResearch.title || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows="3"
                        style={{ resize: "none" }}
                        required
                      />
                      {isFieldEmpty("title") && <div className="invalid-feedback small">Required</div>}
                    </div>
                  </div>
                  
                  {/* Author */}
                  <div className="col-12">
                    <div className="form-group mb-3">
                      <label className="form-label fw-semibold small mb-1">
                        Author(s) <span className="text-danger">*</span>
                      </label>
                      <div className="input-group input-group-sm">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Enter author name"
                          value={currentAuthor}
                          onChange={(e) => setCurrentAuthor(e.target.value)}
                          onKeyPress={handleKeyPress}
                        />
                        <button
                          className="btn btn-outline-success"
                          type="button"
                          onClick={addAuthor}
                          disabled={!currentAuthor.trim()}
                        >
                          Add
                        </button>
                      </div>
                      {authors.length === 0 && touched.author && (
                        <div className="text-danger small mt-1">At least one author is required</div>
                      )}
                      
                      {/* Authors List */}
                      {authors.length > 0 && (
                        <div className="mt-2">
                          <small className="text-muted">Added Authors:</small>
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {authors.map((author, index) => (
                              <span key={index} className="badge bg-light text-dark border d-flex align-items-center">
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
                  
                  {/* Year */}
                  <div className="col-12">
                    <div className="form-group mb-3">
                      <label className="form-label fw-semibold small mb-1">Year</label>
                      <input
                        type="number"
                        name="year"
                        className="form-control form-control-sm"
                        placeholder="Year of publication"
                        value={newResearch.year || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  {/* Department */}
                  <div className="col-12">
                    <div className="form-group mb-3">
                      <label className="form-label fw-semibold small mb-1">Department</label>
                      <input
                        type="text"
                        name="department"
                        className="form-control form-control-sm"
                        placeholder="Computer Science, Biology, etc."
                        value={newResearch.department || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  {/* Shelf */}
                  <div className="col-12">
                    <div className="form-group mb-3">
                      <label className="form-label fw-semibold small mb-1">Shelf</label>
                      <input
                        type="text"
                        name="shelf"
                        className="form-control form-control-sm"
                        placeholder="Shelf location"
                        value={newResearch.shelf || ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Vertical separator */}
              <div className="col-auto">
                <div className="vr h-100"></div>
              </div>
              
              {/* Right side - Abstract (60%) */}
              <div className="col ps-3 d-flex flex-column">
                <div className="form-group flex-grow-1 d-flex flex-column">
                  <label className="form-label fw-semibold small mb-1">Abstract</label>
                  <textarea
                    name="abstract"
                    className="form-control form-control-sm flex-grow-1"
                    placeholder="Brief summary of the research paper. Include the main objectives, methodology, key findings, and conclusions."
                    value={newResearch.abstract || ""}
                    onChange={handleChange}
                    style={{ resize: "none", minHeight: "520px" }}
                  />
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
              <i className="bi bi-save me-1"></i> Save Research Paper
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddResearchModal;