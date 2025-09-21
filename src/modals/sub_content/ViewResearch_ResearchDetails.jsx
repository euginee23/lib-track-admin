import React, { useState, useEffect } from "react";
import { FaEdit, FaSave, FaTimes, FaFileAlt, FaUser, FaBuilding, FaCalendar, FaBookOpen } from "react-icons/fa";
import SelectShelfLocation from "../../components/SelectShelfLocation";

function ViewResearchResearchDetails({ research }) {
  const [editMode, setEditMode] = useState(false);
  const [editedResearch, setEditedResearch] = useState(research || {});
  const [loading, setLoading] = useState(false);
  const [currentAuthor, setCurrentAuthor] = useState("");
  const [authors, setAuthors] = useState([]);
  const [showShelfSelector, setShowShelfSelector] = useState(false);

  useEffect(() => {
    if (research) {
      setEditedResearch(research);
      // Initialize authors array from research data
      if (research.authors) {
        if (Array.isArray(research.authors)) {
          setAuthors(research.authors);
        } else if (typeof research.authors === 'string') {
          setAuthors(research.authors.split(',').map(author => author.trim()).filter(author => author));
        }
      } else if (research.author) {
        if (typeof research.author === 'string') {
          setAuthors(research.author.split(',').map(author => author.trim()).filter(author => author));
        }
      }
    }
  }, [research]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedResearch((prev) => ({ ...prev, [name]: value }));
  };

  const addAuthor = () => {
    if (currentAuthor.trim() && !authors.includes(currentAuthor.trim())) {
      const updatedAuthors = [...authors, currentAuthor.trim()];
      setAuthors(updatedAuthors);
      setCurrentAuthor("");
      setEditedResearch((prev) => ({ 
        ...prev, 
        authors: updatedAuthors,
        author: updatedAuthors.join(", ")
      }));
    }
  };

  const removeAuthor = (indexToRemove) => {
    const updatedAuthors = authors.filter((_, index) => index !== indexToRemove);
    setAuthors(updatedAuthors);
    setEditedResearch((prev) => ({ 
      ...prev, 
      authors: updatedAuthors,
      author: updatedAuthors.join(", ")
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAuthor();
    }
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate save operation
    setTimeout(() => {
      setLoading(false);
      setEditMode(false);
    }, 1000);
  };

  const handleCancel = () => {
    setEditedResearch(research);
    setEditMode(false);
    // Reset authors array
    if (research.authors) {
      if (Array.isArray(research.authors)) {
        setAuthors(research.authors);
      } else if (typeof research.authors === 'string') {
        setAuthors(research.authors.split(',').map(author => author.trim()).filter(author => author));
      }
    } else if (research.author) {
      if (typeof research.author === 'string') {
        setAuthors(research.author.split(',').map(author => author.trim()).filter(author => author));
      }
    }
    setCurrentAuthor("");
  };

  if (!research) {
    return (
      <div className="text-center py-5">
        <FaFileAlt size={48} className="text-muted mb-3" />
        <h5 className="text-muted">No research data available</h5>
      </div>
    );
  }

  return (
    <div className="row g-3">
      {/* Main Content Area */}
      <div className="col-12">
        <div className="row g-3" style={{ height: "500px" }}>
          {/* Research Information Card - 35% width */}
          <div className="col-4" style={{ flex: "0 0 35%" }}>
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
                    <FaFileAlt className="me-1" size={14} />
                    Research Information
                  </h6>
                </div>
                <div className="row g-2">
                  <div className="col-12">
                    <div
                      className="d-flex flex-column p-2"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                      }}
                    >
                      <span className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
                        Title:
                      </span>
                      {editMode ? (
                        <textarea
                          name="research_title"
                          className="form-control form-control-sm"
                          style={{ fontSize: "0.875rem", resize: "none" }}
                          rows="3"
                          value={editedResearch.research_title || editedResearch.title || ""}
                          onChange={handleChange}
                          placeholder="Enter research title"
                        />
                      ) : (
                        <span className="fw-medium" style={{ lineHeight: "1.4" }}>
                          {research.research_title || research.title || "N/A"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <div
                      className="d-flex flex-column p-2"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                      }}
                    >
                      <span className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
                        <FaUser className="me-1" size={12} />
                        Author(s):
                      </span>
                      {editMode ? (
                        <div>
                          <div className="input-group input-group-sm mb-2">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Enter author name"
                              value={currentAuthor}
                              onChange={(e) => setCurrentAuthor(e.target.value)}
                              onKeyPress={handleKeyPress}
                            />
                            <button
                              className="btn btn-success btn-sm"
                              type="button"
                              onClick={addAuthor}
                              disabled={!currentAuthor.trim()}
                            >
                              Add
                            </button>
                          </div>
                          {/* Authors List */}
                          {authors.length > 0 && (
                            <div>
                              <small className="text-muted">Added Authors:</small>
                              <div className="d-flex flex-wrap gap-1 mt-1">
                                {authors.map((author, index) => (
                                  <span key={index} className="badge bg-light text-dark border d-flex align-items-center" style={{ fontSize: "0.7rem" }}>
                                    {author}
                                    <button
                                      type="button"
                                      className="btn-close btn-close-sm ms-1"
                                      style={{ fontSize: "0.5rem" }}
                                      onClick={() => removeAuthor(index)}
                                    ></button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="fw-medium">
                          {Array.isArray(research.authors)
                            ? research.authors.join(", ")
                            : research.authors || research.author || "N/A"}
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
                      <span className="text-muted" style={{ minWidth: "120px" }}>
                        <FaBuilding className="me-1" size={12} />
                        Department:
                      </span>
                      {editMode ? (
                        <input
                          name="department_name"
                          className="form-control form-control-sm"
                          style={{ flex: "1", marginLeft: "10px" }}
                          value={editedResearch.department_name || editedResearch.department || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="fw-medium">
                          {research.department_name || research.department || "N/A"}
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
                      <span className="text-muted" style={{ minWidth: "120px" }}>
                        <FaCalendar className="me-1" size={12} />
                        Year:
                      </span>
                      {editMode ? (
                        <input
                          name="year_publication"
                          className="form-control form-control-sm"
                          style={{ flex: "1", marginLeft: "10px" }}
                          value={editedResearch.year_publication || editedResearch.year || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span className="fw-medium">
                          {research.year_publication || research.year || "N/A"}
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
                      <span className="text-muted" style={{ minWidth: "120px" }}>
                        <FaBookOpen className="me-1" size={12} />
                        Shelf:
                      </span>
                      {editMode ? (
                        <div className="d-flex flex-column gap-2">
                          <div className="d-flex gap-2">
                            <span
                              className="badge bg-primary"
                              style={{ fontSize: "0.75rem" }}
                            >
                              Shelf: {editedResearch.shelf_number || "N/A"}
                            </span>
                            <span
                              className="badge bg-success"
                              style={{ fontSize: "0.75rem" }}
                            >
                              Column: {editedResearch.shelf_column || "N/A"}
                            </span>
                            <span
                              className="badge bg-warning"
                              style={{ fontSize: "0.75rem" }}
                            >
                              Row: {editedResearch.shelf_row || "N/A"}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm align-self-end"
                            onClick={() => setShowShelfSelector(true)}
                            style={{ fontSize: "0.75rem" }}
                          >
                            <i className="bi bi-grid-3x3-gap me-1" style={{ fontSize: "0.7rem" }}></i>
                            Select Location
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex gap-2">
                          <span
                            className="badge bg-primary"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Shelf: {research.shelf_number}
                          </span>
                          <span
                            className="badge bg-success"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Column: {research.shelf_column || "N/A"}
                          </span>
                          <span
                            className="badge bg-warning"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Row: {research.shelf_row || "N/A"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Abstract Card - 65% width */}
          <div className="col-8" style={{ flex: "0 0 65%" }}>
            <div
              className="card h-100"
              style={{
                border: "none",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
              }}
            >
              <div className="card-body p-3 d-flex flex-column">
                <h6
                  className="card-title text-muted mb-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  <FaFileAlt className="me-1" size={14} />
                  Abstract
                </h6>
                <div className="flex-grow-1">
                  {editMode ? (
                    <textarea
                      name="research_abstract"
                      className="form-control form-control-sm h-100"
                      style={{
                        fontSize: "0.875rem",
                        lineHeight: "1.5",
                        resize: "none",
                        minHeight: "420px",
                      }}
                      value={editedResearch.research_abstract || editedResearch.abstract || ""}
                      onChange={handleChange}
                      placeholder="Enter research abstract"
                    />
                  ) : (
                    <div
                      className="p-3 h-100"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "6px",
                        overflowY: "auto",
                        fontSize: "0.875rem",
                        lineHeight: "1.5",
                      }}
                    >
                      {research.research_abstract || research.abstract ? (
                        <p className="mb-0 text-dark">
                          {research.research_abstract || research.abstract}
                        </p>
                      ) : (
                        <p className="mb-0 text-muted fst-italic">
                          No abstract available for this research paper.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="col-12 mt-3 d-flex gap-2 justify-content-end">
        {editMode ? (
          <>
            <button
              className="btn btn-sm btn-success"
              style={{ width: "100px" }}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" style={{ width: "0.8rem", height: "0.8rem" }} />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
            <button
              className="btn btn-sm btn-secondary"
              style={{ width: "100px" }}
              onClick={handleCancel}
              disabled={loading}
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

      {/* Shelf Location Selector - Modal or Component */}
      {showShelfSelector && (
        <SelectShelfLocation
          onLocationSelect={(location) => {
            setEditedResearch((prev) => ({
              ...prev,
              shelf_number: location.shelf_number,
              shelf_column: location.shelf_column,
              shelf_row: location.shelf_row,
            }));
            setShowShelfSelector(false);
          }}
          showModal={showShelfSelector}
          onCloseModal={() => setShowShelfSelector(false)}
        />
      )}
    </div>
  );
}

export default ViewResearchResearchDetails;